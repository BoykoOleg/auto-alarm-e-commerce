import json
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def handler(event: dict, context) -> dict:
    '''Тестирование SMTP-соединения и отправки письма'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    smtp_host = os.environ.get('SMTP_HOST', 'не задан')
    smtp_port = os.environ.get('SMTP_PORT', 'не задан')
    smtp_user = os.environ.get('SMTP_USER', 'не задан')
    smtp_password_set = 'да' if os.environ.get('SMTP_PASSWORD') else 'нет'
    
    result = {
        'config': {
            'SMTP_HOST': smtp_host,
            'SMTP_PORT': smtp_port,
            'SMTP_USER': smtp_user,
            'SMTP_PASSWORD_SET': smtp_password_set
        }
    }
    
    if smtp_host == 'не задан' or smtp_port == 'не задан':
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(result),
            'isBase64Encoded': False
        }
    
    try:
        port = int(smtp_port)
        
        if port == 587:
            server = smtplib.SMTP(smtp_host, port, timeout=10)
            server.starttls()
        elif port == 465:
            server = smtplib.SMTP_SSL(smtp_host, port, timeout=10)
        else:
            server = smtplib.SMTP(smtp_host, port, timeout=10)
        
        result['connection'] = 'успех'
        
        if smtp_user and os.environ.get('SMTP_PASSWORD'):
            server.login(smtp_user, os.environ.get('SMTP_PASSWORD'))
            result['auth'] = 'успех'
            
            msg = MIMEMultipart('alternative')
            msg['Subject'] = 'Тест SMTP'
            msg['From'] = smtp_user
            msg['To'] = smtp_user
            
            html = '<html><body><h2>Тест успешен!</h2><p>SMTP работает корректно.</p></body></html>'
            part = MIMEText(html, 'html')
            msg.attach(part)
            
            server.send_message(msg)
            result['send'] = 'успех'
        
        server.quit()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(result),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        result['error'] = str(e)
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(result),
            'isBase64Encoded': False
        }
