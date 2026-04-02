-- ============================================
-- Stripe Financial Accounts for Platforms
-- ============================================

-- 1. STRIPE FINANCIAL ACCOUNTS TABLE
-- Stores platform financial accounts created via Stripe
CREATE TABLE IF NOT EXISTS public.stripe_financial_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  stripe_account_id TEXT UNIQUE NOT NULL,
  account_name TEXT NOT NULL,
  currency TEXT DEFAULT 'usd',
  balance NUMERIC(15,2) DEFAULT 0.00,
  status TEXT DEFAULT 'active',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.stripe_financial_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stripe_financial_accounts_read" ON public.stripe_financial_accounts FOR SELECT USING (true);
CREATE POLICY "stripe_financial_accounts_insert" ON public.stripe_financial_accounts FOR INSERT WITH CHECK (true);
CREATE POLICY "stripe_financial_accounts_update" ON public.stripe_financial_accounts FOR UPDATE USING (true);

-- 2. STRIPE RECEIVED CREDITS TABLE
-- Tracks incoming credits/money to financial accounts (test and real)
CREATE TABLE IF NOT EXISTS public.stripe_received_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  financial_account_id UUID NOT NULL REFERENCES public.stripe_financial_accounts(id) ON DELETE CASCADE,
  stripe_credit_id TEXT UNIQUE NOT NULL,
  amount NUMERIC(15,2) NOT NULL,
  currency TEXT DEFAULT 'usd',
  source TEXT DEFAULT 'test', -- 'test', 'wire', 'ach', 'other'
  description TEXT,
  status TEXT DEFAULT 'succeeded',
  flow_details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.stripe_received_credits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stripe_received_credits_read" ON public.stripe_received_credits FOR SELECT USING (true);
CREATE POLICY "stripe_received_credits_insert" ON public.stripe_received_credits FOR INSERT WITH CHECK (true);
CREATE POLICY "stripe_received_credits_update" ON public.stripe_received_credits FOR UPDATE USING (true);

-- 3. STRIPE PAYOUT RECIPIENTS TABLE
-- Stores verified bank accounts for payouts
CREATE TABLE IF NOT EXISTS public.stripe_payout_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  recipient_name TEXT NOT NULL,
  account_type TEXT NOT NULL DEFAULT 'individual', -- 'individual', 'business'
  account_holder_name TEXT,
  routing_number TEXT,
  account_number TEXT,
  account_number_masked TEXT, -- last 4 digits for display
  bank_name TEXT,
  stripe_token_id TEXT UNIQUE,
  verified BOOLEAN DEFAULT FALSE,
  verification_status TEXT DEFAULT 'pending', -- 'pending', 'verified', 'failed'
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.stripe_payout_recipients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stripe_payout_recipients_read" ON public.stripe_payout_recipients FOR SELECT USING (true);
CREATE POLICY "stripe_payout_recipients_insert" ON public.stripe_payout_recipients FOR INSERT WITH CHECK (true);
CREATE POLICY "stripe_payout_recipients_update" ON public.stripe_payout_recipients FOR UPDATE USING (true);
CREATE POLICY "stripe_payout_recipients_delete" ON public.stripe_payout_recipients FOR DELETE USING (true);

-- 4. STRIPE PAYOUTS TABLE
-- Tracks outbound transfers/payouts from financial accounts
CREATE TABLE IF NOT EXISTS public.stripe_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  financial_account_id UUID NOT NULL REFERENCES public.stripe_financial_accounts(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES public.stripe_payout_recipients(id) ON DELETE RESTRICT,
  amount NUMERIC(15,2) NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT DEFAULT 'processing', -- 'processing', 'succeeded', 'failed', 'canceled'
  stripe_payout_id TEXT UNIQUE,
  stripe_outbound_transfer_id TEXT UNIQUE,
  description TEXT,
  estimated_arrival TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  failure_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.stripe_payouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stripe_payouts_read" ON public.stripe_payouts FOR SELECT USING (true);
CREATE POLICY "stripe_payouts_insert" ON public.stripe_payouts FOR INSERT WITH CHECK (true);
CREATE POLICY "stripe_payouts_update" ON public.stripe_payouts FOR UPDATE USING (true);

-- 5. STRIPE BALANCE TRANSACTIONS TABLE
-- Reconciliation tracking for balance transactions
CREATE TABLE IF NOT EXISTS public.stripe_balance_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  financial_account_id UUID REFERENCES public.stripe_financial_accounts(id) ON DELETE CASCADE,
  stripe_balance_txn_id TEXT UNIQUE NOT NULL,
  amount NUMERIC(15,2) NOT NULL,
  currency TEXT DEFAULT 'usd',
  type TEXT NOT NULL, -- 'received_credit', 'outbound_transfer', 'fee', etc
  net_amount NUMERIC(15,2),
  fee NUMERIC(10,2) DEFAULT 0,
  status TEXT DEFAULT 'available',
  reporting_category TEXT,
  description TEXT,
  source_object_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.stripe_balance_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stripe_balance_transactions_read" ON public.stripe_balance_transactions FOR SELECT USING (true);
CREATE POLICY "stripe_balance_transactions_insert" ON public.stripe_balance_transactions FOR INSERT WITH CHECK (true);

-- 6. STRIPE SETTLEMENT ACCOUNTS TABLE
-- Connected accounts that can receive payouts
CREATE TABLE IF NOT EXISTS public.stripe_settlement_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_account_id TEXT UNIQUE NOT NULL,
  account_type TEXT NOT NULL DEFAULT 'standard', -- 'standard', 'express', 'custom'
  business_name TEXT,
  email TEXT,
  status TEXT DEFAULT 'active',
  charges_enabled BOOLEAN DEFAULT FALSE,
  payouts_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.stripe_settlement_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stripe_settlement_accounts_read" ON public.stripe_settlement_accounts FOR SELECT USING (true);
CREATE POLICY "stripe_settlement_accounts_insert" ON public.stripe_settlement_accounts FOR INSERT WITH CHECK (true);
CREATE POLICY "stripe_settlement_accounts_update" ON public.stripe_settlement_accounts FOR UPDATE USING (true);

-- 7. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_stripe_financial_accounts_user_id ON public.stripe_financial_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_financial_accounts_stripe_id ON public.stripe_financial_accounts(stripe_account_id);
CREATE INDEX IF NOT EXISTS idx_stripe_received_credits_financial_account ON public.stripe_received_credits(financial_account_id);
CREATE INDEX IF NOT EXISTS idx_stripe_received_credits_created ON public.stripe_received_credits(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stripe_payout_recipients_user_id ON public.stripe_payout_recipients(user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_payouts_user_id ON public.stripe_payouts(user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_payouts_financial_account ON public.stripe_payouts(financial_account_id);
CREATE INDEX IF NOT EXISTS idx_stripe_payouts_status ON public.stripe_payouts(status);
CREATE INDEX IF NOT EXISTS idx_stripe_payouts_created ON public.stripe_payouts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stripe_balance_transactions_financial_account ON public.stripe_balance_transactions(financial_account_id);
CREATE INDEX IF NOT EXISTS idx_stripe_balance_transactions_created ON public.stripe_balance_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stripe_settlement_accounts_stripe_id ON public.stripe_settlement_accounts(stripe_account_id);
