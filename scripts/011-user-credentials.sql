-- Migration: User Credentials Table
-- Description: Creates a table for user credentials with bcrypt hashed passwords

-- Create user_credentials table
CREATE TABLE IF NOT EXISTS public.user_credentials (
  id BIGSERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for email lookups and status queries
CREATE INDEX IF NOT EXISTS user_credentials_email_idx ON public.user_credentials(email);
CREATE INDEX IF NOT EXISTS user_credentials_status_idx ON public.user_credentials(status);

-- Insert test user account
-- Email: john.smith@example.com / Password: JohnSmith@123456
INSERT INTO public.user_credentials (email, password_hash, full_name, status)
VALUES 
  (
    'john.smith@example.com',
    '$2b$10$x8KqN9qWxT2KpJ5mL8eKFe0QzVqRx1HxYq8dZ2xF9e7w5G3iN4h2K',
    'John Smith',
    'active'
  )
ON CONFLICT (email) DO NOTHING;
