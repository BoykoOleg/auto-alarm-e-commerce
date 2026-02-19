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
    '''Telegram бот SmartLine — автоопределение клиента по номеру телефона'''
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

    if method == 'GET':
        set_bot_commands()
        return ok_response({'status': 'commands set'})

    try:
        body = event.get('body', '{}')
        update = json.loads(body)
        print(f"Update: {json.dumps(update, ensure_ascii=False)[:500]}")

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
    '''Обработка входящих сообщений'''
    chat_id = message['chat']['id']
    text = message.get('text', '')
    user_id = message['from']['id']
    first_name = message['from'].get('first_name', 'друг')
    contact = message.get('contact')

    if contact:
        state = user_states.get(user_id, {})
        if state.get('step') == 'waiting_reg_phone':
            process_reg_phone_contact(chat_id, user_id, contact)
        else:
            process_shared_contact(chat_id, user_id, contact, first_name)
        return

    if text == '/start':
        handle_start(chat_id, user_id, first_name)
        return

    if text == '🚀 Начать':
        ask_phone(chat_id, user_id, first_name)
        return

    if text == '/password':
        handle_password_recovery(chat_id, user_id)
        return

    if text.startswith('/'):
        return

    state = user_states.get(user_id, {})
    step = state.get('step')

    if step == 'waiting_phone_text':
        process_phone_input(chat_id, user_id, text, first_name)
    elif step == 'waiting_reg_phone':
        process_reg_phone_text(chat_id, user_id, text)
    elif step == 'waiting_reg_name':
        process_reg_name(chat_id, user_id, text)
    elif step == 'waiting_car':
        process_car(chat_id, user_id, text)
    elif step == 'waiting_car_year':
        process_car_year(chat_id, user_id, text)
    elif step == 'waiting_message':
        process_message_text(chat_id, user_id, text)
    elif step == 'waiting_reply':
        process_reply_text(chat_id, user_id, text)
    elif step == 'waiting_admin_reply':
        process_admin_reply_text(chat_id, user_id, text)


def handle_callback(callback: dict):
    '''Обработка нажатий на inline-кнопки'''
    chat_id = callback['message']['chat']['id']
    message_id = callback['message']['message_id']
    user_id = callback['from']['id']
    first_name = callback['from'].get('first_name', 'друг')
    data = callback['data']

    if data == 'main_menu':
        back_to_menu(chat_id, message_id, user_id)
    elif data == 'recover_password':
        ask_password_confirmation(chat_id, message_id, user_id)
    elif data == 'confirm_password_reset':
        handle_password_recovery_inline(chat_id, message_id, user_id)
    elif data == 'register':
        start_registration(chat_id, message_id, user_id)
    elif data == 'register_with_contact_name':
        register_with_contact_name(chat_id, message_id, user_id)
    elif data == 'new_request':
        start_new_request(chat_id, message_id, user_id)
    elif data == 'my_requests':
        show_my_requests(chat_id, message_id, user_id)
    elif data == 'cancel':
        cancel_operation(chat_id, message_id, user_id)
    elif data == 'enter_phone_text':
        user_states[user_id] = {'step': 'waiting_phone_text'}
        edit_message(chat_id, message_id,
                     "📱 Введите ваш номер телефона:\n\n(например: +7 999 123-45-67)")
        contact_kb = {
            'keyboard': [
                [{'text': '📱 Отправить номер телефона', 'request_contact': True}]
            ],
            'resize_keyboard': True,
            'one_time_keyboard': True,
            'input_field_placeholder': '79991234567'
        }
        send_message(chat_id, "Или отправьте контакт кнопкой ниже 👇", contact_kb)

    elif data.startswith('reply_'):
        request_id = int(data.replace('reply_', ''))
        start_reply(chat_id, message_id, user_id, request_id)
    elif data.startswith('admin_reply_'):
        request_id = int(data.replace('admin_reply_', ''))
        start_admin_reply(chat_id, message_id, user_id, request_id)

    answer_callback(callback['id'])


def handle_start(chat_id: int, user_id: int, first_name: str):
    '''Обработка /start — проверяем, привязан ли уже Telegram'''
    if user_id in user_states:
        del user_states[user_id]

    user_data = get_user_by_telegram(user_id)

    if user_data:
        show_authorized_menu(chat_id, user_data)
    else:
        show_welcome_screen(chat_id, first_name)


