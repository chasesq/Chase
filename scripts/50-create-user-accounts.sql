-- Create user accounts table for checking and savings accounts
CREATE TABLE IF NOT EXISTS public.user_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  account_type TEXT NOT NULL CHECK (account_type IN ('checking', 'savings', 'money_market')),
  account_number TEXT UNIQUE NOT NULL,
  account_name TEXT NOT NULL,
  balance DECIMAL(15, 2) DEFAULT 0.00,
  currency TEXT DEFAULT 'USD',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS user_accounts_user_id_idx ON public.user_accounts(user_id);
CREATE INDEX IF NOT EXISTS user_accounts_account_number_idx ON public.user_accounts(account_number);

-- Create transactions table for tracking transfers and activity
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_account_id UUID REFERENCES public.user_accounts(id),
  to_account_id UUID REFERENCES public.user_accounts(id),
  amount DECIMAL(15, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('transfer', 'deposit', 'withdrawal', 'payment')),
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for transaction lookups
CREATE INDEX IF NOT EXISTS transactions_from_account_idx ON public.transactions(from_account_id);
CREATE INDEX IF NOT EXISTS transactions_to_account_idx ON public.transactions(to_account_id);
CREATE INDEX IF NOT EXISTS transactions_created_at_idx ON public.transactions(created_at);

-- Enable Row Level Security
ALTER TABLE public.user_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_accounts
CREATE POLICY "users_can_view_own_accounts" ON public.user_accounts
  FOR SELECT USING (
    user_id = (SELECT id FROM public.users WHERE email = current_user)
  );

CREATE POLICY "admins_can_view_all_accounts" ON public.user_accounts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE email = current_user AND (tier = 'admin' OR tier = 'super_admin')
    )
  );

-- Create RLS policies for transactions
CREATE POLICY "users_can_view_own_transactions" ON public.transactions
  FOR SELECT USING (
    from_account_id IN (
      SELECT id FROM public.user_accounts 
      WHERE user_id = (SELECT id FROM public.users WHERE email = current_user)
    ) OR
    to_account_id IN (
      SELECT id FROM public.user_accounts 
      WHERE user_id = (SELECT id FROM public.users WHERE email = current_user)
    )
  );
