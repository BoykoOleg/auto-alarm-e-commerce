
ALTER TABLE users DROP CONSTRAINT users_user_role_check;

ALTER TABLE users ADD CONSTRAINT users_user_role_check CHECK (user_role IN ('partner', 'admin', 'user'));
