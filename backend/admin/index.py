import json
import os
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: dict, context) -> dict:
    '''API для администрирования системы
    
    Endpoints:
    - GET /admin - получить все данные (заявки, пользователи, работы)
    - GET /admin?debug_secrets=1 - показать SMTP секреты для отладки
    - POST /admin - управление заявками и бонусами
      - action: update_status - изменить статус заявки
      - action: complete_work - завершить работу и начислить бонусы
      - action: pay_bonus - отметить бонус как выплаченный
    '''
    
    method = event.get('httpMethod', 'GET')
    query_params = event.get('queryStringParameters', {})
    body_data = {}
    if method == 'POST':
        try:
            body_data = json.loads(event.get('body', '{}'))
        except:
            body_data = {}
    
    if method == 'GET' and event.get('queryStringParameters', {}).get('debug_secrets') == '1':
        secrets = {
            'SMTP_HOST': os.environ.get('SMTP_HOST', 'НЕ ЗАДАН'),
            'SMTP_PORT': os.environ.get('SMTP_PORT', 'НЕ ЗАДАН'),
            'SMTP_USER': os.environ.get('SMTP_USER', 'НЕ ЗАДАН'),
            'SMTP_PASSWORD': os.environ.get('SMTP_PASSWORD', 'НЕ ЗАДАН'),
            'SMTP_PASSWORD_LENGTH': len(os.environ.get('SMTP_PASSWORD', '')) if os.environ.get('SMTP_PASSWORD') else 0,
            'SITE_URL': os.environ.get('SITE_URL', 'НЕ ЗАДАН')
        }
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(secrets, ensure_ascii=False),
            'isBase64Encoded': False
        }
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'message': 'Database not configured'}),
            'isBase64Encoded': False
        }
    
    request_id = query_params.get('request_id')
    action = query_params.get('action') or body_data.get('action')
    
    if action == 'upload_image':
        from content import upload_image_to_s3
        image_base64 = body_data.get('image_base64')
        if not image_base64:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': False, 'message': 'image_base64 required'}),
                'isBase64Encoded': False
            }
        image_url = upload_image_to_s3(image_base64, body_data.get('image_name', 'image.jpg'))
        if not image_url:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': False, 'message': 'Upload failed'}),
                'isBase64Encoded': False
            }
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': True, 'image_url': image_url}),
            'isBase64Encoded': False
        }
    
    try:
        conn = psycopg2.connect(dsn)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        if method == 'GET' and action == 'content':
            from content import handle_get_content
            content_type = query_params.get('type', 'works')
            return handle_get_content(cur, content_type)
        
        auth_header = event.get('headers', {}).get('X-Authorization', '')
        token = auth_header.replace('Bearer ', '')
        
        if not token:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': False, 'message': 'Authorization required'}),
                'isBase64Encoded': False
            }
        
        cur.execute("""
            SELECT u.id, u.user_role
            FROM user_sessions s
            JOIN users u ON s.user_id = u.id
            WHERE s.session_token = %s AND s.expires_at > NOW()
        """, (token,))
        
        session = cur.fetchone()
        
        if not session or session['user_role'] != 'admin':
            return {
                'statusCode': 403,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': False, 'message': 'Admin access required'}),
                'isBase64Encoded': False
            }
        
        if method == 'GET' and action == 'messages' and request_id:
            from messages import handle_get_admin_messages
            return handle_get_admin_messages(cur, int(request_id))
        elif method == 'GET':
            return handle_get_all_data(cur)
        elif method == 'POST' and action == 'send_message' and request_id:
            from messages import handle_send_admin_message
            body = json.loads(event.get('body', '{}'))
            return handle_send_admin_message(cur, conn, int(request_id), body)
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action', '')
            
            if action == 'update_status':
                return handle_update_status(cur, conn, body)
            elif action == 'complete_work':
                return handle_complete_work(cur, conn, body)
            elif action == 'pay_bonus':
                return handle_pay_bonus(cur, conn, body)
            elif action == 'delete_request':
                return handle_delete_request(cur, conn, body)
            elif action == 'create_content':
                from content import handle_create_content
                return handle_create_content(cur, conn, body)
            elif action == 'update_content':
                from content import handle_update_content
                return handle_update_content(cur, conn, body)
            elif action == 'delete_content':
                from content import handle_delete_content
                return handle_delete_content(cur, conn, body)
        
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'message': 'Invalid request'}),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'message': str(e)}),
            'isBase64Encoded': False
        }
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()


