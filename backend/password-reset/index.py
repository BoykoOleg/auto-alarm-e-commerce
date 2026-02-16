import json
import os
import secrets
import requests
from datetime import datetime, timedelta
import hashlib
import psycopg2

def handler(event: dict, context) -> dict:
    '''Восстановление пароля по номеру телефона'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    try:
        body = event.get('body', '{}')
        if isinstance(body, str):
            data = json.loads(body) if body else {}
        else:
            data = body
        
        if isinstance(data, str):
            data = json.loads(data)
            
        action = data.get('action', 'request')
        
        if action == 'request':
            return handle_request(data)
        elif action == 'confirm':
            return handle_confirm(data)
        else:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Неверное действие'}),
                'isBase64Encoded': False
            }
            
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }


def normalize_phone(phone: str) -> str:
    digits = ''.join(c for c in phone if c.isdigit())
    if len(digits) == 10:
        digits = '7' + digits
    if len(digits) == 11 and digits[0] == '8':
        digits = '7' + digits[1:]
    return digits


def handle_request(data: dict) -> dict:
    '''Отправка кода восстановления через Telegram'''
    
    phone_raw = data.get('phone', '').strip()
    phone = normalize_phone(phone_raw)
    
    if not phone or len(phone) != 11:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Введите корректный номер телефона'}),
            'isBase64Encoded': False
        }
    
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    
    phone_escaped = phone.replace("'", "''")
    cur.execute(f"SELECT id, phone, name FROM users WHERE phone = '{phone_escaped}'")
    user = cur.fetchone()
    
    if not user:
        cur.close()
        conn.close()
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'message': 'Если номер зарегистрирован, код отправлен'}),
            'isBase64Encoded': False
        }
    
    user_id, user_phone, user_name = user
    
    code = ''.join([str(secrets.randbelow(10)) for _ in range(6)])
    expires_at = datetime.now() + timedelta(minutes=15)
    
    cur.execute(
        f"INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ({user_id}, '{code}', '{expires_at.isoformat()}')"
    )
    conn.commit()
    
    bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
    chat_id = os.environ.get('TELEGRAM_CHAT_ID')
    
    formatted = f"+7 ({phone[1:4]}) {phone[4:7]}-{phone[7:9]}-{phone[9:11]}"
    
    if bot_token and chat_id:
        message = f"""🔐 <b>Восстановление пароля</b>

👤 Пользователь: {user_name}
📱 Телефон: {formatted}

<b>Код восстановления: {code}</b>

⏰ Действителен 15 минут
🔒 Если это не вы, проигнорируйте сообщение"""
        
        try:
            requests.post(
                f'https://api.telegram.org/bot{bot_token}/sendMessage',
                json={
                    'chat_id': chat_id,
                    'text': message,
                    'parse_mode': 'HTML'
                },
                timeout=5
            )
        except:
            pass
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'message': 'Код восстановления отправлен администратору'}),
        'isBase64Encoded': False
    }


def handle_confirm(data: dict) -> dict:
    '''Установка нового пароля по коду'''
    
    code = data.get('code', '').strip()
    new_password = data.get('password', '').strip()
    
    if not code or not new_password:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Код и пароль обязательны'}),
            'isBase64Encoded': False
        }
    
    if len(new_password) < 6:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Пароль должен быть минимум 6 символов'}),
            'isBase64Encoded': False
        }
    
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    
    code_escaped = code.replace("'", "''")
    cur.execute(
        f"SELECT user_id, expires_at, used FROM password_reset_tokens WHERE token = '{code_escaped}'"
    )
    token_data = cur.fetchone()
    
    if not token_data:
        cur.close()
        conn.close()
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Неверный код'}),
            'isBase64Encoded': False
        }
    
    user_id, expires_at, used = token_data
    
    if used:
        cur.close()
        conn.close()
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Код уже использован'}),
            'isBase64Encoded': False
        }
    
    if datetime.now() > expires_at:
        cur.close()
        conn.close()
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Код истек'}),
            'isBase64Encoded': False
        }
    
    password_hash = hashlib.sha256(new_password.encode()).hexdigest()
    now = datetime.now().isoformat()
    
    cur.execute(
        f"UPDATE users SET password_hash = '{password_hash}', updated_at = '{now}' WHERE id = {user_id}"
    )
    
    cur.execute(
        f"UPDATE password_reset_tokens SET used = TRUE WHERE token = '{code_escaped}'"
    )
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'message': 'Пароль успешно изменен'}),
        'isBase64Encoded': False
    }
