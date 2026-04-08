-- ============================================
-- Stripe Issuing & Credit Features
-- ============================================

-- 1. STRIPE CARDHOLDERS TABLE
-- Stores individual and company cardholders for card issuance
CREATE TABLE IF NOT EXISTS public.stripe_cardholders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  stripe_cardholder_id TEXT UNIQUE NOT NULL,
  cardholder_type TEXT NOT NULL DEFAULT 'individual', -- 'individual', 'company'
  
  -- Individual fields
  first_name TEXT,
  last_name TEXT,
  dob_day INTEGER,
  dob_month INTEGER,
  dob_year INTEGER,
  gender TEXT, -- 'male', 'female', 'other'
  
  -- Company fields
  company_name TEXT,
  tax_id TEXT,
  
  -- Address fields (for both types)
  street_address TEXT,
  city TEXT,
  state_province TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'US',
  
  -- Contact
  email TEXT,
  phone TEXT,
  
  -- Status
  status TEXT DEFAULT 'active', -- 'active', 'inactive', 'blocked'
  kyc_verification TEXT DEFAULT 'verified', -- 'pending', 'verified', 'failed'
  
  -- Additional data
  metadata JSONB DEFAULT '{}'::jsonb,
  stripe_response JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.stripe_cardholders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stripe_cardholders_read" ON public.stripe_cardholders FOR SELECT USING (true);
CREATE POLICY "stripe_cardholders_insert" ON public.stripe_cardholders FOR INSERT WITH CHECK (true);
CREATE POLICY "stripe_cardholders_update" ON public.stripe_cardholders FOR UPDATE USING (true);

CREATE INDEX idx_stripe_cardholders_user_id ON public.stripe_cardholders(user_id);
CREATE INDEX idx_stripe_cardholders_status ON public.stripe_cardholders(status);

-- 2. STRIPE ISSUED CARDS TABLE
-- Stores virtual and physical cards issued to cardholders
CREATE TABLE IF NOT EXISTS public.stripe_issued_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cardholder_id UUID NOT NULL REFERENCES public.stripe_cardholders(id) ON DELETE CASCADE,
  stripe_card_id TEXT UNIQUE NOT NULL,
  
  -- Card type and details
  card_type TEXT NOT NULL DEFAULT 'virtual', -- 'virtual', 'physical'
  card_status TEXT DEFAULT 'active', -- 'active', 'inactive', 'canceled', 'lost', 'stolen'
  last4 TEXT,
  brand TEXT DEFAULT 'visa', -- 'visa', 'mastercard'
  exp_month INTEGER,
  exp_year INTEGER,
  
  -- Lifecycle
  activation_required BOOLEAN DEFAULT FALSE,
  created_at_timestamp TIMESTAMPTZ,
  activation_status TEXT DEFAULT 'pending', -- 'pending', 'activated', 'declined'
  
  -- Spending controls
  spending_limit NUMERIC(15,2),
  spending_limit_interval TEXT DEFAULT 'monthly', -- 'per_transaction', 'daily', 'weekly', 'monthly', 'yearly', 'all_time'
  
  -- Replacement/shipping (for physical cards)
  replacement_requested BOOLEAN DEFAULT FALSE,
  shipping_address JSONB DEFAULT '{}'::jsonb,
  
  -- Digital wallet
  digital_wallet_eligible BOOLEAN DEFAULT TRUE,
  digital_wallet_enrolled BOOLEAN DEFAULT FALSE,
  
  -- Authorization settings
  pin_required BOOLEAN DEFAULT FALSE,
  networks JSONB DEFAULT '{"preferred": "visa"}'::jsonb,
  
  metadata JSONB DEFAULT '{}'::jsonb,
  stripe_response JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.stripe_issued_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stripe_issued_cards_read" ON public.stripe_issued_cards FOR SELECT USING (true);
CREATE POLICY "stripe_issued_cards_insert" ON public.stripe_issued_cards FOR INSERT WITH CHECK (true);
CREATE POLICY "stripe_issued_cards_update" ON public.stripe_issued_cards FOR UPDATE USING (true);

CREATE INDEX idx_stripe_issued_cards_cardholder_id ON public.stripe_issued_cards(cardholder_id);
CREATE INDEX idx_stripe_issued_cards_status ON public.stripe_issued_cards(card_status);
CREATE INDEX idx_stripe_issued_cards_last4 ON public.stripe_issued_cards(last4);

