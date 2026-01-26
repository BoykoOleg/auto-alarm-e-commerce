-- Добавляем поле is_read для отслеживания прочитанных сообщений
ALTER TABLE request_messages 
ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE;

-- Создаём индекс для быстрого поиска непрочитанных сообщений
CREATE INDEX IF NOT EXISTS idx_messages_unread 
ON request_messages(request_id, is_read) 
WHERE is_read = FALSE;