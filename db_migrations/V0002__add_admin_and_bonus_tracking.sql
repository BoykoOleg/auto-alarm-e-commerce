-- Добавление поля is_bonus_paid в таблицу completed_works
ALTER TABLE completed_works 
ADD COLUMN IF NOT EXISTS is_bonus_paid BOOLEAN DEFAULT FALSE;

-- Добавление индекса для фильтрации по статусу выплаты
CREATE INDEX IF NOT EXISTS idx_works_bonus_paid ON completed_works(is_bonus_paid);

-- Добавление поля user_role в таблицу users для различия партнёров и админов
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS user_role VARCHAR(20) DEFAULT 'partner';

-- Создание админа с логином admin@divisionauto.ru и паролем DivisionAuto
-- Пароль хешируется через SHA256: 8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918
INSERT INTO users (email, password_hash, name, phone, company_name, user_type, user_role, bonus_balance)
VALUES (
    'admin@divisionauto.ru',
    '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
    'Admin',
    '+79019111251',
    'DivisionAuto',
    'partner',
    'admin',
    0
)
ON CONFLICT (email) DO NOTHING;

-- Комментарии
COMMENT ON COLUMN completed_works.is_bonus_paid IS 'Выплачен ли бонус партнёру';
COMMENT ON COLUMN users.user_role IS 'Роль пользователя: partner или admin';