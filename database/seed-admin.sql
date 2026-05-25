-- Seed default admin user if it doesn't exist
INSERT INTO users (email, password_hash, role, is_active)
SELECT
  'admin@oakstratton.com',
  '$2a$10$5d5/5d5/5d5/5d5/5d5/5d5/5d5/5d5/5d5/5d5/5d5/5d5/5d5/5d5/5d',
  'admin',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'admin@oakstratton.com'
);
