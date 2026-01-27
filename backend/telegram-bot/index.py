import json
import os
import asyncio
from aiogram import Bot, Dispatcher, types, F
from aiogram.filters import Command, StateFilter
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.fsm.storage.memory import MemoryStorage
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo
import psycopg2
from psycopg2.extras import RealDictCursor

bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
site_url = os.environ.get('SITE_URL', 'https://proisvodnaya.poehali.dev')
bot = Bot(token=bot_token)
storage = MemoryStorage()
dp = Dispatcher(storage=storage)

class RequestStates(StatesGroup):
    waiting_name = State()
    waiting_phone = State()
    waiting_car = State()
    waiting_message = State()

class RegistrationStates(StatesGroup):
    waiting_reg_name = State()
    waiting_reg_phone = State()
    waiting_reg_email = State()

def get_main_menu(is_registered: bool = False):
    '''Главное меню с inline-кнопками'''
    buttons = []
    
    if is_registered:
        buttons.append([InlineKeyboardButton(
            text="🆕 Создать заявку",
            callback_data="new_request"
        )])
        buttons.append([InlineKeyboardButton(
            text="📋 Мои заявки",
            callback_data="my_requests"
        )])
    else:
        buttons.append([InlineKeyboardButton(
            text="✅ Зарегистрироваться",
            callback_data="register"
        )])
        buttons.append([InlineKeyboardButton(
            text="📝 Создать заявку без регистрации",
            callback_data="new_request"
        )])
    
    buttons.append([InlineKeyboardButton(
        text="🌐 Перейти на сайт",
        web_app=WebAppInfo(url=site_url)
    )])
    
    return InlineKeyboardMarkup(inline_keyboard=buttons)

def get_cancel_button():
    '''Кнопка отмены'''
    return InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="❌ Отменить", callback_data="cancel")]
    ])

@dp.message(Command("start"))
async def cmd_start(message: types.Message):
    '''Обработчик команды /start'''
    user_id = message.from_user.id
    first_name = message.from_user.first_name or "друг"
    
    user_data = get_user_by_telegram(user_id)
    is_registered = user_data is not None
    
    if is_registered:
        text = f"👋 С возвращением, {user_data['name']}!\n\n🚗 Автосервис \"Химчистка\" готов помочь.\n\nВыберите действие:"
    else:
        text = f"👋 Привет, {first_name}!\n\n🚗 Я бот автосервиса \"Химчистка\".\n\n📌 Я помогу:\n• Оставить заявку на русификацию\n• Следить за статусом заявок\n• Получать уведомления\n\nВыберите действие:"
    
    await message.answer(
        text,
        reply_markup=get_main_menu(is_registered)
    )

@dp.callback_query(F.data == "main_menu")
async def back_to_menu(callback: types.CallbackQuery, state: FSMContext):
    '''Возврат в главное меню'''
    await state.clear()
    user_id = callback.from_user.id
    user_data = get_user_by_telegram(user_id)
    is_registered = user_data is not None
    
    first_name = callback.from_user.first_name or "друг"
    
    if is_registered:
        text = f"👋 С возвращением, {user_data['name']}!\n\n🚗 Автосервис \"Химчистка\" готов помочь.\n\nВыберите действие:"
    else:
        text = f"👋 Привет, {first_name}!\n\n🚗 Я бот автосервиса \"Химчистка\".\n\nВыберите действие:"
    
    await callback.message.edit_text(
        text,
        reply_markup=get_main_menu(is_registered)
    )
    await callback.answer()

@dp.callback_query(F.data == "register")
async def start_registration(callback: types.CallbackQuery, state: FSMContext):
    '''Начало регистрации'''
    await state.set_state(RegistrationStates.waiting_reg_name)
    
    await callback.message.edit_text(
        "✅ Регистрация на сервисе\n\n📝 Как вас зовут?",
        reply_markup=get_cancel_button()
    )
    await callback.answer()

@dp.message(RegistrationStates.waiting_reg_name)
async def process_reg_name(message: types.Message, state: FSMContext):
    '''Обработка имени при регистрации'''
    if len(message.text) < 2:
        await message.answer("❌ Имя слишком короткое. Введите ваше имя:")
        return
    
    await state.update_data(name=message.text)
    await state.set_state(RegistrationStates.waiting_reg_phone)
    
    await message.answer(
        "📱 Укажите номер телефона:",
        reply_markup=get_cancel_button()
    )

