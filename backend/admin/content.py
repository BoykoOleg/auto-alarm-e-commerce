import json
import base64
import boto3
import os
from datetime import datetime

def upload_image_to_s3(base64_data: str, filename: str) -> str:
    try:
        image_data = base64.b64decode(base64_data.split(',')[1] if ',' in base64_data else base64_data)
        
        s3 = boto3.client('s3',
            endpoint_url='https://bucket.poehali.dev',
            aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
            aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY']
        )
        
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        key = f'content/{timestamp}_{filename}'
        
        content_type = 'image/jpeg'
        if base64_data.startswith('data:image/png'):
            content_type = 'image/png'
        elif base64_data.startswith('data:image/webp'):
            content_type = 'image/webp'
        
        s3.put_object(
            Bucket='files',
            Key=key,
            Body=image_data,
            ContentType=content_type
        )
        
        cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"
        return cdn_url
    except Exception as e:
        print(f"S3 upload error: {e}")
        return None

def handle_get_content(cur, content_type: str) -> dict:
    try:
        if content_type == 'works':
            cur.execute("""
                SELECT id, title, description, category, image_url, price, 
                       is_active, display_order, created_at, updated_at
                FROM portfolio_works
                ORDER BY display_order ASC, created_at DESC
            """)
        else:
            cur.execute("""
                SELECT id, title, description, category, image_url, price, 
                       stock_quantity, is_active, display_order, created_at, updated_at
                FROM products
                ORDER BY display_order ASC, created_at DESC
            """)
        
        items = [dict(row) for row in cur.fetchall()]
        
        for item in items:
            item['created_at'] = item['created_at'].isoformat() if item['created_at'] else None
            item['updated_at'] = item['updated_at'].isoformat() if item['updated_at'] else None
            item['price'] = float(item['price']) if item['price'] else None
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'items': items}),
            'isBase64Encoded': False
        }
    except Exception as e:
        print(f"Get content error: {e}")
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }

def handle_create_content(cur, conn, body: dict) -> dict:
    try:
        content_type = body.get('type', 'works')
        
        image_url = None
        if body.get('image_base64'):
            image_url = upload_image_to_s3(body['image_base64'], body.get('image_name', 'image.jpg'))
        
        if content_type == 'works':
            cur.execute("""
                INSERT INTO portfolio_works (title, description, category, image_url, price, display_order)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (
                body['title'],
                body.get('description'),
                body.get('category'),
                image_url,
                body.get('price'),
                body.get('display_order', 0)
            ))
        else:
            cur.execute("""
                INSERT INTO products (title, description, category, image_url, price, stock_quantity, display_order)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (
                body['title'],
                body.get('description'),
                body.get('category'),
                image_url,
                body['price'],
                body.get('stock_quantity', 0),
                body.get('display_order', 0)
            ))
        
        item_id = cur.fetchone()['id']
        conn.commit()
        
        return {
            'statusCode': 201,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'id': item_id, 'image_url': image_url}),
            'isBase64Encoded': False
        }
    except Exception as e:
        print(f"Create content error: {e}")
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }

def handle_update_content(cur, conn, body: dict) -> dict:
    try:
        content_type = body.get('type', 'works')
        item_id = body.get('id')
        
        if not item_id:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'ID required'}),
                'isBase64Encoded': False
            }
        
        image_url = body.get('image_url')
        if body.get('image_base64'):
            image_url = upload_image_to_s3(body['image_base64'], body.get('image_name', 'image.jpg'))
        
        if content_type == 'works':
            cur.execute("""
                UPDATE portfolio_works 
                SET title = %s, description = %s, category = %s, 
                    image_url = %s, price = %s, is_active = %s, display_order = %s
                WHERE id = %s
            """, (
                body['title'],
                body.get('description'),
                body.get('category'),
                image_url,
                body.get('price'),
                body.get('is_active', True),
                body.get('display_order', 0),
                item_id
            ))
        else:
            cur.execute("""
                UPDATE products 
                SET title = %s, description = %s, category = %s, 
                    image_url = %s, price = %s, stock_quantity = %s, 
                    is_active = %s, display_order = %s
                WHERE id = %s
            """, (
                body['title'],
                body.get('description'),
                body.get('category'),
                image_url,
                body['price'],
                body.get('stock_quantity', 0),
                body.get('is_active', True),
                body.get('display_order', 0),
                item_id
            ))
        
        conn.commit()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': True, 'image_url': image_url}),
            'isBase64Encoded': False
        }
    except Exception as e:
        print(f"Update content error: {e}")
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }

def handle_delete_content(cur, conn, body: dict) -> dict:
    try:
        content_type = body.get('type', 'works')
        item_id = body.get('id')
        
        if not item_id:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'ID required'}),
                'isBase64Encoded': False
            }
        
        if content_type == 'works':
            cur.execute("DELETE FROM portfolio_works WHERE id = %s", (item_id,))
        else:
            cur.execute("DELETE FROM products WHERE id = %s", (item_id,))
        
        conn.commit()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': True}),
            'isBase64Encoded': False
        }
    except Exception as e:
        print(f"Delete content error: {e}")
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
