-- Создание таблицы пользователей (партнёры/клиенты)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    company_name VARCHAR(255),
    user_type VARCHAR(20) DEFAULT 'partner' CHECK (user_type IN ('partner', 'client')),
    bonus_balance INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание индексов для users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);

-- Создание таблицы заявок на русификацию
CREATE TABLE IF NOT EXISTS russification_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    client_name VARCHAR(255) NOT NULL,
    client_phone VARCHAR(50) NOT NULL,
    client_email VARCHAR(255),
    car_brand VARCHAR(100) NOT NULL,
    car_model VARCHAR(100) NOT NULL,
    car_year INTEGER,
    service_type VARCHAR(50) DEFAULT 'multimedia' CHECK (service_type IN ('multimedia', 'dashboard', 'navigation', 'climate', 'full')),
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание индексов для russification_requests
CREATE INDEX IF NOT EXISTS idx_requests_user_id ON russification_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON russification_requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_created_at ON russification_requests(created_at DESC);

-- Создание таблицы завершённых работ
CREATE TABLE IF NOT EXISTS completed_works (
    id SERIAL PRIMARY KEY,
    request_id INTEGER REFERENCES russification_requests(id),
    user_id INTEGER REFERENCES users(id),
    work_cost DECIMAL(10, 2) NOT NULL,
    bonus_earned INTEGER DEFAULT 0,
    work_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

-- Создание индексов для completed_works
CREATE INDEX IF NOT EXISTS idx_works_user_id ON completed_works(user_id);
CREATE INDEX IF NOT EXISTS idx_works_request_id ON completed_works(request_id);
CREATE INDEX IF NOT EXISTS idx_works_date ON completed_works(work_date DESC);

-- Создание таблицы транзакций бонусов
CREATE TABLE IF NOT EXISTS bonus_transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    work_id INTEGER REFERENCES completed_works(id),
    amount INTEGER NOT NULL,
    transaction_type VARCHAR(20) DEFAULT 'earned' CHECK (transaction_type IN ('earned', 'spent', 'adjusted')),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание индексов для bonus_transactions
CREATE INDEX IF NOT EXISTS idx_bonus_user_id ON bonus_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_bonus_created_at ON bonus_transactions(created_at DESC);

-- Создание таблицы сессий пользователей
CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание индексов для user_sessions
CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON user_sessions(expires_at);

-- Комментарии к таблицам
COMMENT ON TABLE users IS 'Пользователи системы (партнёры и клиенты)';
COMMENT ON TABLE russification_requests IS 'Заявки на русификацию автомобилей';
COMMENT ON TABLE completed_works IS 'История выполненных работ';
COMMENT ON TABLE bonus_transactions IS 'История начисления и списания бонусов';
COMMENT ON TABLE user_sessions IS 'Активные сессии пользователей';