def show_welcome_screen(chat_id: int, first_name: str):
    '''Приветственный экран с большой кнопкой СТАРТ для новых пользователей'''
    text = (
        f"👋 Привет, {first_name}!\n\n"
        f"🚗 Добро пожаловать в бот установочного центра \"SmartLine\"!\n\n"
        f"Мы занимаемся русификацией магнитол, навигации и бортовых систем автомобилей.\n\n"
        f"Нажмите кнопку ниже, чтобы начать 👇"
    )

    keyboard = {
        'keyboard': [
            [{'text': '🚀 Начать'}]
        ],
        'resize_keyboard': False,
        'one_time_keyboard': True
    }

    send_message(chat_id, text, keyboard)


def ask_phone(chat_id: int, user_id: int, first_name: str):
    '''Запрашиваем номер телефона для идентификации'''
    text = (
        f"👋 Привет, {first_name}!\n\n"
        f"🚗 Я бот установочного центра \"SmartLine\".\n\n"
        f"📱 Отправьте свой номер телефона, чтобы я проверил, "
        f"есть ли вы в нашей базе клиентов."
    )

    keyboard = {
        'keyboard': [
            [{'text': '📱 Отправить номер телефона', 'request_contact': True}]
        ],
        'resize_keyboard': True,
        'one_time_keyboard': True,
        'input_field_placeholder': '79991234567'
    }

    inline_keyboard = {
        'inline_keyboard': [
            [{'text': '✏️ Ввести номер вручную', 'callback_data': 'enter_phone_text'}]
        ]
    }

    send_message(chat_id, text, keyboard)
    send_message(chat_id, "Или нажмите кнопку ниже, чтобы ввести номер вручную:", inline_keyboard)


def process_shared_contact(chat_id: int, user_id: int, contact: dict, first_name: str):
    '''Обработка контакта, отправленного через кнопку'''
    phone = contact.get('phone_number', '')
    contact_name = contact.get('first_name', '')
    contact_last = contact.get('last_name', '')
    full_contact_name = f"{contact_name} {contact_last}".strip() if contact_name else first_name

    normalized = normalize_phone(phone)

    if len(normalized) != 11:
        send_message(chat_id, "❌ Не удалось определить номер. Попробуйте ввести вручную.")
        user_states[user_id] = {'step': 'waiting_phone_text'}
        return

    check_phone_in_db(chat_id, user_id, normalized, first_name, contact_full_name=full_contact_name)


def process_phone_input(chat_id: int, user_id: int, phone_text: str, first_name: str):
    '''Обработка номера, введённого вручную'''
    normalized = normalize_phone(phone_text)

    if len(normalized) != 11:
        send_message(chat_id, "❌ Некорректный номер. Введите номер телефона (например: +7 999 123-45-67):")
        return

    check_phone_in_db(chat_id, user_id, normalized, first_name)


def check_phone_in_db(chat_id: int, user_id: int, phone: str, first_name: str, contact_full_name: str = ''):
    '''Ключевая логика: проверяем телефон в базе'''
    if user_id in user_states:
        del user_states[user_id]

    user_data = get_user_by_phone(phone)

    remove_reply_keyboard(chat_id)

    if user_data:
        link_telegram(user_data['id'], user_id)
        user_data['telegram_id'] = user_id

        formatted_phone = format_phone(phone)
        text = (
            f"✅ Нашёл вас в базе!\n\n"
            f"👤 {user_data['name']}\n"
            f"📱 {formatted_phone}\n\n"
            f"Ваш аккаунт привязан к Telegram. Теперь вы можете "
            f"просматривать свои заявки и создавать новые."
        )

        keyboard = get_registered_menu()
        send_message(chat_id, text, keyboard)
    else:
        formatted_phone = format_phone(phone)
        saved_name = contact_full_name or ''
        user_states[user_id] = {'phone': phone, 'contact_name': saved_name}

        if saved_name:
            text = (
                f"🔍 Номер {formatted_phone} не найден в базе.\n\n"
                f"Хотите зарегистрироваться как <b>{saved_name}</b>?"
            )
            keyboard = {
                'inline_keyboard': [
                    [{'text': f'✅ Да, я {saved_name}', 'callback_data': 'register_with_contact_name'}],
                    [{'text': '✏️ Ввести другое имя', 'callback_data': 'register'}],
                    [{'text': '📝 Оставить заявку без регистрации', 'callback_data': 'new_request'}]
                ]
            }
            send_message(chat_id, text, keyboard, parse_mode='HTML')
        else:
            text = (
                f"🔍 Номер {formatted_phone} не найден в базе.\n\n"
                f"Хотите зарегистрироваться? Это займёт пару секунд."
            )
            keyboard = {
                'inline_keyboard': [
                    [{'text': '✅ Зарегистрироваться', 'callback_data': 'register'}],
                    [{'text': '📝 Оставить заявку без регистрации', 'callback_data': 'new_request'}]
                ]
            }
            send_message(chat_id, text, keyboard)


