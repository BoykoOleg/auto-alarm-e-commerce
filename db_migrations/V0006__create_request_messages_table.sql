CREATE TABLE request_messages (
    id SERIAL PRIMARY KEY,
    request_id INTEGER NOT NULL,
    user_id INTEGER,
    sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('client', 'company')),
    message_text TEXT,
    file_url TEXT,
    file_name VARCHAR(255),
    file_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_request_messages_request_id ON request_messages(request_id);
CREATE INDEX idx_request_messages_created_at ON request_messages(created_at DESC);

COMMENT ON TABLE request_messages IS 'Сообщения в чате по заявкам';
COMMENT ON COLUMN request_messages.sender_type IS 'Тип отправителя: client или company';
COMMENT ON COLUMN request_messages.file_url IS 'CDN URL загруженного файла';