-- Migration: Admin Credentials Table
-- Description: Creates a table for hardcoded admin credentials with bcrypt hashed passwords

-- Create admin_credentials table
CREATE TABLE IF NOT EXISTS public.admin_credentials (
  id BIGSERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS admin_credentials_email_idx ON public.admin_credentials(email);
CREATE INDEX IF NOT EXISTS admin_credentials_status_idx ON public.admin_credentials(status);

-- Insert default admin accounts with bcrypt hashed passwords
-- Password hashes generated with bcryptjs (cost factor: 10)
-- admin@chase.com / Admin@123456
INSERT INTO public.admin_credentials (email, password_hash, name, status)
VALUES 
  (
    'admin@chase.com',
    '$2b$10$/lOQs1HWJnWeC2HNUyeuFu0WLIWsr0Bv9TBl3ijqKv0sUf1p0pV8W',
    'Chase Admin',
    'active'
  ),
  -- super_admin@chase.com / SuperAdmin@789012
  (
    'super_admin@chase.com',
    '$2b$10$k4J0t9N6uKe8GM9mlybbDeqCtFlqZm2HkxUwL.6KWXTr/hKu0k2Jq',
    'Chase Super Admin',
    'active'
  )
ON CONFLICT (email) DO NOTHING;