def show_authorized_menu(chat_id: int, user_data: dict):
    '''Меню для авторизованного пользователя'''
    text = (
        f"👋 С возвращением, {user_data['name']}!\n\n"
        f"🚗 Я бот установочного центра \"SmartLine\".\n\n"
        f"Выберите действие:"
    )

    keyboard = get_registered_menu()
    send_message(chat_id, text, keyboard)


def get_registered_menu():
    '''Меню для зарегистрированного пользователя'''
    return {
        'inline_keyboard': [
            [{'text': '🆕 Создать заявку', 'callback_data': 'new_request'}],
            [{'text': '📋 Мои заявки', 'callback_data': 'my_requests'}],
            [{'text': '🔑 Восстановление пароля', 'callback_data': 'recover_password'}],
            [{'text': '🌐 Открыть сайт', 'web_app': {'url': site_url}}]
        ]
    }


def register_with_contact_name(chat_id: int, message_id: int, user_id: int):
    '''Мгновенная регистрация с именем из контакта'''
    state = user_states.get(user_id, {})
    phone = state.get('phone')
    name = state.get('contact_name', '')

    if not phone or not name:
        edit_message(chat_id, message_id, "❌ Что-то пошло не так. Начните заново: /start")
        return

    edit_message(chat_id, message_id, "⏳ Регистрирую...")
    complete_registration(chat_id, user_id, name, phone)


def start_registration(chat_id: int, message_id: int, user_id: int):
    '''Начало регистрации — спрашиваем имя'''
    state = user_states.get(user_id, {})
    phone = state.get('phone')

    user_states[user_id] = {'step': 'waiting_reg_name', 'phone': phone}

    text = "✅ Регистрация\n\n📝 Как вас зовут?"
    edit_message(chat_id, message_id, text, get_cancel_button())


def process_reg_name(chat_id: int, user_id: int, name: str):
    '''Обработка имени при регистрации'''
    if len(name.strip()) < 2:
        send_message(chat_id, "❌ Имя слишком короткое. Введите ваше имя:")
        return

    state = user_states.get(user_id, {})
    phone = state.get('phone')

    if not phone:
        user_states[user_id] = {'step': 'waiting_reg_phone', 'name': name.strip()}
        contact_keyboard = {
            'keyboard': [
                [{'text': '📱 Отправить номер телефона', 'request_contact': True}]
            ],
            'resize_keyboard': True,
            'one_time_keyboard': True,
            'input_field_placeholder': '79991234567'
        }
        send_message(chat_id, "📱 Отправьте свой контакт или введите номер вручную:", contact_keyboard)
        return

    import secrets as sec
    password = sec.token_urlsafe(8)

    success = register_user(user_id, name.strip(), phone, password)

    if success:
        if user_id in user_states:
            del user_states[user_id]

        formatted_phone = format_phone(phone)
        text = (
            f"✅ Регистрация завершена!\n\n"
            f"👤 Имя: {name.strip()}\n"
            f"📱 Телефон: {formatted_phone}\n\n"
            f"🔐 Ваш пароль для входа на сайт:\n"
            f"<code>{password}</code>\n\n"
            f"⚠️ Сохраните пароль! Он нужен для входа в личный кабинет."
        )

        keyboard = get_registered_menu()
        send_message(chat_id, text, keyboard, parse_mode='HTML')
    else:
        send_message(chat_id, "❌ Ошибка регистрации. Возможно, этот номер уже зарегистрирован.\n\n/start - Попробовать снова")
        if user_id in user_states:
            del user_states[user_id]


def complete_registration(chat_id: int, user_id: int, name: str, phone: str):
    '''Завершение регистрации с именем и телефоном'''
    import secrets as sec
    password = sec.token_urlsafe(8)

    remove_reply_keyboard(chat_id)

    success = register_user(user_id, name, phone, password)

    if success:
        if user_id in user_states:
            del user_states[user_id]

        formatted_phone = format_phone(phone)
        text = (
            f"✅ Регистрация завершена!\n\n"
            f"👤 Имя: {name}\n"
            f"📱 Телефон: {formatted_phone}\n\n"
            f"🔐 Ваш пароль для входа на сайт:\n"
            f"<code>{password}</code>\n\n"
            f"⚠️ Сохраните пароль! Он нужен для входа в личный кабинет."
        )

        keyboard = get_registered_menu()
        send_message(chat_id, text, keyboard, parse_mode='HTML')
    else:
        send_message(chat_id, "❌ Ошибка регистрации. Возможно, этот номер уже зарегистрирован.\n\n/start - Попробовать снова")
        if user_id in user_states:
            del user_states[user_id]


