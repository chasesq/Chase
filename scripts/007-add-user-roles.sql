/**
 * Add role-based access control to users table
 * Supports 'customer' (default) and 'admin' roles
 */

-- Add role column to users table if it doesn't exist
ALTER TABLE IF EXISTS users
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'customer' CHECK (role IN ('customer', 'admin'));

-- Create index on role for faster queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Set all existing users to 'customer' if role is NULL
UPDATE users SET role = 'customer' WHERE role IS NULL;

-- Add role column to the public.users table as well (if different from above)
ALTER TABLE IF EXISTS public.users
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'customer' CHECK (role IN ('customer', 'admin'));

-- Create index on role for public.users
CREATE INDEX IF NOT EXISTS idx_public_users_role ON public.users(role);

-- Set all existing users in public.users to 'customer' if role is NULL
UPDATE public.users SET role = 'customer' WHERE role IS NULL;
