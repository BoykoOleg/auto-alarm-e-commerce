
ALTER TABLE users DROP CONSTRAINT users_email_key;

ALTER TABLE users ALTER COLUMN email TYPE varchar(255);