def process_reg_phone_contact(chat_id: int, user_id: int, contact: dict):
    '''Обработка контакта при регистрации'''
    state = user_states.get(user_id, {})
    name = state.get('name')

    if not name:
        send_message(chat_id, "❌ Что-то пошло не так. Начните заново: /start")
        return

    phone = contact.get('phone_number', '')
    normalized = normalize_phone(phone)

    if len(normalized) != 11:
        send_message(chat_id, "❌ Не удалось определить номер из контакта. Введите номер вручную:")
        user_states[user_id] = {'step': 'waiting_reg_phone', 'name': name}
        return

    complete_registration(chat_id, user_id, name, normalized)


def process_reg_phone_text(chat_id: int, user_id: int, phone_text: str):
    '''Обработка номера вручную при регистрации'''
    state = user_states.get(user_id, {})
    name = state.get('name')

    if not name:
        send_message(chat_id, "❌ Что-то пошло не так. Начните заново: /start")
        return

    normalized = normalize_phone(phone_text)

    if len(normalized) != 11:
        send_message(chat_id, "❌ Некорректный номер. Введите номер телефона (например: +7 999 123-45-67):")
        return

    complete_registration(chat_id, user_id, name, normalized)


def start_new_request(chat_id: int, message_id: int, user_id: int):
    '''Начало создания заявки'''
    user_data = get_user_by_telegram(user_id)

    if user_data:
        user_states[user_id] = {
            'step': 'waiting_car',
            'user_data': user_data
        }

        text = f"🆕 Новая заявка\n\n🚗 Какой у вас автомобиль? (марка и модель)"
        edit_message(chat_id, message_id, text, get_cancel_button())
    else:
        state = user_states.get(user_id, {})
        phone = state.get('phone')

        if phone:
            user_states[user_id] = {
                'step': 'waiting_car',
                'phone': phone,
                'name': state.get('name', 'Клиент')
            }
            text = "🆕 Новая заявка\n\n🚗 Какой у вас автомобиль? (марка и модель)"
            edit_message(chat_id, message_id, text, get_cancel_button())
        else:
            user_states[user_id] = {'step': 'waiting_phone_text', 'intent': 'request'}
            edit_message(chat_id, message_id,
                         "📱 Для создания заявки укажите ваш номер телефона:",
                         get_cancel_button())


def process_car(chat_id: int, user_id: int, car: str):
    '''Обработка автомобиля (марка и модель)'''
    if len(car.strip()) < 2:
        send_message(chat_id, "❌ Укажите марку и модель автомобиля:")
        return

    user_states[user_id]['car'] = car.strip()
    user_states[user_id]['step'] = 'waiting_car_year'

    send_message(chat_id, "📅 Укажите год выпуска автомобиля:", get_cancel_button())


def process_car_year(chat_id: int, user_id: int, year_text: str):
    '''Обработка года выпуска'''
    year_text = year_text.strip()
    if not year_text.isdigit() or len(year_text) != 4:
        send_message(chat_id, "❌ Введите год в формате ГГГГ (например: 2020):")
        return

    year = int(year_text)
    if year < 1990 or year > 2030:
        send_message(chat_id, "❌ Введите корректный год (1990–2030):")
        return

    user_states[user_id]['car_year'] = year
    user_states[user_id]['step'] = 'waiting_message'

    send_message(chat_id, "💬 Опишите проблему или нужную услугу:", get_cancel_button())


def process_message_text(chat_id: int, user_id: int, message_text: str):
    '''Обработка описания и создание заявки'''
    state = user_states.get(user_id, {})

    if 'user_data' in state:
        user_data = state['user_data']
        name = user_data['name']
        phone = user_data['phone']
        email = user_data.get('email')
        user_db_id = user_data['id']
    else:
        name = state.get('name', 'Клиент')
        phone = state.get('phone', 'Не указан')
        email = None
        user_db_id = None

    car = state.get('car', 'Не указан')
    car_year = state.get('car_year')
    car_plate = ''

    request_id = create_request_in_db(
        user_id=user_db_id,
        name=name,
        phone=phone,
        email=email,
        car=car,
        car_year=car_year,
        car_plate=car_plate,
        message=message_text
    )

    if request_id:
        car_full = car
        if car_year:
            car_full += f" ({car_year})"
        notify_admin_new_request(request_id, name, phone, car_full, message_text)

        if user_id in user_states:
            del user_states[user_id]

        buttons = {
            'inline_keyboard': [
                [{'text': '🆕 Создать ещё заявку', 'callback_data': 'new_request'}],
                [{'text': '📋 Мои заявки', 'callback_data': 'my_requests'}],
                [{'text': '🌐 Открыть сайт', 'web_app': {'url': site_url}}]
            ]
        }

        text = f"✅ Заявка #{request_id} создана!\n\n📞 Мы свяжемся с вами в ближайшее время."
        send_message(chat_id, text, buttons)
    else:
        send_message(chat_id, "❌ Ошибка создания заявки. Попробуйте позже.\n\n/start - Вернуться в меню")
        if user_id in user_states:
            del user_states[user_id]


