import json
import os
import hashlib
import secrets
from datetime import datetime, timedelta
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: dict, context) -> dict:
    '''API для авторизации и регистрации партнёров
    
    Endpoints:
    - POST /auth?action=register - регистрация нового пользователя
    - POST /auth?action=login - вход в систему
    - GET /auth?action=verify - проверка токена
    '''
    
    method = event.get('httpMethod', 'POST')
    
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
    
    try:
        conn = psycopg2.connect(dsn)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action', 'login')
            
            if action == 'register':
                return handle_register(cur, conn, body)
            elif action == 'login':
                return handle_login(cur, conn, body)
        
        elif method == 'GET':
            query_params = event.get('queryStringParameters', {}) or {}
            action = query_params.get('action', '')
            
            if action == 'verify':
                auth_header = event.get('headers', {}).get('X-Authorization', '')
                token = auth_header.replace('Bearer ', '')
                return handle_verify(cur, token)
        
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


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def generate_token() -> str:
    return secrets.token_urlsafe(32)


def handle_register(cur, conn, body: dict) -> dict:
    email = body.get('email', '').strip().lower()
    password = body.get('password', '')
    name = body.get('name', '').strip()
    phone = body.get('phone', '').strip()
    company_name = body.get('company_name', '').strip()
    
    if not email or not password or not name:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'message': 'Заполните все обязательные поля'}),
            'isBase64Encoded': False
        }
    
    if len(password) < 6:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'message': 'Пароль должен быть минимум 6 символов'}),
            'isBase64Encoded': False
        }
    
    cur.execute("SELECT id FROM users WHERE email = %s", (email,))
    if cur.fetchone():
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'message': 'Email уже зарегистрирован'}),
            'isBase64Encoded': False
        }
    
    password_hash = hash_password(password)
    
    cur.execute("""
        INSERT INTO users (email, password_hash, name, phone, company_name, user_type, user_role, bonus_balance)
        VALUES (%s, %s, %s, %s, %s, 'partner', 'partner', 0)
        RETURNING id, email, name, phone, company_name, user_type, user_role, bonus_balance
    """, (email, password_hash, name, phone, company_name))
    
    user = dict(cur.fetchone())
    conn.commit()
    
    token = generate_token()
    expires_at = datetime.now() + timedelta(days=30)
    
    cur.execute("""
        INSERT INTO user_sessions (user_id, session_token, expires_at)
        VALUES (%s, %s, %s)
    """, (user['id'], token, expires_at))
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'success': True,
            'token': token,
            'user': {
                'id': user['id'],
                'email': user['email'],
                'name': user['name'],
                'phone': user['phone'],
                'company_name': user['company_name'],
                'user_type': user['user_type'],
                'user_role': user.get('user_role', 'partner'),
                'bonus_balance': user['bonus_balance']
            }
        }),
        'isBase64Encoded': False
    }


def handle_login(cur, conn, body: dict) -> dict:
    email = body.get('email', '').strip().lower()
    password = body.get('password', '')
    
    if not email or not password:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'message': 'Заполните все поля'}),
            'isBase64Encoded': False
        }
    
    password_hash = hash_password(password)
    
    cur.execute("""
        SELECT id, email, name, phone, company_name, user_type, user_role, bonus_balance
        FROM users
        WHERE email = %s AND password_hash = %s
    """, (email, password_hash))
    
    user = cur.fetchone()
    
    if not user:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'message': 'Неверный email или пароль'}),
            'isBase64Encoded': False
        }
    
    user = dict(user)
    
    token = generate_token()
    expires_at = datetime.now() + timedelta(days=30)
    
    cur.execute("""
        INSERT INTO user_sessions (user_id, session_token, expires_at)
        VALUES (%s, %s, %s)
    """, (user['id'], token, expires_at))
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'success': True,
            'token': token,
            'user': {
                'id': user['id'],
                'email': user['email'],
                'name': user['name'],
                'phone': user['phone'],
                'company_name': user['company_name'],
                'user_type': user['user_type'],
                'user_role': user.get('user_role', 'partner'),
                'bonus_balance': user['bonus_balance']
            }
        }),
        'isBase64Encoded': False
    }


def handle_verify(cur, token: str) -> dict:
    if not token:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'message': 'Token not provided'}),
            'isBase64Encoded': False
        }
    
    cur.execute("""
        SELECT u.id, u.email, u.name, u.phone, u.company_name, u.user_type, u.user_role, u.bonus_balance
        FROM user_sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.session_token = %s AND s.expires_at > NOW()
    """, (token,))
    
    user = cur.fetchone()
    
    if not user:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'message': 'Invalid or expired token'}),
            'isBase64Encoded': False
        }
    
    user = dict(user)
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'success': True,
            'user': {
                'id': user['id'],
                'email': user['email'],
                'name': user['name'],
                'phone': user['phone'],
                'company_name': user['company_name'],
                'user_type': user['user_type'],
                'user_role': user.get('user_role', 'partner'),
                'bonus_balance': user['bonus_balance']
            }
        }),
        'isBase64Encoded': False
    }