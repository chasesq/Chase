-- Database Migration: Add Role Management and Indexes for RBAC System
-- This migration ensures the role column exists and adds performance indexes

-- Verify users table has role column with proper constraints
ALTER TABLE IF EXISTS public.users
ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'user'
CHECK (role IN ('admin', 'user', 'moderator'));

-- Create index on role column for faster permission checks
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- Create index on id, role for efficient user lookups
CREATE INDEX IF NOT EXISTS idx_users_id_role ON public.users(id, role);

-- Create role audit table for logging role changes (optional but recommended)
CREATE TABLE IF NOT EXISTS public.role_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  old_role VARCHAR(20),
  new_role VARCHAR(20) NOT NULL,
  changed_by UUID REFERENCES public.users(id),
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  reason TEXT
);

-- Create index on role audit log for user lookups
CREATE INDEX IF NOT EXISTS idx_role_audit_user_id ON public.role_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_role_audit_changed_at ON public.role_audit_log(changed_at DESC);

-- Update existing users without a role to have 'user' role
UPDATE public.users 
SET role = 'user' 
WHERE role IS NULL;

-- Create a view for easier admin queries
CREATE OR REPLACE VIEW public.admin_users AS
SELECT 
  id,
  email,
  name,
  phone,
  role,
  created_at,
  updated_at
FROM public.users
WHERE role = 'admin';

CREATE OR REPLACE VIEW public.moderator_users AS
SELECT 
  id,
  email,
  name,
  phone,
  role,
  created_at,
  updated_at
FROM public.users
WHERE role = 'moderator';

-- Create table for role-based permissions (extensible for future use)
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  role VARCHAR(20) NOT NULL,
  permission VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(role, permission),
  CHECK (role IN ('admin', 'user', 'moderator'))
);

-- Add default permissions for roles
INSERT INTO public.role_permissions (role, permission, description)
VALUES
  ('admin', 'view_users', 'Can view all users'),
  ('admin', 'manage_users', 'Can manage user accounts'),
  ('admin', 'view_transfers', 'Can view all transfers'),
  ('admin', 'manage_transfers', 'Can manage transfers'),
  ('admin', 'view_accounts', 'Can view all accounts'),
  ('admin', 'manage_accounts', 'Can manage accounts'),
  ('admin', 'view_reports', 'Can view system reports'),
  ('admin', 'export_data', 'Can export system data'),
  ('admin', 'access_admin_dashboard', 'Can access admin dashboard'),
  ('admin', 'manage_roles', 'Can manage user roles'),
  ('moderator', 'view_users', 'Can view users'),
  ('moderator', 'view_transfers', 'Can view transfers'),
  ('moderator', 'view_accounts', 'Can view accounts'),
  ('moderator', 'view_reports', 'Can view reports'),
  ('moderator', 'manage_transfers', 'Can manage transfers'),
  ('user', 'view_own_profile', 'Can view own profile'),
  ('user', 'edit_own_profile', 'Can edit own profile'),
  ('user', 'view_own_accounts', 'Can view own accounts'),
  ('user', 'create_transactions', 'Can create transactions'),
  ('user', 'view_own_transactions', 'Can view own transactions')
ON CONFLICT (role, permission) DO NOTHING;

-- Create index on role permissions for efficient lookups
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON public.role_permissions(role);

-- Grant appropriate privileges
GRANT SELECT ON public.users TO authenticated;
GRANT SELECT ON public.role_permissions TO authenticated;
GRANT SELECT ON public.admin_users TO authenticated;
GRANT SELECT ON public.moderator_users TO authenticated;

-- Enable Row Level Security policies if not already enabled
-- Note: Make sure RLS policies are set up to enforce role-based access control