def show_my_requests(chat_id: int, message_id: int, user_id: int):
    '''Показать заявки пользователя'''
    requests = get_user_requests(user_id)

    if not requests:
        buttons = {
            'inline_keyboard': [
                [{'text': '🆕 Создать заявку', 'callback_data': 'new_request'}],
                [{'text': '◀️ Главное меню', 'callback_data': 'main_menu'}]
            ]
        }
        edit_message(chat_id, message_id, "📋 У вас пока нет заявок", buttons)
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
        text += f"Дата: {str(req['created_at'])[:16]}\n\n"

    buttons = {
        'inline_keyboard': [
            [{'text': '🆕 Создать новую заявку', 'callback_data': 'new_request'}],
            [{'text': '◀️ Главное меню', 'callback_data': 'main_menu'}]
        ]
    }

    edit_message(chat_id, message_id, text, buttons)


def back_to_menu(chat_id: int, message_id: int, user_id: int):
    '''Возврат в главное меню'''
    if user_id in user_states:
        del user_states[user_id]

    user_data = get_user_by_telegram(user_id)

    if user_data:
        text = f"👋 {user_data['name']}, выберите действие:"
        keyboard = get_registered_menu()
    else:
        text = "Выберите действие:"
        keyboard = {
            'inline_keyboard': [
                [{'text': '📱 Ввести номер телефона', 'callback_data': 'enter_phone_text'}]
            ]
        }

    edit_message(chat_id, message_id, text, keyboard)


def cancel_operation(chat_id: int, message_id: int, user_id: int):
    '''Отмена операции'''
    if user_id in user_states:
        del user_states[user_id]

    user_data = get_user_by_telegram(user_id)

    if user_data:
        text = "❌ Операция отменена\n\nВыберите действие:"
        keyboard = get_registered_menu()
    else:
        text = "❌ Операция отменена\n\nНажмите /start чтобы начать заново."
        keyboard = None

    edit_message(chat_id, message_id, text, keyboard)


def start_reply(chat_id: int, message_id: int, user_id: int, request_id: int):
    '''Клиент начинает отвечать на сообщение по заявке'''
    user_states[user_id] = {'step': 'waiting_reply', 'request_id': request_id}
    text = f"💬 Ответ на заявку #{request_id}\n\nНапишите сообщение:"
    edit_message(chat_id, message_id, text, get_cancel_button())


def start_admin_reply(chat_id: int, message_id: int, user_id: int, request_id: int):
    '''Админ начинает отвечать на сообщение клиента'''
    user_states[user_id] = {'step': 'waiting_admin_reply', 'request_id': request_id}
    text = f"💬 Ответ от компании на заявку #{request_id}\n\nНапишите сообщение:"
    edit_message(chat_id, message_id, text, get_cancel_button())


def process_reply_text(chat_id: int, user_id: int, text: str):
    '''Обработка ответа клиента из Telegram'''
    state = user_states.get(user_id, {})
    request_id = state.get('request_id')

    if not request_id:
        send_message(chat_id, "❌ Ошибка. Начните заново: /start")
        return

    if len(text.strip()) < 1:
        send_message(chat_id, "❌ Сообщение не может быть пустым. Напишите текст:")
        return

    success = save_client_message(user_id, request_id, text.strip())

    if user_id in user_states:
        del user_states[user_id]

    if success:
        buttons = {
            'inline_keyboard': [
                [{'text': '💬 Написать ещё', 'callback_data': f'reply_{request_id}'}],
                [{'text': '◀️ Главное меню', 'callback_data': 'main_menu'}]
            ]
        }
        send_message(chat_id, f"✅ Сообщение отправлено по заявке #{request_id}", buttons)
    else:
        send_message(chat_id, "❌ Не удалось отправить сообщение. Возможно, заявка не найдена.\n\n/start - Меню")


def process_admin_reply_text(chat_id: int, user_id: int, text: str):
    '''Обработка ответа админа из Telegram'''
    state = user_states.get(user_id, {})
    request_id = state.get('request_id')

    if not request_id:
        send_message(chat_id, "❌ Ошибка. Попробуйте снова.")
        return

    if len(text.strip()) < 1:
        send_message(chat_id, "❌ Сообщение не может быть пустым. Напишите текст:")
        return

    success = save_admin_message(request_id, text.strip())

    if user_id in user_states:
        del user_states[user_id]

    if success:
        buttons = {
            'inline_keyboard': [
                [{'text': '💬 Написать ещё', 'callback_data': f'admin_reply_{request_id}'}]
            ]
        }
        send_message(chat_id, f"✅ Ответ отправлен клиенту по заявке #{request_id}", buttons)
    else:
        send_message(chat_id, "❌ Не удалось отправить сообщение.")


