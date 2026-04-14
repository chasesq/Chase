-- Add account number and balance fields to users table for new signups
-- This migration adds tracking fields for user account initialization

-- Add columns to users table if they don't exist
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS account_number TEXT,
ADD COLUMN IF NOT EXISTS total_balance NUMERIC(15,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS total_checking_balance NUMERIC(15,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS total_savings_balance NUMERIC(15,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS total_savings_goals NUMERIC(15,2) DEFAULT 0.00;

-- Create index for account number lookup
CREATE INDEX IF NOT EXISTS idx_users_account_number ON public.users(account_number);

-- Add a savings_goals table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.savings_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  goal_name TEXT NOT NULL,
  target_amount NUMERIC(15,2) NOT NULL,
  current_amount NUMERIC(15,2) DEFAULT 0.00,
  goal_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_savings_goals_user_id ON public.savings_goals(user_id);

-- Add RLS policy for savings_goals
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for service role" ON public.savings_goals FOR ALL USING (true) WITH CHECK (true);
