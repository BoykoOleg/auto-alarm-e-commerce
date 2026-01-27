import json
import os
import urllib.request
import urllib.parse
import psycopg2
from psycopg2.extras import RealDictCursor

bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
site_url = os.environ.get('SITE_URL', 'https://proisvodnaya.poehali.dev')

user_states = {}

def handler(event: dict, context) -> dict:
    '''Telegram бот с inline-кнопками для приёма заявок
    
    Использует Telegram Bot API напрямую для совместимости с Cloud Functions
    '''
    method = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        body = event.get('body', '{}')
        print(f"=== INCOMING REQUEST ===")
        print(f"Method: {method}")
        print(f"Headers: {event.get('headers', {})}")
        print(f"Body: {body}")
        print(f"========================")
        
        update = json.loads(body)
        
        message = update.get('message', {})
        callback_query = update.get('callback_query', {})
        
        if callback_query:
            handle_callback(callback_query)
        elif message:
            handle_message(message)
        
        return ok_response()
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        print(traceback.format_exc())
        return ok_response()

def handle_message(message: dict):
    '''Обработка текстовых сообщений'''
    chat_id = message['chat']['id']
    text = message.get('text', '')
    user_id = message['from']['id']
    first_name = message['from'].get('first_name', 'друг')
    
    if text == '/start':
        send_welcome(chat_id, user_id, first_name)
    elif text.startswith('/'):
        return
    else:
        state = user_states.get(user_id, {})
        step = state.get('step')
        
        if step == 'waiting_reg_name':
            process_reg_name(chat_id, user_id, text)
        elif step == 'waiting_reg_phone':
            process_reg_phone(chat_id, user_id, text)
        elif step == 'waiting_reg_email':
            process_reg_email(chat_id, user_id, text)
        elif step == 'waiting_name':
            process_name(chat_id, user_id, text)
        elif step == 'waiting_phone':
            process_phone(chat_id, user_id, text)
        elif step == 'waiting_car':
            process_car(chat_id, user_id, text)
        elif step == 'waiting_message':
            process_message_text(chat_id, user_id, text)

def handle_callback(callback: dict):
    '''Обработка нажатий на inline-кнопки'''
    chat_id = callback['message']['chat']['id']
    message_id = callback['message']['message_id']
    user_id = callback['from']['id']
    data = callback['data']
    
    if data == 'main_menu':
        back_to_menu(chat_id, message_id, user_id)
    elif data == 'register':
        start_registration(chat_id, message_id, user_id)
    elif data == 'new_request':
        start_new_request(chat_id, message_id, user_id)
    elif data == 'my_requests':
        show_my_requests(chat_id, message_id, user_id)
    elif data == 'cancel':
        cancel_operation(chat_id, message_id, user_id)
    
    answer_callback(callback['id'])

def send_welcome(chat_id: int, user_id: int, first_name: str):
    '''Приветственное сообщение'''
    user_data = get_user_by_telegram(user_id)
    is_registered = user_data is not None
    
    if is_registered:
        text = f"👋 С возвращением, {user_data['name']}!\n\n🚗 Автосервис \"Химчистка\" готов помочь.\n\nВыберите действие:"
    else:
        text = f"👋 Привет, {first_name}!\n\n🚗 Я бот автосервиса \"Химчистка\".\n\n📌 Я помогу:\n• Оставить заявку на русификацию\n• Следить за статусом заявок\n• Получать уведомления\n\nВыберите действие:"
    
    keyboard = get_main_menu(is_registered)
    send_message(chat_id, text, keyboard)

def back_to_menu(chat_id: int, message_id: int, user_id: int):
    '''Возврат в главное меню'''
    if user_id in user_states:
        del user_states[user_id]
    
    user_data = get_user_by_telegram(user_id)
    is_registered = user_data is not None
    
    if is_registered:
        text = f"👋 С возвращением, {user_data['name']}!\n\n🚗 Автосервис \"Химчистка\" готов помочь.\n\nВыберите действие:"
    else:
        text = "👋 Главное меню\n\n🚗 Я бот автосервиса \"Химчистка\".\n\nВыберите действие:"
    
    keyboard = get_main_menu(is_registered)
    edit_message(chat_id, message_id, text, keyboard)

