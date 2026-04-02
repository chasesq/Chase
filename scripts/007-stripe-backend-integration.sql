-- ============================================
-- Stripe Backend Integration Schema
-- ============================================

-- 1. STRIPE EVENTS TABLE
-- Webhook event audit trail - stores all incoming Stripe events for processing and replay
CREATE TABLE IF NOT EXISTS public.stripe_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  event_timestamp TIMESTAMPTZ NOT NULL,
  stripe_object JSONB NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.stripe_events ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_stripe_events_event_id ON public.stripe_events(event_id);
CREATE INDEX idx_stripe_events_event_type ON public.stripe_events(event_type);
CREATE INDEX idx_stripe_events_processed ON public.stripe_events(processed);
CREATE INDEX idx_stripe_events_created_at ON public.stripe_events(created_at DESC);

-- 2. STRIPE PAYMENT RECORDS TABLE
-- Tracks all payments for reconciliation against local transaction records
CREATE TABLE IF NOT EXISTS public.stripe_payment_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  payment_intent_id TEXT UNIQUE NOT NULL,
  stripe_charge_id TEXT,
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL, -- succeeded, failed, pending, refunded
  payment_method TEXT, -- card, apple_pay, google_pay, paypal, amazon_pay, link, etc.
  payment_method_details JSONB DEFAULT '{}'::jsonb,
  reconciliation_status TEXT DEFAULT 'pending', -- pending, matched, discrepancy, unmatched
  local_transaction_id UUID REFERENCES public.transactions(id),
  stripe_event_id UUID REFERENCES public.stripe_events(id),
  
  -- Customer details
  customer_email TEXT,
  customer_name TEXT,
  
  -- Refund information
  refund_amount_cents INTEGER DEFAULT 0,
  refund_status TEXT, -- none, partial, full
  refund_reason TEXT,
  
  -- Error handling
  failure_code TEXT,
  failure_message TEXT,
  
  -- Metadata for tracking
  metadata JSONB DEFAULT '{}'::jsonb,
  stripe_response JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.stripe_payment_records ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_stripe_payment_records_user_id ON public.stripe_payment_records(user_id);
CREATE INDEX idx_stripe_payment_records_account_id ON public.stripe_payment_records(account_id);
CREATE INDEX idx_stripe_payment_records_payment_intent_id ON public.stripe_payment_records(payment_intent_id);
CREATE INDEX idx_stripe_payment_records_status ON public.stripe_payment_records(status);
CREATE INDEX idx_stripe_payment_records_reconciliation_status ON public.stripe_payment_records(reconciliation_status);
CREATE INDEX idx_stripe_payment_records_created_at ON public.stripe_payment_records(created_at DESC);

-- 3. STRIPE CONNECTED ACCOUNTS TABLE
-- Manages multi-user Stripe accounts for express onboarding and platform fees
CREATE TABLE IF NOT EXISTS public.stripe_connected_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  stripe_account_id TEXT UNIQUE NOT NULL,
  
  -- Account configuration
  account_type TEXT DEFAULT 'express', -- express, standard, custom
  account_email TEXT,
  country TEXT DEFAULT 'US',
  
  -- Capabilities and status
  charges_enabled BOOLEAN DEFAULT FALSE,
  payouts_enabled BOOLEAN DEFAULT FALSE,
  verification_status TEXT, -- 'unverified', 'pending', 'verified', 'rejected'
  verification_deadline TIMESTAMPTZ,
  
  -- Capabilities and restrictions
  capabilities JSONB DEFAULT '{}'::jsonb, -- transfers, transfers_enabled, etc.
  restrictions JSONB DEFAULT '{}'::jsonb,
  
  -- Payout settings
  default_currency TEXT DEFAULT 'usd',
  payout_schedule TEXT DEFAULT 'daily', -- manual, daily, weekly, monthly
  payout_statement_descriptor TEXT,
  
  -- Platform fee configuration
  platform_fee_percent NUMERIC(5,2) DEFAULT 0.00,
  platform_fee_fixed_cents INTEGER DEFAULT 0,
  
  -- Business information
  business_name TEXT,
  business_profile_url TEXT,
  
  -- Contact information
  support_email TEXT,
  support_phone TEXT,
  
  -- Metadata and status
  metadata JSONB DEFAULT '{}'::jsonb,
  stripe_response JSONB DEFAULT '{}'::jsonb,
  
  -- Lifecycle
  onboarding_complete BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.stripe_connected_accounts ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_stripe_connected_accounts_user_id ON public.stripe_connected_accounts(user_id);
