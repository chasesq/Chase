-- Create Admin Users for the Banking System
-- This script creates admin and super_admin users with proper credentials
-- Execute this script after the users table has been created

-- Admin User #1 - Super Admin (Full Access)
INSERT INTO public.users (
  email,
  username,
  password_hash,
  full_name,
  phone,
  address,
  date_of_birth,
  ssn,
  member_since,
  tier,
  role
) VALUES (
  'admin@chasebank.com',
  'SUPER_ADMIN',
  '$2b$10$YvwVUYA4xUYyzzAZYcLYCuNpYlQJePtVjWz8Z.PkpJzZZZ7pZ2Ery',
  'System Administrator',
  '+1 (555) 000-0001',
  '100 Chase Center, New York, NY 10001, USA',
  '1990-01-01',
  '999-00-0001',
  '2024-01-01',
  'Administrator',
  'super_admin'
) ON CONFLICT (email) DO NOTHING;

-- Admin User #2 - Admin (Transfer & User Management)
INSERT INTO public.users (
  email,
  username,
  password_hash,
  full_name,
  phone,
  address,
  date_of_birth,
  ssn,
  member_since,
  tier,
  role
) VALUES (
  'admin.transfers@chasebank.com',
  'ADMIN_TRANSFERS',
  '$2b$10$ZvwVUYA4xUYyzzAZYcLYCuNpYlQJePtVjWz8Z.PkpJzZZZ7pZ2Ery',
  'Transfer Administrator',
  '+1 (555) 000-0002',
  '100 Chase Center, New York, NY 10001, USA',
  '1990-02-01',
  '999-00-0002',
  '2024-01-15',
  'Administrator',
  'admin'
) ON CONFLICT (email) DO NOTHING;

-- Admin User #3 - Admin (Financial Accounts & Compliance)
INSERT INTO public.users (
  email,
  username,
  password_hash,
  full_name,
  phone,
  address,
  date_of_birth,
  ssn,
  member_since,
  tier,
  role
) VALUES (
  'admin.finance@chasebank.com',
  'ADMIN_FINANCE',
  '$2b$10$AvwVUYA4xUYyzzAZYcLYCuNpYlQJePtVjWz8Z.PkpJzZZZ7pZ2Ery',
  'Finance Administrator',
  '+1 (555) 000-0003',
  '100 Chase Center, New York, NY 10001, USA',
  '1990-03-01',
  '999-00-0003',
  '2024-02-01',
  'Administrator',
  'admin'
) ON CONFLICT (email) DO NOTHING;

-- Create index on role for faster lookups
CREATE INDEX IF NOT EXISTS users_role_idx ON public.users(role);

-- Verify admin users were created
SELECT id, email, username, role, created_at FROM public.users WHERE role IN ('admin', 'super_admin') ORDER BY created_at DESC;
