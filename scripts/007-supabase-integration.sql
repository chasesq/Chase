-- ============================================
-- Supabase Integration Migration
-- ============================================

-- Add missing columns to users table
ALTER TABLE IF EXISTS public.users
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS date_of_birth TEXT,
  ADD COLUMN IF NOT EXISTS government_id_type TEXT,
  ADD COLUMN IF NOT EXISTS account_type_preference TEXT,
  ADD COLUMN IF NOT EXISTS currency_preference TEXT DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS language_preference TEXT DEFAULT 'en';

-- Update existing rows with name -> full_name mapping
UPDATE public.users
SET full_name = name
WHERE full_name IS NULL AND name IS NOT NULL;

-- Add supabase_user_id column to track Supabase auth users
ALTER TABLE IF EXISTS public.users
  ADD COLUMN IF NOT EXISTS supabase_user_id UUID UNIQUE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_supabase_user_id ON public.users(supabase_user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
