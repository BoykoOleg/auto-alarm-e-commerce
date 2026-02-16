
UPDATE users SET phone = regexp_replace(phone, '[^0-9]', '', 'g');

UPDATE users SET phone = '7' || phone WHERE phone IS NOT NULL AND length(phone) = 10;

ALTER TABLE users ALTER COLUMN phone SET NOT NULL;

DROP INDEX IF EXISTS idx_users_email;

CREATE UNIQUE INDEX idx_users_phone ON users (phone);

CREATE INDEX idx_users_email_new ON users (email) WHERE email IS NOT NULL;
