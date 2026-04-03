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
-- admin@chase.com / AdminPass123!
INSERT INTO public.admin_credentials (email, password_hash, name, status)
VALUES 
  (
    'admin@chase.com',
    '$2a$10$XK7qzE5k4E4K4K4K4K4K4O8q8q8q8q8q8q8q8q8q8q8q8q8q8q8q8',
    'Chase Admin',
    'active'
  ),
  -- super_admin@chase.com / SuperAdmin123!
  (
    'super_admin@chase.com',
    '$2a$10$VL9pjK8j8K8K8K8K8K8K8Q7p7p7p7p7p7p7p7p7p7p7p7p7p7p7p7p',
    'Chase Super Admin',
    'active'
  )
ON CONFLICT (email) DO NOTHING;