def start_registration(chat_id: int, message_id: int, user_id: int):
    '''Начало регистрации'''
    user_states[user_id] = {'step': 'waiting_reg_name'}
    
    text = "✅ Регистрация на сервисе\n\n📝 Как вас зовут?"
    keyboard = get_cancel_button()
    edit_message(chat_id, message_id, text, keyboard)

def process_reg_name(chat_id: int, user_id: int, name: str):
    '''Обработка имени при регистрации'''
    if len(name) < 2:
        send_message(chat_id, "❌ Имя слишком короткое. Введите ваше имя:")
        return
    
    user_states[user_id]['name'] = name
    user_states[user_id]['step'] = 'waiting_reg_phone'
    
    keyboard = get_cancel_button()
    send_message(chat_id, "📱 Укажите номер телефона:", keyboard)

def process_reg_phone(chat_id: int, user_id: int, phone: str):
    '''Обработка телефона при регистрации'''
    if len(phone) < 10:
        send_message(chat_id, "❌ Некорректный номер. Введите номер телефона:")
        return
    
    user_states[user_id]['phone'] = phone
    user_states[user_id]['step'] = 'waiting_reg_email'
    
    keyboard = get_cancel_button()
    send_message(chat_id, "📧 Укажите email для входа в личный кабинет:", keyboard)

def process_reg_email(chat_id: int, user_id: int, email: str):
    '''Завершение регистрации'''
    if '@' not in email or '.' not in email:
        send_message(chat_id, "❌ Некорректный email. Введите действительный email:")
        return
    
    state = user_states.get(user_id, {})
    name = state.get('name')
    phone = state.get('phone')
    
    success = register_user(user_id, None, name, phone, email)
    
    if success:
        if user_id in user_states:
            del user_states[user_id]
        
        buttons = [
            [{'text': '🆕 Создать заявку', 'callback_data': 'new_request'}],
            [{'text': '🌐 Перейти на сайт', 'web_app': {'url': site_url}}]
        ]
        
        text = f"✅ Регистрация завершена!\n\n👤 Имя: {name}\n📱 Телефон: {phone}\n📧 Email: {email}\n\n🔐 Пароль для входа отправлен на email."
        send_message(chat_id, text, {'inline_keyboard': buttons})
    else:
        send_message(chat_id, "❌ Ошибка регистрации. Возможно, email уже используется.\n\n/start - Вернуться в меню")
        if user_id in user_states:
            del user_states[user_id]

def start_new_request(chat_id: int, message_id: int, user_id: int):
    '''Начало создания заявки'''
    user_data = get_user_by_telegram(user_id)
    
    if user_data:
        user_states[user_id] = {
            'step': 'waiting_message',
            'user_data': user_data
        }
        
        text = f"✅ Вы зарегистрированы как {user_data['name']}\n\n💬 Опишите проблему или нужную услугу:"
        keyboard = get_cancel_button()
        edit_message(chat_id, message_id, text, keyboard)
    else:
        user_states[user_id] = {'step': 'waiting_name'}
        
        text = "📝 Создание заявки\n\n👤 Как вас зовут?"
        keyboard = get_cancel_button()
        edit_message(chat_id, message_id, text, keyboard)

def process_name(chat_id: int, user_id: int, name: str):
    '''Обработка имени'''
    if len(name) < 2:
        send_message(chat_id, "❌ Имя слишком короткое. Введите ваше имя:")
        return
    
    user_states[user_id]['name'] = name
    user_states[user_id]['step'] = 'waiting_phone'
    
    keyboard = get_cancel_button()
    send_message(chat_id, "📱 Укажите номер телефона:", keyboard)

def process_phone(chat_id: int, user_id: int, phone: str):
    '''Обработка телефона'''
    if len(phone) < 10:
        send_message(chat_id, "❌ Некорректный номер. Введите номер телефона:")
        return
    
    user_states[user_id]['phone'] = phone
    user_states[user_id]['step'] = 'waiting_car'
    
    keyboard = get_cancel_button()
    send_message(chat_id, "🚗 Какой у вас автомобиль? (марка и модель)", keyboard)