@dp.message(RegistrationStates.waiting_reg_phone)
async def process_reg_phone(message: types.Message, state: FSMContext):
    '''Обработка телефона при регистрации'''
    if len(message.text) < 10:
        await message.answer("❌ Некорректный номер. Введите номер телефона:")
        return
    
    await state.update_data(phone=message.text)
    await state.set_state(RegistrationStates.waiting_reg_email)
    
    await message.answer(
        "📧 Укажите email для входа в личный кабинет:",
        reply_markup=get_cancel_button()
    )

@dp.message(RegistrationStates.waiting_reg_email)
async def process_reg_email(message: types.Message, state: FSMContext):
    '''Обработка email и завершение регистрации'''
    email = message.text
    
    if '@' not in email or '.' not in email:
        await message.answer("❌ Некорректный email. Введите действительный email:")
        return
    
    data = await state.get_data()
    user_id = message.from_user.id
    username = message.from_user.username
    
    success = register_user(
        telegram_id=user_id,
        telegram_username=username,
        name=data['name'],
        phone=data['phone'],
        email=email
    )
    
    if success:
        await state.clear()
        
        buttons = [
            [InlineKeyboardButton(text="🆕 Создать заявку", callback_data="new_request")],
            [InlineKeyboardButton(text="🌐 Перейти на сайт", web_app=WebAppInfo(url=site_url))]
        ]
        
        await message.answer(
            f"✅ Регистрация завершена!\n\n👤 Имя: {data['name']}\n📱 Телефон: {data['phone']}\n📧 Email: {email}\n\n🔐 Пароль для входа отправлен на email.",
            reply_markup=InlineKeyboardMarkup(inline_keyboard=buttons)
        )
    else:
        await message.answer(
            "❌ Ошибка регистрации. Возможно, email уже используется.\n\n/start - Вернуться в меню"
        )
        await state.clear()

@dp.callback_query(F.data == "new_request")
async def start_new_request(callback: types.CallbackQuery, state: FSMContext):
    '''Начало создания заявки'''
    user_id = callback.from_user.id
    user_data = get_user_by_telegram(user_id)
    
    if user_data:
        await state.update_data(user_data=user_data)
        await state.set_state(RequestStates.waiting_message)
        
        await callback.message.edit_text(
            f"✅ Вы зарегистрированы как {user_data['name']}\n\n💬 Опишите проблему или нужную услугу:",
            reply_markup=get_cancel_button()
        )
    else:
        await state.set_state(RequestStates.waiting_name)
        
        await callback.message.edit_text(
            "📝 Создание заявки\n\n👤 Как вас зовут?",
            reply_markup=get_cancel_button()
        )
    
    await callback.answer()

@dp.message(RequestStates.waiting_name)
async def process_name(message: types.Message, state: FSMContext):
    '''Обработка имени'''
    if len(message.text) < 2:
        await message.answer("❌ Имя слишком короткое. Введите ваше имя:")
        return
    
    await state.update_data(name=message.text)
    await state.set_state(RequestStates.waiting_phone)
    
    await message.answer(
        "📱 Укажите номер телефона:",
        reply_markup=get_cancel_button()
    )

@dp.message(RequestStates.waiting_phone)
async def process_phone(message: types.Message, state: FSMContext):
    '''Обработка телефона'''
    if len(message.text) < 10:
        await message.answer("❌ Некорректный номер. Введите номер телефона:")
        return
    
    await state.update_data(phone=message.text)
    await state.set_state(RequestStates.waiting_car)
    
    await message.answer(
        "🚗 Какой у вас автомобиль? (марка и модель)",
        reply_markup=get_cancel_button()
    )

@dp.message(RequestStates.waiting_car)
async def process_car(message: types.Message, state: FSMContext):
    '''Обработка автомобиля'''
    if len(message.text) < 2:
        await message.answer("❌ Укажите марку и модель автомобиля:")
        return
    
    await state.update_data(car=message.text)
    await state.set_state(RequestStates.waiting_message)
    
    await message.answer(
        "💬 Опишите проблему или нужную услугу:",
        reply_markup=get_cancel_button()
    )