CREATE INDEX idx_stripe_connected_accounts_stripe_account_id ON public.stripe_connected_accounts(stripe_account_id);
CREATE INDEX idx_stripe_connected_accounts_verification_status ON public.stripe_connected_accounts(verification_status);
CREATE INDEX idx_stripe_connected_accounts_active ON public.stripe_connected_accounts(active);

-- 4. PAYMENT RECONCILIATION LOGS TABLE
-- Tracks all reconciliation runs for audit and debugging
CREATE TABLE IF NOT EXISTS public.payment_reconciliation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_type TEXT NOT NULL, -- manual, scheduled, triggered
  run_date TIMESTAMPTZ DEFAULT NOW(),
  
  -- Counts and metrics
  total_stripe_payments INTEGER DEFAULT 0,
  total_local_transactions INTEGER DEFAULT 0,
  matched_count INTEGER DEFAULT 0,
  discrepancies_count INTEGER DEFAULT 0,
  unmatched_stripe_count INTEGER DEFAULT 0,
  unmatched_local_count INTEGER DEFAULT 0,
  
  -- Reconciliation results
  reconciliation_results JSONB DEFAULT '{}'::jsonb,
  
  -- Errors and issues
  errors TEXT[] DEFAULT '{}',
  warnings TEXT[] DEFAULT '{}',
  
  -- Performance metrics
  duration_ms INTEGER,
  stripe_api_calls INTEGER DEFAULT 0,
  database_operations INTEGER DEFAULT 0,
  
  -- Status and resolution
  status TEXT DEFAULT 'completed', -- started, completed, failed, partial
  completed_at TIMESTAMPTZ,
  
  -- Manual review
  requires_review BOOLEAN DEFAULT FALSE,
  reviewed_by UUID REFERENCES public.users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.payment_reconciliation_logs ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_payment_reconciliation_logs_run_date ON public.payment_reconciliation_logs(run_date DESC);
CREATE INDEX idx_payment_reconciliation_logs_status ON public.payment_reconciliation_logs(status);
CREATE INDEX idx_payment_reconciliation_logs_requires_review ON public.payment_reconciliation_logs(requires_review);

-- 5. STRIPE WEBHOOK SIGNATURES TABLE
-- Track processed webhook signatures to prevent replay attacks
CREATE TABLE IF NOT EXISTS public.stripe_webhook_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT UNIQUE NOT NULL,
  signature TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  verified BOOLEAN DEFAULT TRUE,
  verified_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.stripe_webhook_signatures ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_stripe_webhook_signatures_event_id ON public.stripe_webhook_signatures(event_id);
CREATE INDEX idx_stripe_webhook_signatures_timestamp ON public.stripe_webhook_signatures(timestamp DESC);

-- 6. PAYMENT DISCREPANCIES TABLE
-- Track and manage discrepancies between Stripe and local records
CREATE TABLE IF NOT EXISTS public.payment_discrepancies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_payment_id UUID NOT NULL REFERENCES public.stripe_payment_records(id) ON DELETE CASCADE,
  discrepancy_type TEXT NOT NULL, -- amount_mismatch, missing_local_record, missing_stripe_record, status_mismatch, duplicate
  
  -- Details
  stripe_amount_cents INTEGER,
  local_amount_cents INTEGER,
  stripe_status TEXT,
  local_status TEXT,
  
  -- Resolution
  status TEXT DEFAULT 'open', -- open, investigating, resolved, cannot_resolve
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES public.users(id),
  
  -- Auto-resolution attempts
  auto_resolution_attempted BOOLEAN DEFAULT FALSE,
  auto_resolution_result TEXT, -- success, failed, manual_review_required
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.payment_discrepancies ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_payment_discrepancies_stripe_payment_id ON public.payment_discrepancies(stripe_payment_id);
CREATE INDEX idx_payment_discrepancies_status ON public.payment_discrepancies(status);
CREATE INDEX idx_payment_discrepancies_discrepancy_type ON public.payment_discrepancies(discrepancy_type);
CREATE INDEX idx_payment_discrepancies_created_at ON public.payment_discrepancies(created_at DESC);
