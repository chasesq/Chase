# Supabase Setup Guide for User Accounts

## Quick Start

Follow these steps to set up all user accounts in Supabase so users can log in with their credentials:

### Step 1: Execute Migration Scripts in Supabase Dashboard

1. Go to your Supabase project dashboard
2. Click "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy and paste the content from `/scripts/50-create-user-accounts.sql`
5. Click "Run"
6. Wait for success message

### Step 2: Insert User Account Data

1. Click "New Query" again
2. Copy and paste the content from `/scripts/51-insert-user-accounts.sql`
3. Click "Run"
4. All user accounts are now created with their balances

## User Accounts Created

### Lin Huang
- **Email:** linhuang011@gmail.com
- **Password:** Lin2000
- **Accounts:**
  - Checking (CHK-****7890): $0.00
  - Savings (SAV-****7891): $0.00

### Johnny Mercer
- **Email:** johnnymercer1122@gmail.com
- **Password:** Johnny11
- **Accounts:**
  - Checking (CHK-****5678): $5,250.75
  - Savings (SAV-****5679): $12,500.00

### CHUN HUNG
- **Email:** hungchun164@gmail.com
- **Password:** Chun200@
- **Accounts:**
  - Checking (CHK-****5001): $5,250.75
  - Savings (SAV-****5002): $12,500.00
  - Money Market (MM-****5003): $25,000.50

## What Gets Set Up

### Tables Created
- **user_accounts** - Stores all checking, savings, and money market accounts with real-time balances
- **transactions** - Tracks all transfers, deposits, withdrawals with audit trail

### Security Features
- **Row Level Security (RLS)** - Users only see their own accounts and transactions
- **Admin Access** - Admins can see all accounts for transfers
- **Encrypted Passwords** - All passwords are bcrypt hashed

## Testing

After setup, you can:
1. Log in as Lin Huang: `linhuang011@gmail.com` / `Lin2000`
2. View personalized dashboard with accounts
3. Log in as Admin: `admin@chasebank.com` / `SuperAdmin@2024`
4. Transfer funds from admin dashboard to Lin Huang's accounts
5. View real-time balance updates on Lin Huang's account

## Troubleshooting

If you see errors:
- Check that users table exists (created by migration scripts)
- Verify all SQL scripts executed successfully in order
- Ensure Supabase connection string is correct in environment variables
