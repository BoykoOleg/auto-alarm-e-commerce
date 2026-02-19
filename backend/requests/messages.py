import json
import os
import base64
import boto3
import requests as http_requests
from datetime import datetime


def handle_get_messages(cur, request_id: int, user_id: int) -> dict:
    '''Получить все сообщения по заявке'''
    
    cur.execute(
        "SELECT id FROM russification_requests WHERE id = %s AND user_id = %s",
        (request_id, user_id)
    )
    
    if not cur.fetchone():
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'message': 'Заявка не найдена'}),
            'isBase64Encoded': False
        }
    
    cur.execute("""
        SELECT 
            id, 
            sender_type, 
            message_text, 
            file_url, 
            file_name, 
            file_type,
            created_at
        FROM request_messages
        WHERE request_id = %s
        ORDER BY created_at ASC
    """, (request_id,))
    
    messages = []
    for row in cur.fetchall():
        messages.append({
            'id': row['id'],
            'sender_type': row['sender_type'],
            'message_text': row['message_text'],
            'file_url': row['file_url'],
            'file_name': row['file_name'],
            'file_type': row['file_type'],
            'created_at': row['created_at'].isoformat() if row['created_at'] else None
        })
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True, 'messages': messages}),
        'isBase64Encoded': False
    }


def handle_send_message(cur, conn, request_id: int, user_id: int, data: dict) -> dict:
    '''Отправить сообщение в чат'''
    
    cur.execute(
        "SELECT id FROM russification_requests WHERE id = %s AND user_id = %s",
        (request_id, user_id)
    )
    
    if not cur.fetchone():
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'message': 'Заявка не найдена'}),
            'isBase64Encoded': False
        }
    
    message_text = data.get('message_text', '').strip()
    file_data = data.get('file')
    
    file_url = None
    file_name = None
    file_type = None
    
    if file_data:
        try:
            file_url, file_name, file_type = upload_file_to_s3(
                file_data.get('content'),
                file_data.get('name'),
                file_data.get('type')
            )
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': False, 'message': f'Ошибка загрузки файла: {str(e)}'}),
                'isBase64Encoded': False
            }
    
    if not message_text and not file_url:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'message': 'Сообщение или файл обязательны'}),
            'isBase64Encoded': False
        }
    
    cur.execute("""
        INSERT INTO request_messages 
        (request_id, user_id, sender_type, message_text, file_url, file_name, file_type)
        VALUES (%s, %s, 'client', %s, %s, %s, %s)
        RETURNING id, created_at
    """, (request_id, user_id, message_text or None, file_url, file_name, file_type))
    
    result = cur.fetchone()
    conn.commit()
    
    send_telegram_notification(cur, request_id, user_id, message_text, file_name)
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'success': True, 
            'message': 'Сообщение отправлено',
            'message_id': result['id'],
            'created_at': result['created_at'].isoformat()
        }),
        'isBase64Encoded': False
    }


def upload_file_to_s3(base64_content: str, file_name: str, file_type: str) -> tuple:
    '''Загрузить файл в S3 и вернуть URL'''
    
    s3 = boto3.client('s3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY']
    )
    
    file_content = base64.b64decode(base64_content)
    
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    safe_filename = f"requests/{timestamp}_{file_name}"
    
    s3.put_object(
        Bucket='files',
        Key=safe_filename,
        Body=file_content,
        ContentType=file_type
    )
    
    cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{safe_filename}"
    
    return cdn_url, file_name, file_type


def send_telegram_notification(cur, request_id: int, user_id: int, message_text: str, file_name: str = None):
    '''Отправить уведомление в Telegram при новом сообщении от клиента'''
    
    bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
    chat_id = os.environ.get('TELEGRAM_CHAT_ID')
    
    if not bot_token or not chat_id:
        return
    
    try:
        cur.execute("""
            SELECT u.name, u.phone, u.company_name,
                   r.car_brand, r.car_model, r.car_year, r.client_name
            FROM russification_requests r
            JOIN users u ON r.user_id = u.id
            WHERE r.id = %s
        """, (request_id,))
        
        data = cur.fetchone()
        if not data:
            return
        
        partner_name = data['name']
        partner_phone = data['phone']
        company_name = data['company_name'] or ''
        car_info = f"{data['car_brand']} {data['car_model']} ({data['car_year']})"
        client_name = data['client_name']
        
        notification = f"""💬 <b>Новое сообщение от клиента</b>

📝 Заявка #{request_id}
🚗 Автомобиль: {car_info}
👤 Клиент: {client_name}

👨‍💼 Партнёр: {partner_name}
{f'🏢 {company_name}' if company_name else ''}
📞 {partner_phone}

💭 Сообщение: {message_text or '(файл без текста)'}"""
        
        if file_name:
            notification += f"\n📎 Файл: {file_name}"
        
        keyboard = {
            'inline_keyboard': [
                [{'text': '💬 Ответить', 'callback_data': f'admin_reply_{request_id}'}]
            ]
        }
        
        http_requests.post(
            f'https://api.telegram.org/bot{bot_token}/sendMessage',
            json={
                'chat_id': chat_id,
                'text': notification,
                'parse_mode': 'HTML',
                'reply_markup': keyboard
            },
            timeout=5
        )
    except Exception as e:
        print(f"Telegram notification error: {e}")