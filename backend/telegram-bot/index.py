import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
import urllib.request
import urllib.parse
from datetime import datetime

# Хранилище состояний пользователей (в production лучше использовать Redis)
user_states = {}

def handler(event: dict, context) -> dict:
    '''Telegram бот для приёма заявок от клиентов
    
    Функционал:
    - Приём заявок от незарегистрированных пользователей через диалог
    - Быстрое создание заявок для зарегистрированных пользователей
    - Просмотр своих заявок
    - Webhook-based бот (работает 24/7)
    
    Требуемые секреты:
    - TELEGRAM_BOT_TOKEN: токен бота
    - TELEGRAM_CHAT_ID: ID админского чата для уведомлений
    - DATABASE_URL: подключение к БД
    '''
    
    method = event.get('httpMethod', 'POST')
    
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
    
    try:
        update = json.loads(event.get('body', '{}'))
        
        # Получаем сообщение от пользователя
        message = update.get('message', {})
        callback_query = update.get('callback_query', {})
        
        if callback_query:
            return handle_callback(callback_query)
        elif message:
            return handle_message(message)
        
        return ok_response()
        
    except Exception as e:
        print(f"Error: {e}")
        return ok_response()


def handle_message(message: dict) -> dict:
    '''Обработка текстовых сообщений'''
    chat_id = message['chat']['id']
    text = message.get('text', '')
    user_id = message['from']['id']
    username = message['from'].get('username', '')
    first_name = message['from'].get('first_name', 'Пользователь')
    
    # Команды
    if text == '/start':
        return send_welcome(chat_id, first_name)
    elif text == '/new':
        return start_new_request(chat_id, user_id)
    elif text == '/my':
        return show_my_requests(chat_id, user_id)
    elif text == '/cancel':
        return cancel_operation(chat_id, user_id)
    
    # Проверяем состояние пользователя
    state = user_states.get(user_id, {})
    current_step = state.get('step')
    
    if current_step == 'waiting_name':
        return process_name(chat_id, user_id, text)
    elif current_step == 'waiting_phone':
        return process_phone(chat_id, user_id, text)
    elif current_step == 'waiting_car':
        return process_car(chat_id, user_id, text)
    elif current_step == 'waiting_message':
        return process_message_text(chat_id, user_id, text)
    
    # По умолчанию показываем помощь
    return send_help(chat_id)


def send_welcome(chat_id: int, first_name: str) -> dict:
    '''Приветственное сообщение'''
    text = f"""👋 Привет, {first_name}!

Я бот автосервиса "Химчистка". Помогу оставить заявку на услуги.

Что я умею:
/new - Создать новую заявку
/my - Мои заявки
/cancel - Отменить текущее действие

Нажми /new чтобы начать! 🚗"""
    
    return send_message(chat_id, text)


def send_help(chat_id: int) -> dict:
    '''Справка'''
    text = """❓ Доступные команды:

/new - Создать новую заявку
/my - Посмотреть мои заявки
/cancel - Отменить текущее действие"""
    
    return send_message(chat_id, text)


def start_new_request(chat_id: int, user_id: int) -> dict:
    '''Начало создания заявки'''
    # Проверяем, зарегистрирован ли пользователь
    user_data = get_user_by_telegram(user_id)
    
    if user_data:
        # Пользователь зарегистрирован - предлагаем быструю заявку
        user_states[user_id] = {
            'step': 'waiting_message',
            'user_data': user_data
        }
        text = f"""✅ Вы зарегистрированы как {user_data['name']}

Опишите проблему или нужную услугу:"""
    else:
        # Новый пользователь - собираем данные
        user_states[user_id] = {'step': 'waiting_name'}
        text = """📝 Создание новой заявки

Как вас зовут?"""
    
    return send_message(chat_id, text)


def process_name(chat_id: int, user_id: int, name: str) -> dict:
    '''Обработка имени'''
    if len(name) < 2:
        return send_message(chat_id, "❌ Имя слишком короткое. Введите ваше имя:")
    
    user_states[user_id]['name'] = name
    user_states[user_id]['step'] = 'waiting_phone'
    
    return send_message(chat_id, "📱 Укажите ваш номер телефона:")


def process_phone(chat_id: int, user_id: int, phone: str) -> dict:
    '''Обработка телефона'''
    if len(phone) < 10:
        return send_message(chat_id, "❌ Некорректный номер. Введите номер телефона:")
    
    user_states[user_id]['phone'] = phone
    user_states[user_id]['step'] = 'waiting_car'
    
    return send_message(chat_id, "🚗 Какой у вас автомобиль? (марка и модель)")


def process_car(chat_id: int, user_id: int, car: str) -> dict:
    '''Обработка автомобиля'''
    if len(car) < 2:
        return send_message(chat_id, "❌ Укажите марку и модель автомобиля:")
    
    user_states[user_id]['car'] = car
    user_states[user_id]['step'] = 'waiting_message'
    
    return send_message(chat_id, "💬 Опишите проблему или нужную услугу:")


def process_message_text(chat_id: int, user_id: int, message_text: str) -> dict:
    '''Обработка описания проблемы и создание заявки'''
    state = user_states.get(user_id, {})
    
    # Получаем данные пользователя
    if 'user_data' in state:
        # Зарегистрированный пользователь
        user_data = state['user_data']
        name = user_data['name']
        phone = user_data['phone']
        email = user_data['email']
        user_db_id = user_data['id']
    else:
        # Новый пользователь
        name = state.get('name', 'Не указано')
        phone = state.get('phone', 'Не указан')
        email = None
        user_db_id = None
    
    car = state.get('car', 'Не указан')
    
    # Создаём заявку в базе
    request_id = create_request_in_db(
        user_id=user_db_id,
        name=name,
        phone=phone,
        email=email,
        car=car,
        message=message_text,
        source='telegram'
    )
    
    if request_id:
        # Отправляем уведомление админу
        notify_admin_new_request(request_id, name, phone, car, message_text)
        
        # Очищаем состояние
        if user_id in user_states:
            del user_states[user_id]
        
        text = f"""✅ Заявка #{request_id} успешно создана!

Мы свяжемся с вами в ближайшее время.

/new - Создать ещё заявку
/my - Мои заявки"""
        
        return send_message(chat_id, text)
    else:
        return send_message(chat_id, "❌ Ошибка создания заявки. Попробуйте позже.")


