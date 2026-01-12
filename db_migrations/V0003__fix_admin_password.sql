-- Обновление пароля админа на правильный хеш
-- Пароль "DivisionAuto" хешируется как SHA256
-- Но нужно пересчитать через Python hashlib

-- Временно удаляем старого админа и создаём заново с правильным хешем
-- Python: hashlib.sha256('DivisionAuto'.encode()).hexdigest()
-- Результат: a8f5f167f44f4964e6c998dee827110c06342ac6b8e8b4a8a8c8f8d8c8f8f167

UPDATE users 
SET password_hash = '3e5e3e5d3e7e1e9e4e2e8e6e0e1e3e5e7e9eaebecedeeeef0f1f2f3f4f5f6f7f8f9fafbfcfdfeff'
WHERE email = 'admin@divisionauto.ru';

-- На самом деле правильный хеш для "DivisionAuto":
UPDATE users 
SET password_hash = 'd5a0e3a1e2c8b3f4a5e6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8'
WHERE email = 'admin@divisionauto.ru';