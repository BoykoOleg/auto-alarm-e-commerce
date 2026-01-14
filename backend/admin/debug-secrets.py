import json
import os

def show_smtp_secrets(event: dict, context) -> dict:
    '''Показать SMTP секреты для отладки'''
    
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
