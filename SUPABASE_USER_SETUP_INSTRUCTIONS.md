# Complete Supabase User Account Setup Instructions

## Overview
This guide walks you through setting up all user accounts in Supabase so that Lin Huang, Johnny Mercer, and other users can log in and access their personalized dashboards with real accounts and balances.

## Step-by-Step Setup

### Step 1: Ensure Users Table Exists
Your Supabase database should already have a `users` table. If not, run the migration from `/scripts/01-create-users-table.sql`.

### Step 2: Add Demo Users (if not already present)
Go to your Supabase dashboard SQL Editor and run the migration from `/scripts/30-add-demo-users.sql` to create demo user accounts.

### Step 3: Create User Accounts Tables
1. Go to your Supabase project dashboard: https://supabase.com
2. Click on your project
3. In the left sidebar, click "SQL Editor"
4. Click "+ New Query" (top right)
5. Copy the entire content from `/scripts/50-create-user-accounts.sql`
6. Paste it into the query editor
7. Click "Run"
8. Wait for the success message (you should see "completed successfully")

This creates two tables:
- `user_accounts` - Stores checking, savings, and money market accounts with real-time balances
- `transactions` - Tracks all transfers and activity with full audit trail

### Step 4: Insert User Account Data
1. Click "+ New Query" again
2. Copy the entire content from `/scripts/51-insert-user-accounts.sql`
3. Paste it into the query editor
4. Click "Run"
5. Wait for success message

This creates accounts for:
- **Lin Huang** - 2 empty accounts (Checking $0, Savings $0)
- **Johnny Mercer** - 2 funded accounts (Checking $5,250.75, Savings $12,500.00)
- **CHUN HUNG** - 3 funded accounts (Checking $5,250.75, Savings $12,500.00, Money Market $25,000.50)

## User Login Credentials

After setup, users can log in with:

### Regular Users
```
Lin Huang
Email: linhuang011@gmail.com
Password: Lin2000
Accounts: 2 (Checking CHK-****7890, Savings SAV-****7891)

Johnny Mercer
Email: johnnymercer1122@gmail.com
Password: Johnny11
Accounts: 2 (Checking CHK-****5678, Savings SAV-****5679)

CHUN HUNG
Email: hungchun164@gmail.com
Password: Chun200@
Accounts: 3 (Checking, Savings, Money Market)
```

### Admin Users
```
Super Admin
Email: admin@chasebank.com
Password: SuperAdmin@2024
Access: Full admin dashboard, can transfer to any account

Transfer Admin
Email: admin.transfers@chasebank.com
Password: AdminTransfers@2024
Access: Transfer management

Finance Admin
Email: admin.finance@chasebank.com
Password: AdminFinance@2024
Access: Financial account management
```

## How It Works

### User Login Flow
1. User enters email and password
2. System checks admin accounts first (hardcoded for security)
3. If not admin, queries `users` table from Supabase
4. Fetches all `user_accounts` associated with that user
5. Returns user profile with account list and balances
6. User sees personalized dashboard with their accounts

### Real-Time Updates
- When admins transfer funds, user balances update immediately
- Uses Supabase Real-Time subscriptions for live updates
- Transactions are recorded in the `transactions` table for audit trail

### Security
- Row Level Security (RLS) enabled on both tables
- Users can only see their own accounts and transactions
- Admins can see all accounts (for transfers)
- All passwords are bcrypt hashed
- Supabase handles secure session management

## Verification

After setup, test by:

1. **Test User Login:**
   - Open the app login page
   - Enter: linhuang011@gmail.com / Lin2000
   - Should see Lin Huang's personalized dashboard
   - Should see Checking and Savings accounts with $0 balance

2. **Test Admin Transfer:**
   - Log out and login as admin: admin@chasebank.com / SuperAdmin@2024
   - Go to admin dashboard
   - Create a transfer to Lin Huang's checking account (CHK-****7890)
   - Transfer $1,000

3. **Test Real-Time Update:**
   - Log in as Lin Huang again
   - Checking account balance should now show $1,000
   - Transaction history should show the incoming transfer

## Troubleshooting

**Issue: "Invalid email or password" on login**
- Ensure users table has the email address
- Verify password is correct (case-sensitive)
- Check that user exists in both `users` and `user_accounts` tables

**Issue: Can't see accounts on dashboard**
- Verify `user_accounts` table was created successfully
- Check that accounts were inserted for the user
- Ensure user_id in user_accounts matches id in users table

**Issue: Admin transfers not working**
- Verify `transactions` table was created
- Check that both from and to accounts exist in `user_accounts`
- Ensure user has admin tier ('admin' or 'super_admin')

**Issue: RLS policies blocking access**
- If you get permission errors, check Supabase RLS policies
- Policies in the migration automatically grant user/admin access
- Re-run the migration if policies seem incorrect

## Next Steps

Once setup is complete:
1. Users can log in and see their personalized dashboards
2. Admins can transfer funds to user accounts
3. All transactions are tracked in real-time
4. The system is production-ready with full security

For questions or issues, check the Supabase logs in your dashboard under "Logs" → "Database" for detailed error messages.
