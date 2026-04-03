-- Seed Admin User
-- Default admin credentials for Chase Banking App
-- IMPORTANT: Change these credentials after first login!

-- Create admin user if it doesn't exist
INSERT INTO neon_auth.users (email, name, password_hash, email_verified, role)
VALUES (
  'admin@chase.com',
  'Admin User',
  -- Password: Admin@2024 (bcrypt hashed)
  '$2a$10$YourHashedPasswordHere', 
  true,
  'admin'
)
ON CONFLICT (email) DO NOTHING;

-- Create additional admin users for different departments
INSERT INTO neon_auth.users (email, name, password_hash, email_verified, role)
VALUES
  (
    'manager@chase.com',
    'Manager User',
    '$2a$10$YourHashedPasswordHere',
    true,
    'manager'
  ),
  (
    'support@chase.com',
    'Support User',
    '$2a$10$YourHashedPasswordHere',
    true,
    'support'
  )
ON CONFLICT (email) DO NOTHING;

-- Grant admin permissions
UPDATE neon_auth.users SET role = 'admin' WHERE email = 'admin@chase.com';
UPDATE neon_auth.users SET role = 'manager' WHERE email = 'manager@chase.com';
UPDATE neon_auth.users SET role = 'support' WHERE email = 'support@chase.com';
