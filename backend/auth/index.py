import json
import os
import hashlib
import secrets
from datetime import datetime, timedelta
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: dict, context) -> dict:
    '''API для авторизации и регистрации по номеру телефона'''
    
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
        return error_response('Database not configured', 500)
    
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
        
        return error_response('Invalid request', 400)
    
    except Exception as e:
        return error_response(str(e), 500)
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()


def normalize_phone(phone: str) -> str:
    digits = ''.join(c for c in phone if c.isdigit())
    if len(digits) == 10:
        digits = '7' + digits
    if len(digits) == 11 and digits[0] == '8':
        digits = '7' + digits[1:]
    return digits


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def generate_token() -> str:
    return secrets.token_urlsafe(32)


def error_response(message: str, status: int = 400) -> dict:
    return {
        'statusCode': status,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': False, 'message': message}),
        'isBase64Encoded': False
    }


def user_dict(user: dict) -> dict:
    return {
        'id': user['id'],
        'name': user['name'],
        'phone': user['phone'],
        'email': user.get('email', ''),
        'company_name': user.get('company_name', ''),
        'user_type': user['user_type'],
        'user_role': user.get('user_role', 'partner'),
        'bonus_balance': user.get('bonus_balance', 0)
    }


def create_session(cur, conn, user_id: int) -> str:
    token = generate_token()
    expires_at = datetime.now() + timedelta(days=30)
    cur.execute("""
        INSERT INTO user_sessions (user_id, session_token, expires_at)
        VALUES (%s, %s, %s)
    """, (user_id, token, expires_at))
    conn.commit()
    return token


def handle_register(cur, conn, body: dict) -> dict:
    phone_raw = body.get('phone', '').strip()
    password = body.get('password', '')
    name = body.get('name', '').strip()
    company_name = body.get('company_name', '').strip()
    
    phone = normalize_phone(phone_raw)
    
    if not phone or not password or not name:
        return error_response('Заполните все обязательные поля')
    
    if len(phone) != 11:
        return error_response('Некорректный номер телефона')
    
    if len(password) < 6:
        return error_response('Пароль должен быть минимум 6 символов')
    
    cur.execute("SELECT id FROM users WHERE phone = %s", (phone,))
    if cur.fetchone():
        return error_response('Этот номер телефона уже зарегистрирован')
    
    password_hash = hash_password(password)
    
    cur.execute("""
        INSERT INTO users (email, password_hash, name, phone, company_name, user_type, user_role, bonus_balance)
        VALUES (%s, %s, %s, %s, %s, 'partner', 'partner', 0)
        RETURNING id, email, name, phone, company_name, user_type, user_role, bonus_balance
    """, ('', password_hash, name, phone, company_name))
    
    user = dict(cur.fetchone())
    conn.commit()
    
    token = create_session(cur, conn, user['id'])
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True, 'token': token, 'user': user_dict(user)}),
        'isBase64Encoded': False
    }


def handle_login(cur, conn, body: dict) -> dict:
    phone_raw = body.get('phone', '').strip()
    password = body.get('password', '')
    
    phone = normalize_phone(phone_raw)
    
    if not phone or not password:
        return error_response('Заполните все поля')
    
    password_hash = hash_password(password)
    
    cur.execute("""
        SELECT id, email, name, phone, company_name, user_type, user_role, bonus_balance
        FROM users
        WHERE phone = %s AND password_hash = %s
    """, (phone, password_hash))
    
    user = cur.fetchone()
    
    if not user:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'message': 'Неверный телефон или пароль'}),
            'isBase64Encoded': False
        }
    
    user = dict(user)
    token = create_session(cur, conn, user['id'])
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True, 'token': token, 'user': user_dict(user)}),
        'isBase64Encoded': False
    }


def handle_verify(cur, token: str) -> dict:
    if not token:
        return error_response('Token not provided', 401)
    
    cur.execute("""
        SELECT u.id, u.email, u.name, u.phone, u.company_name, u.user_type, u.user_role, u.bonus_balance
        FROM user_sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.session_token = %s AND s.expires_at > NOW()
    """, (token,))
    
    user = cur.fetchone()
    
    if not user:
        return error_response('Invalid or expired token', 401)
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True, 'user': user_dict(dict(user))}),
        'isBase64Encoded': False
    }
