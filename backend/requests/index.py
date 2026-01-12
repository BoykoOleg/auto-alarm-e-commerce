import json
import os
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: dict, context) -> dict:
    '''API для управления заявками на русификацию
    
    Endpoints:
    - GET /requests - получить все заявки, работы и историю бонусов пользователя
    - POST /requests - создать новую заявку
    '''
    
    method = event.get('httpMethod', 'GET')
    
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
    
    auth_header = event.get('headers', {}).get('X-Authorization', '')
    token = auth_header.replace('Bearer ', '')
    
    if not token:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'message': 'Authorization required'}),
            'isBase64Encoded': False
        }
    
    try:
        conn = psycopg2.connect(dsn)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute("""
            SELECT user_id FROM user_sessions
            WHERE session_token = %s AND expires_at > NOW()
        """, (token,))
        
        session = cur.fetchone()
        
        if not session:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': False, 'message': 'Invalid or expired token'}),
                'isBase64Encoded': False
            }
        
        user_id = session['user_id']
        
        if method == 'GET':
            return handle_get_requests(cur, user_id)
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            return handle_create_request(cur, conn, user_id, body)
        
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


def handle_get_requests(cur, user_id: int) -> dict:
    cur.execute("""
        SELECT 
            id, client_name, client_phone, client_email,
            car_brand, car_model, car_year, service_type,
            description, status, created_at, updated_at
        FROM russification_requests
        WHERE user_id = %s
        ORDER BY created_at DESC
    """, (user_id,))
    
    requests = [dict(row) for row in cur.fetchall()]
    
    for req in requests:
        if req['created_at']:
            req['created_at'] = req['created_at'].isoformat()
        if req['updated_at']:
            req['updated_at'] = req['updated_at'].isoformat()
    
    cur.execute("""
        SELECT 
            id, request_id, work_cost, bonus_earned, work_date, notes
        FROM completed_works
        WHERE user_id = %s
        ORDER BY work_date DESC
    """, (user_id,))
    
    works = [dict(row) for row in cur.fetchall()]
    
    for work in works:
        if work['work_date']:
            work['work_date'] = work['work_date'].isoformat()
        work['work_cost'] = float(work['work_cost'])
    
    cur.execute("""
        SELECT 
            id, amount, transaction_type, description, created_at
        FROM bonus_transactions
        WHERE user_id = %s
        ORDER BY created_at DESC
        LIMIT 50
    """, (user_id,))
    
    bonus_history = [dict(row) for row in cur.fetchall()]
    
    for bonus in bonus_history:
        if bonus['created_at']:
            bonus['created_at'] = bonus['created_at'].isoformat()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'success': True,
            'requests': requests,
            'works': works,
            'bonusHistory': bonus_history
        }),
        'isBase64Encoded': False
    }


def handle_create_request(cur, conn, user_id: int, body: dict) -> dict:
    client_name = body.get('client_name', '').strip()
    client_phone = body.get('client_phone', '').strip()
    client_email = body.get('client_email', '').strip()
    car_brand = body.get('car_brand', '').strip()
    car_model = body.get('car_model', '').strip()
    car_year = body.get('car_year')
    service_type = body.get('service_type', 'multimedia')
    description = body.get('description', '').strip()
    
    if not client_name or not client_phone or not car_brand or not car_model:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'message': 'Заполните все обязательные поля'}),
            'isBase64Encoded': False
        }
    
    cur.execute("""
        INSERT INTO russification_requests 
        (user_id, client_name, client_phone, client_email, car_brand, car_model, 
         car_year, service_type, description, status)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, 'pending')
        RETURNING id, created_at
    """, (user_id, client_name, client_phone, client_email, car_brand, car_model, 
          car_year, service_type, description))
    
    result = dict(cur.fetchone())
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'success': True,
            'request_id': result['id'],
            'message': 'Заявка успешно создана'
        }),
        'isBase64Encoded': False
    }