def show_my_requests(chat_id: int, user_id: int) -> dict:
    '''Показать заявки пользователя'''
    requests = get_user_requests(user_id)
    
    if not requests:
        return send_message(chat_id, "У вас пока нет заявок.\n\n/new - Создать заявку")
    
    text = "📋 Ваши заявки:\n\n"
    
    for req in requests:
        status_emoji = {
            'new': '🆕',
            'in_progress': '⏳',
            'completed': '✅',
            'cancelled': '❌'
        }.get(req['status'], '📝')
        
        status_text = {
            'pending': 'Новая',
            'in_progress': 'В работе',
            'completed': 'Завершена',
            'cancelled': 'Отменена'
        }.get(req['status'], req['status'])
        
        text += f"""{status_emoji} Заявка #{req['id']}
Статус: {status_text}
Автомобиль: {req['car']}
Дата: {req['created_at'][:16]}

"""
    
    text += "\n/new - Создать новую заявку"
    
    return send_message(chat_id, text)


def cancel_operation(chat_id: int, user_id: int) -> dict:
    '''Отмена текущей операции'''
    if user_id in user_states:
        del user_states[user_id]
        return send_message(chat_id, "❌ Операция отменена.\n\n/new - Создать заявку")
    else:
        return send_message(chat_id, "Нет активных операций.\n\n/new - Создать заявку")


def handle_callback(callback_query: dict) -> dict:
    '''Обработка inline кнопок'''
    # Пока не используется, но можно добавить в будущем
    return ok_response()


# === DATABASE FUNCTIONS ===

def get_user_by_telegram(telegram_id: int) -> dict:
    '''Проверка регистрации пользователя по Telegram ID'''
    try:
        dsn = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(dsn)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute("""
            SELECT id, name, email, phone 
            FROM users 
            WHERE telegram_id = %s
        """, (telegram_id,))
        
        user = cur.fetchone()
        cur.close()
        conn.close()
        
        return dict(user) if user else None
    except:
        return None


def create_request_in_db(user_id, name, phone, email, car, message, source) -> int:
    '''Создание заявки в БД'''
    try:
        dsn = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        
        # Разбиваем car на марку и модель
        car_parts = car.split(' ', 1)
        car_brand = car_parts[0] if len(car_parts) > 0 else 'Не указано'
        car_model = car_parts[1] if len(car_parts) > 1 else ''
        
        cur.execute("""
            INSERT INTO russification_requests 
            (user_id, client_name, client_phone, client_email, car_brand, car_model, 
             service_type, description, status, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, 'other', %s, 'pending', NOW())
            RETURNING id
        """, (user_id, name, phone, email, car_brand, car_model, message))
        
        request_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        
        return request_id
    except Exception as e:
        print(f"DB Error: {e}")
        return None


def get_user_requests(telegram_id: int) -> list:
    '''Получить заявки пользователя'''
    try:
        dsn = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(dsn)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # Пытаемся найти по telegram_id через users таблицу
        cur.execute("""
            SELECT r.id, r.status, r.car_brand || ' ' || r.car_model as car, r.created_at
            FROM russification_requests r
            LEFT JOIN users u ON r.user_id = u.id
            WHERE u.telegram_id = %s
            ORDER BY r.created_at DESC
            LIMIT 10
        """, (telegram_id,))
        
        requests = cur.fetchall()
        cur.close()
        conn.close()
        
        return [dict(r) for r in requests]
    except:
        return []


def notify_admin_new_request(request_id, name, phone, car, message):
    '''Уведомление админа о новой заявке'''
    try:
        bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
        chat_id = os.environ.get('TELEGRAM_CHAT_ID')
        
        if not bot_token or not chat_id:
            return
        
        text = f"""🔔 <b>Новая заявка из Telegram</b>

📝 Заявка #{request_id}
👤 Имя: {name}
📱 Телефон: {phone}
🚗 Автомобиль: {car}
💬 Сообщение: {message}"""
        
        url = f'https://api.telegram.org/bot{bot_token}/sendMessage'
        data = {
            'chat_id': chat_id,
            'text': text,
            'parse_mode': 'HTML'
        }
        
        req = urllib.request.Request(
            url,
            data=json.dumps(data).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        
        urllib.request.urlopen(req)
    except:
        pass


# === TELEGRAM API ===

def send_message(chat_id: int, text: str, keyboard=None) -> dict:
    '''Отправка сообщения пользователю'''
    try:
        bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
        url = f'https://api.telegram.org/bot{bot_token}/sendMessage'
        
        data = {
            'chat_id': chat_id,
            'text': text
        }
        
        if keyboard:
            data['reply_markup'] = keyboard
        
        req = urllib.request.Request(
            url,
            data=json.dumps(data).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        
        response = urllib.request.urlopen(req)
        result = json.loads(response.read().decode('utf-8'))
        print(f"Message sent successfully: {result.get('ok', False)}")
    except Exception as e:
        print(f"Send message error: {e}")
        import traceback
        print(traceback.format_exc())
    
    return ok_response()


def ok_response() -> dict:
    '''Стандартный ответ для Telegram webhook'''
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps({'ok': True}),
        'isBase64Encoded': False
    }