def save_client_message(telegram_id: int, request_id: int, message_text: str) -> bool:
    '''Сохранить сообщение клиента в БД и уведомить админа'''
    try:
        conn = get_db()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
            SELECT r.id, r.car_brand, r.car_model, r.car_year, r.client_name,
                   u.id as user_id, u.name, u.phone
            FROM russification_requests r
            JOIN users u ON r.user_id = u.id
            WHERE r.id = %s AND u.telegram_id = %s
        """, (request_id, telegram_id))

        req = cur.fetchone()
        if not req:
            cur.close()
            conn.close()
            return False

        cur.execute("""
            INSERT INTO request_messages (request_id, user_id, sender_type, message_text)
            VALUES (%s, %s, 'client', %s)
        """, (request_id, req['user_id'], message_text))
        conn.commit()

        bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
        admin_chat_id = os.environ.get('TELEGRAM_CHAT_ID')
        if bot_token and admin_chat_id:
            car_info = f"{req['car_brand']} {req['car_model']}"
            if req.get('car_year'):
                car_info += f" ({req['car_year']})"

            notification = (
                f"💬 <b>Новое сообщение от клиента</b>\n\n"
                f"📝 Заявка #{request_id}\n"
                f"🚗 {car_info}\n"
                f"👤 {req['client_name']}\n"
                f"📞 {req['phone']}\n\n"
                f"💭 {message_text}"
            )

            keyboard = json.dumps({
                'inline_keyboard': [
                    [{'text': '💬 Ответить', 'callback_data': f'admin_reply_{request_id}'}]
                ]
            })

            try:
                url = f'https://api.telegram.org/bot{bot_token}/sendMessage'
                data = json.dumps({
                    'chat_id': admin_chat_id,
                    'text': notification,
                    'parse_mode': 'HTML',
                    'reply_markup': keyboard
                }).encode('utf-8')
                r = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
                urllib.request.urlopen(r, timeout=5)
            except:
                pass

        cur.close()
        conn.close()
        return True
    except Exception as e:
        print(f"Save client message error: {e}")
        return False


def save_admin_message(request_id: int, message_text: str) -> bool:
    '''Сохранить ответ админа в БД и уведомить клиента'''
    try:
        conn = get_db()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
            SELECT r.id, r.user_id, r.car_brand, r.car_model, r.car_year,
                   u.telegram_id
            FROM russification_requests r
            LEFT JOIN users u ON r.user_id = u.id
            WHERE r.id = %s
        """, (request_id,))

        req = cur.fetchone()
        if not req:
            cur.close()
            conn.close()
            return False

        cur.execute("""
            INSERT INTO request_messages (request_id, user_id, sender_type, message_text)
            VALUES (%s, %s, 'company', %s)
        """, (request_id, req['user_id'], message_text))
        conn.commit()

        client_telegram = req.get('telegram_id')
        bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
        if bot_token and client_telegram:
            car_info = f"{req['car_brand']} {req['car_model']}"
            if req.get('car_year'):
                car_info += f" ({req['car_year']})"

            notification = (
                f"💬 <b>Новое сообщение по заявке #{request_id}</b>\n"
                f"🚗 {car_info}\n\n"
                f"🏢 SmartLine:\n{message_text}"
            )

            keyboard = json.dumps({
                'inline_keyboard': [
                    [{'text': '💬 Ответить', 'callback_data': f'reply_{request_id}'}]
                ]
            })

            try:
                url = f'https://api.telegram.org/bot{bot_token}/sendMessage'
                data = json.dumps({
                    'chat_id': client_telegram,
                    'text': notification,
                    'parse_mode': 'HTML',
                    'reply_markup': keyboard
                }).encode('utf-8')
                r = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
                urllib.request.urlopen(r, timeout=5)
            except:
                pass

        cur.close()
        conn.close()
        return True
    except Exception as e:
        print(f"Save admin message error: {e}")
        return False


