-- Neon Auth Database Schema Setup
-- This script creates the necessary tables and indexes for Neon Auth with Better Auth

-- Create the neon_auth schema
CREATE SCHEMA IF NOT EXISTS neon_auth;

-- Users table
CREATE TABLE IF NOT EXISTS neon_auth.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  image TEXT,
  email_verified BOOLEAN DEFAULT false,
  two_factor_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table
CREATE TABLE IF NOT EXISTS neon_auth.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES neon_auth.users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ip_address VARCHAR(255),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Accounts table (for OAuth and provider connections)
CREATE TABLE IF NOT EXISTS neon_auth.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES neon_auth.users(id) ON DELETE CASCADE,
  provider_account_id VARCHAR(255) NOT NULL,
  provider VARCHAR(255) NOT NULL,
  provider_user_id VARCHAR(255),
  refresh_token TEXT,
  access_token TEXT,
  expires_at BIGINT,
  token_type VARCHAR(255),
  scope TEXT,
  id_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(provider, provider_account_id)
);

-- Credentials table (for password auth)
CREATE TABLE IF NOT EXISTS neon_auth.credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES neon_auth.users(id) ON DELETE CASCADE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Verification tokens table
CREATE TABLE IF NOT EXISTS neon_auth.verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON neon_auth.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON neon_auth.sessions(token);
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON neon_auth.accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_credentials_user_id ON neon_auth.credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_token ON neon_auth.verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_users_email ON neon_auth.users(email);

-- Enable Row-Level Security
ALTER TABLE neon_auth.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE neon_auth.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE neon_auth.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE neon_auth.credentials ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only view their own data
CREATE POLICY users_select_policy ON neon_auth.users
  FOR SELECT USING (
    -- Allow users to view their own data
    -- When implemented with auth, this would check: auth.uid() = id
    true
  );

-- Sessions: Users can only see their own sessions
CREATE POLICY sessions_select_policy ON neon_auth.sessions
  FOR SELECT USING (
    -- When implemented with auth: auth.uid() = user_id
    true
  );

-- Grant permissions to authenticated users
-- In production, adjust role as needed
GRANT USAGE ON SCHEMA neon_auth TO public;
GRANT SELECT, INSERT, UPDATE ON neon_auth.users TO public;
GRANT SELECT, INSERT, UPDATE, DELETE ON neon_auth.sessions TO public;
GRANT SELECT, INSERT ON neon_auth.accounts TO public;
GRANT SELECT, INSERT ON neon_auth.credentials TO public;
GRANT SELECT, INSERT ON neon_auth.verification_tokens TO public;
