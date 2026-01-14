import json
import os
import secrets
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
import hashlib
import psycopg2

def handler(event: dict, context) -> dict:
    '''Восстановление пароля: запрос и установка нового пароля'''
    
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


def handle_request(data: dict) -> dict:
    '''Отправка письма для восстановления пароля'''
    
    email = data.get('email', '').strip().lower()
    
    if not email:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Email обязателен'}),
            'isBase64Encoded': False
        }
    
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    
    cur.execute("SELECT id, email FROM users WHERE email = %s", (email,))
    user = cur.fetchone()
    
    if not user:
        cur.close()
        conn.close()
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'message': 'Если email существует, письмо отправлено'}),
            'isBase64Encoded': False
        }
    
    user_id, user_email = user
    
    token = secrets.token_urlsafe(32)
    expires_at = datetime.now() + timedelta(hours=1)
    
    cur.execute(
        "INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (%s, %s, %s)",
        (user_id, token, expires_at)
    )
    conn.commit()
    
    site_url = os.environ.get('SITE_URL', 'https://yoursite.com')
    reset_link = f"{site_url}/reset-password?token={token}"
    
    smtp_host = os.environ.get('SMTP_HOST')
    smtp_port = int(os.environ.get('SMTP_PORT', '465'))
    smtp_user = os.environ.get('SMTP_USER')
    smtp_password = os.environ.get('SMTP_PASSWORD')
    
    msg = MIMEMultipart('alternative')
    msg['Subject'] = 'Восстановление пароля'
    msg['From'] = smtp_user
    msg['To'] = user_email
    
    html = f"""
    <html>
        <body>
            <h2>Восстановление пароля</h2>
            <p>Вы запросили восстановление пароля.</p>
            <p>Перейдите по ссылке для установки нового пароля:</p>
            <p><a href="{reset_link}">{reset_link}</a></p>
            <p>Ссылка действительна 1 час.</p>
            <p>Если вы не запрашивали восстановление пароля, проигнорируйте это письмо.</p>
        </body>
    </html>
    """
    
    part = MIMEText(html, 'html')
    msg.attach(part)
    
    with smtplib.SMTP_SSL(smtp_host, smtp_port) as server:
        server.login(smtp_user, smtp_password)
        server.send_message(msg)
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'message': 'Если email существует, письмо отправлено'}),
        'isBase64Encoded': False
    }


def handle_confirm(data: dict) -> dict:
    '''Установка нового пароля по токену'''
    
    token = data.get('token', '').strip()
    new_password = data.get('password', '').strip()
    
    if not token or not new_password:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Токен и пароль обязательны'}),
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
    
    cur.execute(
        "SELECT user_id, expires_at, used FROM password_reset_tokens WHERE token = %s",
        (token,)
    )
    token_data = cur.fetchone()
    
    if not token_data:
        cur.close()
        conn.close()
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Неверный токен'}),
            'isBase64Encoded': False
        }
    
    user_id, expires_at, used = token_data
    
    if used:
        cur.close()
        conn.close()
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Токен уже использован'}),
            'isBase64Encoded': False
        }
    
    if datetime.now() > expires_at:
        cur.close()
        conn.close()
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Токен истек'}),
            'isBase64Encoded': False
        }
    
    password_hash = hashlib.sha256(new_password.encode()).hexdigest()
    
    cur.execute(
        "UPDATE users SET password_hash = %s, updated_at = %s WHERE id = %s",
        (password_hash, datetime.now(), user_id)
    )
    
    cur.execute(
        "UPDATE password_reset_tokens SET used = TRUE WHERE token = %s",
        (token,)
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