def handle_get_all_data(cur) -> dict:
    cur.execute("""
        SELECT 
            r.id, r.user_id, r.client_name, r.client_phone, r.client_email,
            r.car_brand, r.car_model, r.car_year, r.service_type,
            r.description, r.status, r.created_at, r.updated_at,
            COUNT(CASE WHEN m.is_read = FALSE AND m.sender_type = 'client' THEN 1 END) as unread_count
        FROM russification_requests r
        LEFT JOIN request_messages m ON r.id = m.request_id
        GROUP BY r.id
        ORDER BY r.created_at DESC
    """)
    
    requests = [dict(row) for row in cur.fetchall()]
    
    for req in requests:
        if req['created_at']:
            req['created_at'] = req['created_at'].isoformat()
        if req['updated_at']:
            req['updated_at'] = req['updated_at'].isoformat()
    
    cur.execute("""
        SELECT 
            id, email, name, phone, company_name, user_type, user_role, bonus_balance, created_at
        FROM users
        ORDER BY created_at DESC
    """)
    
    users = [dict(row) for row in cur.fetchall()]
    
    for user in users:
        if user['created_at']:
            user['created_at'] = user['created_at'].isoformat()
    
    cur.execute("""
        SELECT 
            id, request_id, user_id, work_cost, bonus_earned, work_date, is_bonus_paid, notes
        FROM completed_works
        ORDER BY work_date DESC
    """)
    
    works = [dict(row) for row in cur.fetchall()]
    
    for work in works:
        if work['work_date']:
            work['work_date'] = work['work_date'].isoformat()
        work['work_cost'] = float(work['work_cost'])
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'success': True,
            'requests': requests,
            'users': users,
            'works': works
        }),
        'isBase64Encoded': False
    }


def handle_update_status(cur, conn, body: dict) -> dict:
    request_id = body.get('request_id')
    status = body.get('status')
    
    if not request_id or not status:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'message': 'Missing required fields'}),
            'isBase64Encoded': False
        }
    
    cur.execute("""
        UPDATE russification_requests
        SET status = %s, updated_at = NOW()
        WHERE id = %s
    """, (status, request_id))
    
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True, 'message': 'Status updated'}),
        'isBase64Encoded': False
    }


def handle_complete_work(cur, conn, body: dict) -> dict:
    request_id = body.get('request_id')
    work_cost = body.get('work_cost')
    bonus_earned = body.get('bonus_earned', 0)
    
    if not request_id or work_cost is None:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'message': 'Missing required fields'}),
            'isBase64Encoded': False
        }
    
    cur.execute("SELECT user_id FROM russification_requests WHERE id = %s", (request_id,))
    request = cur.fetchone()
    
    if not request:
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'message': 'Request not found'}),
            'isBase64Encoded': False
        }
    
    user_id = request['user_id']
    
    cur.execute("""
        UPDATE russification_requests
        SET status = 'completed', updated_at = NOW()
        WHERE id = %s
    """, (request_id,))
    
    cur.execute("""
        INSERT INTO completed_works (request_id, user_id, work_cost, bonus_earned, is_bonus_paid)
        VALUES (%s, %s, %s, %s, FALSE)
        RETURNING id
    """, (request_id, user_id, work_cost, bonus_earned))
    
    work_id = cur.fetchone()['id']
    
    cur.execute("""
        UPDATE users
        SET bonus_balance = bonus_balance + %s
        WHERE id = %s
    """, (bonus_earned, user_id))
    
    cur.execute("""
        INSERT INTO bonus_transactions (user_id, work_id, amount, transaction_type, description)
        VALUES (%s, %s, %s, 'earned', %s)
    """, (user_id, work_id, bonus_earned, f'Начисление за заявку #{request_id}'))
    
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True, 'message': 'Work completed, bonus added'}),
        'isBase64Encoded': False
    }


def handle_pay_bonus(cur, conn, body: dict) -> dict:
    work_id = body.get('work_id')
    
    if not work_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'message': 'Missing work_id'}),
            'isBase64Encoded': False
        }
    
    cur.execute("""
        UPDATE completed_works
        SET is_bonus_paid = TRUE
        WHERE id = %s
    """, (work_id,))
    
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True, 'message': 'Bonus marked as paid'}),
        'isBase64Encoded': False
    }


def handle_delete_request(cur, conn, body: dict) -> dict:
    request_id = body.get('request_id')
    
    if not request_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'message': 'Missing request_id'}),
            'isBase64Encoded': False
        }
    
    cur.execute("DELETE FROM bonus_transactions WHERE work_id IN (SELECT id FROM completed_works WHERE request_id = %s)", (request_id,))
    cur.execute("DELETE FROM completed_works WHERE request_id = %s", (request_id,))
    cur.execute("DELETE FROM request_messages WHERE request_id = %s", (request_id,))
    cur.execute("DELETE FROM russification_requests WHERE id = %s", (request_id,))
    
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True, 'message': 'Request deleted'}),
        'isBase64Encoded': False
    }