def handle_password_recovery(chat_id: int, user_id: int):
    '''Восстановление пароля через команду /password'''
    user_data = get_user_by_telegram(user_id)

    if not user_data:
        send_message(chat_id, "❌ Вы не привязаны к системе.\n\nНажмите /start чтобы пройти идентификацию.")
        return

    formatted_phone = format_phone(user_data['phone'])
    text = (
        f"🔑 Восстановление пароля\n\n"
        f"Будет сгенерирован новый пароль для аккаунта:\n"
        f"📱 {formatted_phone}\n\n"
        f"⚠️ Старый пароль перестанет работать.\n\n"
        f"Продолжить?"
    )

    keyboard = {
        'inline_keyboard': [
            [{'text': '✅ Да, сбросить пароль', 'callback_data': 'confirm_password_reset'}],
            [{'text': '◀️ Отмена', 'callback_data': 'main_menu'}]
        ]
    }

    send_message(chat_id, text, keyboard)


def ask_password_confirmation(chat_id: int, message_id: int, user_id: int):
    '''Экран подтверждения сброса пароля'''
    user_data = get_user_by_telegram(user_id)

    if not user_data:
        edit_message(chat_id, message_id, "❌ Вы не привязаны к системе.\n\nНажмите /start чтобы пройти идентификацию.")
        return

    formatted_phone = format_phone(user_data['phone'])
    text = (
        f"🔑 Восстановление пароля\n\n"
        f"Будет сгенерирован новый пароль для аккаунта:\n"
        f"📱 {formatted_phone}\n\n"
        f"⚠️ Старый пароль перестанет работать.\n\n"
        f"Продолжить?"
    )

    keyboard = {
        'inline_keyboard': [
            [{'text': '✅ Да, сбросить пароль', 'callback_data': 'confirm_password_reset'}],
            [{'text': '◀️ Отмена', 'callback_data': 'main_menu'}]
        ]
    }

    edit_message(chat_id, message_id, text, keyboard)


def handle_password_recovery_inline(chat_id: int, message_id: int, user_id: int):
    '''Восстановление пароля через inline-кнопку'''
    user_data = get_user_by_telegram(user_id)

    if not user_data:
        edit_message(chat_id, message_id, "❌ Вы не привязаны к системе.\n\nНажмите /start чтобы пройти идентификацию.")
        return

    new_password = reset_user_password(user_data['id'])

    if new_password:
        formatted_phone = format_phone(user_data['phone'])
        text = (
            f"🔑 <b>Данные для входа в личный кабинет</b>\n\n"
            f"📱 Телефон: <code>{formatted_phone}</code>\n"
            f"🔐 Новый пароль: <code>{new_password}</code>\n\n"
            f"🌐 Сайт: {site_url}\n\n"
            f"⚠️ Сохраните пароль! Он был обновлён."
        )
        keyboard = get_registered_menu()
        edit_message(chat_id, message_id, text, keyboard, parse_mode='HTML')
    else:
        buttons = {
            'inline_keyboard': [
                [{'text': '◀️ Главное меню', 'callback_data': 'main_menu'}]
            ]
        }
        edit_message(chat_id, message_id, "❌ Ошибка сброса пароля. Попробуйте позже.", buttons)


def get_cancel_button():
    '''Кнопка отмены'''
    return {
        'inline_keyboard': [
            [{'text': '❌ Отменить', 'callback_data': 'cancel'}]
        ]
    }


# ====================== DB FUNCTIONS ======================

def normalize_phone(phone: str) -> str:
    '''Нормализация телефона — только цифры, формат 7XXXXXXXXXX'''
    phone = str(phone).strip()
    digits = ''.join(c for c in phone if c.isdigit())
    if len(digits) == 12 and digits.startswith('87'):
        digits = '7' + digits[2:]
    if len(digits) == 10:
        digits = '7' + digits
    if len(digits) == 11 and digits[0] == '8':
        digits = '7' + digits[1:]
    return digits


def format_phone(phone: str) -> str:
    '''Форматирование телефона для отображения'''
    if len(phone) == 11:
        return f"+7 ({phone[1:4]}) {phone[4:7]}-{phone[7:9]}-{phone[9:11]}"
    return phone


def get_db():
    '''Подключение к БД'''
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    return conn


def get_user_by_telegram(telegram_id: int):
    '''Получить пользователя по Telegram ID'''
    try:
        conn = get_db()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT id, name, email, phone FROM users WHERE telegram_id = %s", (telegram_id,))
        user = cur.fetchone()
        cur.close()
        conn.close()
        return dict(user) if user else None
    except:
        return None


def get_user_by_phone(phone: str):
    '''Получить пользователя по номеру телефона'''
    try:
        conn = get_db()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT id, name, email, phone, telegram_id FROM users WHERE phone = %s", (phone,))
        user = cur.fetchone()
        cur.close()
        conn.close()
        return dict(user) if user else None
    except:
        return None