def process_car(chat_id: int, user_id: int, car: str):
    '''Обработка автомобиля'''
    if len(car) < 2:
        send_message(chat_id, "❌ Укажите марку и модель автомобиля:")
        return
    
    user_states[user_id]['car'] = car
    user_states[user_id]['step'] = 'waiting_message'
    
    keyboard = get_cancel_button()
    send_message(chat_id, "💬 Опишите проблему или нужную услугу:", keyboard)

def process_message_text(chat_id: int, user_id: int, message_text: str):
    '''Обработка описания и создание заявки'''
    state = user_states.get(user_id, {})
    
    if 'user_data' in state:
        user_data = state['user_data']
        name = user_data['name']
        phone = user_data['phone']
        email = user_data['email']
        user_db_id = user_data['id']
        car = "Не указан"
    else:
        name = state.get('name', 'Не указано')
        phone = state.get('phone', 'Не указан')
        email = None
        user_db_id = None
        car = state.get('car', 'Не указан')
    
    request_id = create_request_in_db(
        user_id=user_db_id,
        name=name,
        phone=phone,
        email=email,
        car=car,
        message=message_text
    )
    
    if request_id:
        notify_admin_new_request(request_id, name, phone, car, message_text)
        
        if user_id in user_states:
            del user_states[user_id]
        
        buttons = [
            [{'text': '🆕 Создать ещё заявку', 'callback_data': 'new_request'}],
            [{'text': '📋 Мои заявки', 'callback_data': 'my_requests'}],
            [{'text': '🌐 Перейти на сайт', 'web_app': {'url': site_url}}]
        ]
        
        text = f"✅ Заявка #{request_id} создана!\n\n📞 Мы свяжемся с вами в ближайшее время."
        send_message(chat_id, text, {'inline_keyboard': buttons})
    else:
        send_message(chat_id, "❌ Ошибка создания заявки. Попробуйте позже.\n\n/start - Вернуться в меню")
        if user_id in user_states:
            del user_states[user_id]