@dp.message(RequestStates.waiting_message)
async def process_message_text(message: types.Message, state: FSMContext):
    '''Обработка описания и создание заявки'''
    data = await state.get_data()
    
    if 'user_data' in data:
        user_data = data['user_data']
        name = user_data['name']
        phone = user_data['phone']
        email = user_data['email']
        user_db_id = user_data['id']
        car = "Не указан"
    else:
        name = data.get('name', 'Не указано')
        phone = data.get('phone', 'Не указан')
        email = None
        user_db_id = None
        car = data.get('car', 'Не указан')
    
    request_id = create_request_in_db(
        user_id=user_db_id,
        name=name,
        phone=phone,
        email=email,
        car=car,
        message=message.text
    )
    
    if request_id:
        await notify_admin_new_request(request_id, name, phone, car, message.text)
        await state.clear()
        
        buttons = [
            [InlineKeyboardButton(text="🆕 Создать ещё заявку", callback_data="new_request")],
            [InlineKeyboardButton(text="📋 Мои заявки", callback_data="my_requests")],
            [InlineKeyboardButton(text="🌐 Перейти на сайт", web_app=WebAppInfo(url=site_url))]
        ]
        
        await message.answer(
            f"✅ Заявка #{request_id} создана!\n\n📞 Мы свяжемся с вами в ближайшее время.",
            reply_markup=InlineKeyboardMarkup(inline_keyboard=buttons)
        )
    else:
        await message.answer(
            "❌ Ошибка создания заявки. Попробуйте позже.\n\n/start - Вернуться в меню"
        )
        await state.clear()

@dp.callback_query(F.data == "my_requests")
async def show_my_requests(callback: types.CallbackQuery):
    '''Показать заявки пользователя'''
    user_id = callback.from_user.id
    requests = get_user_requests(user_id)
    
    if not requests:
        buttons = [
            [InlineKeyboardButton(text="🆕 Создать заявку", callback_data="new_request")],
            [InlineKeyboardButton(text="◀️ Главное меню", callback_data="main_menu")]
        ]
        
        await callback.message.edit_text(
            "📋 У вас пока нет заявок",
            reply_markup=InlineKeyboardMarkup(inline_keyboard=buttons)
        )
        await callback.answer()
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
        [InlineKeyboardButton(text="🆕 Создать новую заявку", callback_data="new_request")],
        [InlineKeyboardButton(text="◀️ Главное меню", callback_data="main_menu")]
    ]
    
    await callback.message.edit_text(
        text,
        reply_markup=InlineKeyboardMarkup(inline_keyboard=buttons)
    )
    await callback.answer()

@dp.callback_query(F.data == "cancel")
async def cancel_operation(callback: types.CallbackQuery, state: FSMContext):
    '''Отмена текущей операции'''
    await state.clear()
    
    user_id = callback.from_user.id
    user_data = get_user_by_telegram(user_id)
    is_registered = user_data is not None
    
    await callback.message.edit_text(
        "❌ Операция отменена\n\nВыберите действие:",
        reply_markup=get_main_menu(is_registered)
    )
    await callback.answer()

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
    '''Регистрация нового пользователя'''
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
        
        user_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        
        return True
    except Exception as e:
        print(f"Registration error: {e}")
        return False

def create_request_in_db(user_id, name, phone, email, car, message):
    '''Создание заявки в БД'''
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

async def notify_admin_new_request(request_id, name, phone, car, message):
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
        
        await bot.send_message(
            chat_id=chat_id,
            text=text,
            parse_mode='HTML'
        )
    except:
        pass

def handler(event: dict, context) -> dict:
    '''Webhook handler для Cloud Function
    
    Принимает обновления от Telegram и обрабатывает их через aiogram
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
        update_data = json.loads(event.get('body', '{}'))
        update = types.Update(**update_data)
        
        asyncio.run(dp.feed_update(bot=bot, update=update))
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'ok': True}),
            'isBase64Encoded': False
        }
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        print(traceback.format_exc())
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'ok': True}),
            'isBase64Encoded': False
        }