-- 3. STRIPE CARD TRANSACTIONS TABLE
-- Stores transaction history for issued cards
CREATE TABLE IF NOT EXISTS public.stripe_card_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES public.stripe_issued_cards(id) ON DELETE CASCADE,
  cardholder_id UUID NOT NULL REFERENCES public.stripe_cardholders(id) ON DELETE CASCADE,
  stripe_transaction_id TEXT UNIQUE NOT NULL,
  
  -- Transaction details
  amount NUMERIC(15,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  merchant_name TEXT,
  merchant_category_code TEXT,
  
  -- Status
  transaction_status TEXT DEFAULT 'approved', -- 'approved', 'declined', 'pending', 'reversed'
  
  -- Authorization details
  authorization_id TEXT,
  amount_authorized NUMERIC(15,2),
  
  -- Dispute/Reversal
  dispute_status TEXT, -- 'won', 'lost', 'pending', null
  dispute_reason TEXT,
  
  metadata JSONB DEFAULT '{}'::jsonb,
  stripe_response JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.stripe_card_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stripe_card_transactions_read" ON public.stripe_card_transactions FOR SELECT USING (true);
CREATE POLICY "stripe_card_transactions_insert" ON public.stripe_card_transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "stripe_card_transactions_update" ON public.stripe_card_transactions FOR UPDATE USING (true);

CREATE INDEX idx_stripe_card_transactions_card_id ON public.stripe_card_transactions(card_id);
CREATE INDEX idx_stripe_card_transactions_cardholder_id ON public.stripe_card_transactions(cardholder_id);
CREATE INDEX idx_stripe_card_transactions_created_at ON public.stripe_card_transactions(created_at);

-- 4. STRIPE CREDIT POLICIES TABLE
-- Stores credit terms and policies for connected accounts
CREATE TABLE IF NOT EXISTS public.stripe_credit_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  financial_account_id UUID REFERENCES public.stripe_financial_accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  stripe_credit_policy_id TEXT UNIQUE,
  
  -- Credit terms
  credit_limit NUMERIC(15,2) NOT NULL,
  currency TEXT DEFAULT 'usd',
  
  -- Payment terms
  payment_interval TEXT DEFAULT 'monthly', -- 'weekly', 'biweekly', 'monthly', 'quarterly'
  payment_days_due INTEGER DEFAULT 30, -- Days after statement end to pay
  
  -- Prefunding model
  prefunding_enabled BOOLEAN DEFAULT TRUE,
  prefunding_percentage NUMERIC(5,2) DEFAULT 100.00, -- 0-100%
  
  -- Compliance
  billing_cycle_start_date DATE,
  next_payment_due_date DATE,
  
  -- Status
  policy_status TEXT DEFAULT 'active', -- 'active', 'inactive', 'suspended'
  
  metadata JSONB DEFAULT '{}'::jsonb,
  stripe_response JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.stripe_credit_policies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stripe_credit_policies_read" ON public.stripe_credit_policies FOR SELECT USING (true);
CREATE POLICY "stripe_credit_policies_insert" ON public.stripe_credit_policies FOR INSERT WITH CHECK (true);
CREATE POLICY "stripe_credit_policies_update" ON public.stripe_credit_policies FOR UPDATE USING (true);

CREATE INDEX idx_stripe_credit_policies_user_id ON public.stripe_credit_policies(user_id);
CREATE INDEX idx_stripe_credit_policies_financial_account_id ON public.stripe_credit_policies(financial_account_id);

-- 5. STRIPE FUNDING OBLIGATIONS TABLE
-- Tracks platform's payment obligations to connected accounts
CREATE TABLE IF NOT EXISTS public.stripe_funding_obligations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credit_policy_id UUID NOT NULL REFERENCES public.stripe_credit_policies(id) ON DELETE CASCADE,
  financial_account_id UUID NOT NULL REFERENCES public.stripe_financial_accounts(id) ON DELETE CASCADE,
  stripe_obligation_id TEXT UNIQUE NOT NULL,
  
  -- Obligation details
  amount NUMERIC(15,2) NOT NULL,
  currency TEXT DEFAULT 'usd',
  
  -- Payment cycle
  cycle_start_date DATE NOT NULL,
  cycle_end_date DATE NOT NULL,
  due_date DATE NOT NULL,
  
  -- Status
  obligation_status TEXT DEFAULT 'open', -- 'open', 'paid', 'overdue', 'disputed'
  payment_method TEXT, -- 'bank_account', 'card', 'manual', 'automatic'
  
  -- Payment tracking
  paid_amount NUMERIC(15,2) DEFAULT 0.00,
  paid_at TIMESTAMPTZ,
  last_payment_attempt_at TIMESTAMPTZ,
  last_payment_attempt_status TEXT,
  
  metadata JSONB DEFAULT '{}'::jsonb,
  stripe_response JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.stripe_funding_obligations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stripe_funding_obligations_read" ON public.stripe_funding_obligations FOR SELECT USING (true);
CREATE POLICY "stripe_funding_obligations_insert" ON public.stripe_funding_obligations FOR INSERT WITH CHECK (true);
CREATE POLICY "stripe_funding_obligations_update" ON public.stripe_funding_obligations FOR UPDATE USING (true);

CREATE INDEX idx_stripe_funding_obligations_credit_policy_id ON public.stripe_funding_obligations(credit_policy_id);
CREATE INDEX idx_stripe_funding_obligations_financial_account_id ON public.stripe_funding_obligations(financial_account_id);
CREATE INDEX idx_stripe_funding_obligations_status ON public.stripe_funding_obligations(obligation_status);
CREATE INDEX idx_stripe_funding_obligations_due_date ON public.stripe_funding_obligations(due_date);

-- 6. STRIPE CARDHOLDER CONTROLS TABLE
-- Stores spending controls and restrictions for cardholders
CREATE TABLE IF NOT EXISTS public.stripe_cardholder_controls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cardholder_id UUID NOT NULL REFERENCES public.stripe_cardholders(id) ON DELETE CASCADE,
  
  -- Spending limits
  daily_spending_limit NUMERIC(15,2),
  monthly_spending_limit NUMERIC(15,2),
  per_transaction_limit NUMERIC(15,2),
  
  -- Geographic restrictions
  allowed_countries TEXT[], -- ISO country codes
  blocked_countries TEXT[],
  restricted_to_country BOOLEAN DEFAULT FALSE,
  
  -- MCC restrictions
  blocked_categories TEXT[], -- Merchant Category Codes
  allowed_only_mcc TEXT[],
  
  -- Operational controls
  online_purchases_enabled BOOLEAN DEFAULT TRUE,
  atm_withdrawals_enabled BOOLEAN DEFAULT TRUE,
  international_enabled BOOLEAN DEFAULT TRUE,
  cross_border_enabled BOOLEAN DEFAULT TRUE,
  
  -- Risk controls
  require_cvv BOOLEAN DEFAULT TRUE,
  require_pin BOOLEAN DEFAULT FALSE,
  
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.stripe_cardholder_controls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stripe_cardholder_controls_read" ON public.stripe_cardholder_controls FOR SELECT USING (true);
CREATE POLICY "stripe_cardholder_controls_insert" ON public.stripe_cardholder_controls FOR INSERT WITH CHECK (true);
CREATE POLICY "stripe_cardholder_controls_update" ON public.stripe_cardholder_controls FOR UPDATE USING (true);

CREATE INDEX idx_stripe_cardholder_controls_cardholder_id ON public.stripe_cardholder_controls(cardholder_id);

-- 7. STRIPE CREDIT DECISIONS TABLE
-- Tracks credit underwriting decisions and adverse action notices
CREATE TABLE IF NOT EXISTS public.stripe_credit_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cardholder_id UUID REFERENCES public.stripe_cardholders(id) ON DELETE CASCADE,
  credit_policy_id UUID REFERENCES public.stripe_credit_policies(id) ON DELETE CASCADE,
  
  -- Decision details
  decision_type TEXT NOT NULL DEFAULT 'underwriting', -- 'underwriting', 'adverse_action'
  decision TEXT NOT NULL, -- 'approved', 'denied', 'approved_with_conditions'
  
  -- Adverse Action Notice fields
  reason_codes TEXT[], -- Regulatory reason codes if applicable
  adverse_action_notice_sent BOOLEAN DEFAULT FALSE,
  adverse_action_notice_sent_at TIMESTAMPTZ,
  notice_recipient_email TEXT,
  
  -- Regulatory compliance
  fcra_compliant BOOLEAN DEFAULT TRUE,
  dispute_rights_explained BOOLEAN DEFAULT FALSE,
  
  metadata JSONB DEFAULT '{}'::jsonb,
  stripe_response JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.stripe_credit_decisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stripe_credit_decisions_read" ON public.stripe_credit_decisions FOR SELECT USING (true);
CREATE POLICY "stripe_credit_decisions_insert" ON public.stripe_credit_decisions FOR INSERT WITH CHECK (true);
CREATE POLICY "stripe_credit_decisions_update" ON public.stripe_credit_decisions FOR UPDATE USING (true);

CREATE INDEX idx_stripe_credit_decisions_cardholder_id ON public.stripe_credit_decisions(cardholder_id);
CREATE INDEX idx_stripe_credit_decisions_credit_policy_id ON public.stripe_credit_decisions(credit_policy_id);

-- 8. STRIPE TEST DATA TABLE
-- For tracking test operations in sandbox environment
CREATE TABLE IF NOT EXISTS public.stripe_test_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id TEXT NOT NULL,
  operation_type TEXT NOT NULL, -- 'add_funds', 'simulate_transaction', 'simulate_obligation', 'reset'
  
  -- Related records
  financial_account_id UUID REFERENCES public.stripe_financial_accounts(id) ON DELETE CASCADE,
  card_id UUID REFERENCES public.stripe_issued_cards(id) ON DELETE CASCADE,
  
  -- Operation details
  amount NUMERIC(15,2),
  description TEXT,
  status TEXT DEFAULT 'success', -- 'success', 'failed', 'pending'
  error_message TEXT,
  
  stripe_object_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.stripe_test_operations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stripe_test_operations_read" ON public.stripe_test_operations FOR SELECT USING (true);
CREATE POLICY "stripe_test_operations_insert" ON public.stripe_test_operations FOR INSERT WITH CHECK (true);

CREATE INDEX idx_stripe_test_operations_admin_id ON public.stripe_test_operations(admin_id);
CREATE INDEX idx_stripe_test_operations_operation_type ON public.stripe_test_operations(operation_type);
CREATE INDEX idx_stripe_test_operations_created_at ON public.stripe_test_operations(created_at);