def link_telegram(user_db_id: int, telegram_id: int):
    '''Привязать Telegram ID к существующему пользователю'''
    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute("UPDATE users SET telegram_id = %s WHERE id = %s", (telegram_id, user_db_id))
        conn.commit()
        cur.close()
        conn.close()
        return True
    except Exception as e:
        print(f"Link telegram error: {e}")
        return False


def reset_user_password(user_db_id: int):
    '''Сброс пароля пользователя — генерация нового и обновление в БД'''
    try:
        import secrets as sec
        import hashlib
        new_password = sec.token_urlsafe(8)
        password_hash = hashlib.sha256(new_password.encode()).hexdigest()

        conn = get_db()
        cur = conn.cursor()
        cur.execute("UPDATE users SET password_hash = %s WHERE id = %s", (password_hash, user_db_id))
        conn.commit()
        cur.close()
        conn.close()
        return new_password
    except Exception as e:
        print(f"Reset password error: {e}")
        return None


def register_user(telegram_id: int, name: str, phone: str, password: str):
    '''Регистрация нового пользователя'''
    try:
        conn = get_db()
        cur = conn.cursor()

        import hashlib
        password_hash = hashlib.sha256(password.encode()).hexdigest()

        cur.execute("""
            INSERT INTO users (telegram_id, name, email, phone, password_hash, user_type, user_role)
            VALUES (%s, %s, %s, %s, %s, 'client', 'partner')
            RETURNING id
        """, (telegram_id, name, '', phone, password_hash))

        conn.commit()
        cur.close()
        conn.close()
        return True
    except Exception as e:
        print(f"Registration error: {e}")
        return False


def create_request_in_db(user_id, name, phone, email, car, car_year, car_plate, message):
    '''Создание заявки в БД'''
    try:
        conn = get_db()
        cur = conn.cursor()

        car_parts = car.split(' ', 1)
        car_brand = car_parts[0] if len(car_parts) > 0 else 'Не указано'
        car_model = car_parts[1] if len(car_parts) > 1 else ''

        cur.execute("""
            INSERT INTO russification_requests
            (user_id, client_name, client_phone, client_email, car_brand, car_model,
             car_year, car_plate, service_type, description, status, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'multimedia', %s, 'pending', NOW())
            RETURNING id
        """, (user_id, name, phone, email, car_brand, car_model, car_year, car_plate, message))

        request_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        return request_id
    except Exception as e:
        print(f"DB Error: {e}")
        return None


def get_user_requests(telegram_id: int):
    '''Получить заявки пользователя по Telegram ID'''
    try:
        conn = get_db()
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
    '''Уведомление админа о новой заявке'''
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


# ====================== TELEGRAM API ======================

def send_message(chat_id: int, text: str, keyboard=None, parse_mode=None):
    '''Отправка сообщения'''
    try:
        url = f'https://api.telegram.org/bot{bot_token}/sendMessage'
        data = {'chat_id': chat_id, 'text': text}

        if parse_mode:
            data['parse_mode'] = parse_mode

        if keyboard:
            data['reply_markup'] = keyboard

        req = urllib.request.Request(
            url,
            data=json.dumps(data).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        urllib.request.urlopen(req)
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8', errors='replace')
        print(f"Send message error: {e} | Response: {error_body}")
    except Exception as e:
        print(f"Send message error: {e}")


def edit_message(chat_id: int, message_id: int, text: str, keyboard=None, parse_mode=None):
    '''Редактирование сообщения'''
    try:
        url = f'https://api.telegram.org/bot{bot_token}/editMessageText'
        data = {
            'chat_id': chat_id,
            'message_id': message_id,
            'text': text
        }

        if parse_mode:
            data['parse_mode'] = parse_mode

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


def remove_reply_keyboard(chat_id: int):
    '''Убрать reply-клавиатуру'''
    try:
        url = f'https://api.telegram.org/bot{bot_token}/sendMessage'
        data = {
            'chat_id': chat_id,
            'text': '⏳ Проверяю...',
            'reply_markup': {'remove_keyboard': True}
        }

        req = urllib.request.Request(
            url,
            data=json.dumps(data).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        urllib.request.urlopen(req)
    except:
        pass


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


def api_call(method: str, data: dict):
    url = f'https://api.telegram.org/bot{bot_token}/{method}'
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    resp = urllib.request.urlopen(req)
    return json.loads(resp.read().decode('utf-8'))


def set_bot_commands():
    commands = [
        {'command': 'start', 'description': 'Запустить бота / Главное меню'},
        {'command': 'password', 'description': 'Восстановление пароля'}
    ]
    api_call('setMyCommands', {'commands': commands})


def ok_response(body=None):
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps(body or {'ok': True}),
        'isBase64Encoded': False
    }