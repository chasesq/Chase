-- Create passkey credentials table for WebAuthn/FIDO2 support
CREATE TABLE IF NOT EXISTS public.passkey_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  credential_id TEXT UNIQUE NOT NULL,
  public_key BYTEA NOT NULL,
  sign_count INTEGER NOT NULL DEFAULT 0,
  transports TEXT[] DEFAULT ARRAY[]::TEXT[],
  device_name TEXT,
  device_type TEXT,
  browser_name TEXT,
  os_name TEXT,
  is_backup BOOLEAN DEFAULT FALSE,
  verified BOOLEAN DEFAULT FALSE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster passkey lookups
CREATE INDEX IF NOT EXISTS passkey_credentials_user_id_idx ON public.passkey_credentials(user_id);
CREATE INDEX IF NOT EXISTS passkey_credentials_credential_id_idx ON public.passkey_credentials(credential_id);

-- Create SMS factor table
CREATE TABLE IF NOT EXISTS public.sms_factors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_attempts INTEGER DEFAULT 0,
  last_verification_at TIMESTAMP WITH TIME ZONE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, phone_number)
);

-- Create index for SMS factor lookups
CREATE INDEX IF NOT EXISTS sms_factors_user_id_idx ON public.sms_factors(user_id);
CREATE INDEX IF NOT EXISTS sms_factors_phone_number_idx ON public.sms_factors(phone_number);

-- Create MFA policy table
CREATE TABLE IF NOT EXISTS public.mfa_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id TEXT,
  policy_name TEXT NOT NULL,
  require_mfa BOOLEAN DEFAULT FALSE,
  required_factors TEXT[] DEFAULT ARRAY[]::TEXT[],
  grace_period_days INTEGER DEFAULT 0,
  enforce_at_login BOOLEAN DEFAULT TRUE,
  enforce_at_sensitive_operations BOOLEAN DEFAULT TRUE,
  allowed_factor_types TEXT[] DEFAULT ARRAY['totp', 'sms', 'passkey', 'email']::TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create MFA policy compliance table
CREATE TABLE IF NOT EXISTS public.mfa_policy_compliance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  policy_id UUID NOT NULL REFERENCES public.mfa_policies(id) ON DELETE CASCADE,
  is_compliant BOOLEAN DEFAULT FALSE,
  enrolled_factors TEXT[] DEFAULT ARRAY[]::TEXT[],
  compliant_at TIMESTAMP WITH TIME ZONE,
  non_compliant_since TIMESTAMP WITH TIME ZONE,
  grace_period_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, policy_id)
);

-- Create index for policy compliance lookups
CREATE INDEX IF NOT EXISTS mfa_policy_compliance_user_id_idx ON public.mfa_policy_compliance(user_id);
CREATE INDEX IF NOT EXISTS mfa_policy_compliance_policy_id_idx ON public.mfa_policy_compliance(policy_id);