def show_my_requests(chat_id: int, message_id: int, user_id: int):
    '''Показать заявки пользователя'''
    requests = get_user_requests(user_id)
    
    if not requests:
        buttons = [
            [{'text': '🆕 Создать заявку', 'callback_data': 'new_request'}],
            [{'text': '◀️ Главное меню', 'callback_data': 'main_menu'}]
        ]
        
        text = "📋 У вас пока нет заявок"
        edit_message(chat_id, message_id, text, {'inline_keyboard': buttons})
        return
    
    text = "📋 Ваши заявки:\n\n"
    
    for req in requests:
        status_emoji = {
            'pending': '🆕',
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
        
        text += f"{status_emoji} Заявка #{req['id']}\n"
        text += f"Статус: {status_text}\n"
        text += f"Автомобиль: {req['car']}\n"
        text += f"Дата: {req['created_at'][:16]}\n\n"
    
    buttons = [
        [{'text': '🆕 Создать новую заявку', 'callback_data': 'new_request'}],
        [{'text': '◀️ Главное меню', 'callback_data': 'main_menu'}]
    ]
    
    edit_message(chat_id, message_id, text, {'inline_keyboard': buttons})

def cancel_operation(chat_id: int, message_id: int, user_id: int):
    '''Отмена операции'''
    if user_id in user_states:
        del user_states[user_id]
    
    user_data = get_user_by_telegram(user_id)
    is_registered = user_data is not None
    
    text = "❌ Операция отменена\n\nВыберите действие:"
    keyboard = get_main_menu(is_registered)
    edit_message(chat_id, message_id, text, keyboard)

def get_main_menu(is_registered: bool = False):
    '''Главное меню с inline-кнопками'''
    buttons = []
    
    if is_registered:
        buttons.append([{'text': '🆕 Создать заявку', 'callback_data': 'new_request'}])
        buttons.append([{'text': '📋 Мои заявки', 'callback_data': 'my_requests'}])
    else:
        buttons.append([{'text': '✅ Зарегистрироваться', 'callback_data': 'register'}])
        buttons.append([{'text': '📝 Создать заявку без регистрации', 'callback_data': 'new_request'}])
    
    buttons.append([{'text': '🌐 Перейти на сайт', 'web_app': {'url': site_url}}])
    
    return {'inline_keyboard': buttons}

def get_cancel_button():
    '''Кнопка отмены'''
    return {
        'inline_keyboard': [
            [{'text': '❌ Отменить', 'callback_data': 'cancel'}]
        ]
    }

def send_message(chat_id: int, text: str, keyboard=None):
    '''Отправка сообщения'''
    try:
        url = f'https://api.telegram.org/bot{bot_token}/sendMessage'
        
        data = {
            'chat_id': chat_id,
            'text': text
        }
        
        if keyboard:
            data['reply_markup'] = keyboard
        
        print(f"Sending message to {chat_id}: {text[:50]}...")
        print(f"Keyboard: {json.dumps(keyboard) if keyboard else 'None'}")
        
        req = urllib.request.Request(
            url,
            data=json.dumps(data).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        
        response = urllib.request.urlopen(req)
        print(f"Message sent successfully")
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8')
        print(f"Send message HTTP error {e.code}: {error_body}")
    except Exception as e:
        print(f"Send message error: {e}")
        import traceback
        print(traceback.format_exc())

def edit_message(chat_id: int, message_id: int, text: str, keyboard=None):
    '''Редактирование сообщения'''
    try:
        url = f'https://api.telegram.org/bot{bot_token}/editMessageText'
        
        data = {
            'chat_id': chat_id,
            'message_id': message_id,
            'text': text
        }
        
        if keyboard:
            data['reply_markup'] = keyboard
        
        req = urllib.request.Request(
            url,
            data=json.dumps(data).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        
        urllib.request.urlopen(req)
    except Exception as e:
        print(f"Edit message error: {e}")

def answer_callback(callback_id: str):
    '''Ответ на callback query'''
    try:
        url = f'https://api.telegram.org/bot{bot_token}/answerCallbackQuery'
        
        data = {'callback_query_id': callback_id}
        
        req = urllib.request.Request(
            url,
            data=json.dumps(data).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        
        urllib.request.urlopen(req)
    except:
        pass

def get_user_by_telegram(telegram_id: int):
    '''Получить пользователя по Telegram ID'''
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

def register_user(telegram_id: int, telegram_username: str, name: str, phone: str, email: str):
    '''Регистрация пользователя'''
    try:
        dsn = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        
        import secrets
        temp_password = secrets.token_urlsafe(12)
        
        cur.execute("""
            INSERT INTO users (telegram_id, telegram_username, name, email, phone, 
                             password_hash, user_type, user_role)
            VALUES (%s, %s, %s, %s, %s, %s, 'client', 'user')
            RETURNING id
        """, (telegram_id, telegram_username, name, email, phone, temp_password))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return True
    except Exception as e:
        print(f"Registration error: {e}")
        return False

def create_request_in_db(user_id, name, phone, email, car, message):
    '''Создание заявки'''
    try:
        dsn = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        
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

def get_user_requests(telegram_id: int):
    '''Получить заявки пользователя'''
    try:
        dsn = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(dsn)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
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
    '''Уведомление админа'''
    try:
        chat_id = os.environ.get('TELEGRAM_CHAT_ID')
        
        if not chat_id:
            return
        
        text = f"🔔 <b>Новая заявка из Telegram</b>\n\n"
        text += f"📝 Заявка #{request_id}\n"
        text += f"👤 Имя: {name}\n"
        text += f"📱 Телефон: {phone}\n"
        text += f"🚗 Автомобиль: {car}\n"
        text += f"💬 Сообщение: {message}"
        
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

def ok_response():
    '''Стандартный ответ'''
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'ok': True}),
        'isBase64Encoded': False
    }