import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('Starting Neon database migration...');

    // Enable required extensions
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    await client.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
    console.log('✓ Extensions enabled');

    // 1. USERS TABLE
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        phone TEXT,
        role TEXT DEFAULT 'user',
        two_factor_enabled BOOLEAN DEFAULT FALSE,
        totp_secret TEXT,
        backup_codes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        last_login TIMESTAMPTZ
      )
    `);
    console.log('✓ Users table created');

    // 2. ACCOUNTS TABLE
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.accounts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
        name TEXT NOT NULL DEFAULT 'Checking Account',
        account_type TEXT NOT NULL DEFAULT 'checking',
        account_number TEXT,
        full_account_number TEXT,
        routing_number TEXT DEFAULT '021000021',
        balance NUMERIC(15,2) DEFAULT 0.00,
        available_balance NUMERIC(15,2) DEFAULT 0.00,
        interest_rate NUMERIC(6,4) DEFAULT 0.01,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('✓ Accounts table created');

    // 3. TRANSACTIONS TABLE
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
        user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
        description TEXT NOT NULL,
        amount NUMERIC(15,2) NOT NULL,
        type TEXT NOT NULL DEFAULT 'debit',
        category TEXT DEFAULT 'general',
        status TEXT DEFAULT 'completed',
        reference TEXT,
        fee NUMERIC(10,2) DEFAULT 0,
        recipient_id TEXT,
        recipient_bank TEXT,
        recipient_account TEXT,
        recipient_name TEXT,
        sender_name TEXT,
        scheduled_date TIMESTAMPTZ,
        transaction_date TIMESTAMPTZ DEFAULT NOW(),
        settlement_date TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('✓ Transactions table created');

    // 4. NOTIFICATIONS TABLE
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        message TEXT,
        type TEXT DEFAULT 'info',
        category TEXT DEFAULT 'general',
        is_read BOOLEAN DEFAULT FALSE,
        read BOOLEAN DEFAULT FALSE,
        data JSONB,
        action_url TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('✓ Notifications table created');

    // 5. CREDIT SCORES TABLE
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.credit_scores (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
        score INTEGER DEFAULT 750,
        status TEXT DEFAULT 'good',
        trend TEXT DEFAULT 'stable',
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('✓ Credit scores table created');

    // 6. WIRE TRANSFERS TABLE
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.wire_transfers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
        from_account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
        amount NUMERIC(15,2) NOT NULL,
        recipient_name TEXT,
        recipient_bank TEXT,
        recipient_routing_number TEXT,
        recipient_account_number TEXT,
        status TEXT DEFAULT 'processing',
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('✓ Wire transfers table created');

    // 7. ZELLE TRANSFERS TABLE
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.zelle_transfers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
        from_account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
        amount NUMERIC(15,2) NOT NULL,
        recipient_email TEXT,
        recipient_phone TEXT,
        recipient_name TEXT,
        status TEXT DEFAULT 'sent',
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('✓ Zelle transfers table created');

    // 8. BILL PAYMENTS TABLE
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.bill_payments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
        from_account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
        amount NUMERIC(15,2) NOT NULL,
        payee TEXT NOT NULL,
        due_date DATE,
        scheduled_date DATE,
        frequency TEXT DEFAULT 'once',
        status TEXT DEFAULT 'processing',
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('✓ Bill payments table created');

    // 9. NOTIFICATION PREFERENCES TABLE
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.notification_preferences (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
        email_notifications BOOLEAN DEFAULT TRUE,
        sms_notifications BOOLEAN DEFAULT TRUE,
        push_notifications BOOLEAN DEFAULT TRUE,
        transaction_alerts BOOLEAN DEFAULT TRUE,
        security_alerts BOOLEAN DEFAULT TRUE,
        offer_notifications BOOLEAN DEFAULT TRUE,
        promotional_emails BOOLEAN DEFAULT FALSE,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('✓ Notification preferences table created');

    // 10. LOGIN HISTORY TABLE
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.login_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
        device TEXT,
        location TEXT,
        ip_address TEXT,
        status TEXT DEFAULT 'success',
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('✓ Login history table created');

    // 11. USER SETTINGS TABLE
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.user_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
        dark_mode BOOLEAN DEFAULT FALSE,
        language TEXT DEFAULT 'English',
        currency TEXT DEFAULT 'USD',
        biometric_login BOOLEAN DEFAULT FALSE,
        two_factor_method TEXT DEFAULT 'sms',
        session_timeout INTEGER DEFAULT 15,
        settings_data JSONB DEFAULT '{}'::jsonb,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('✓ User settings table created');

    // 12. CREATE INDEXES for performance
    await client.query('CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON public.accounts(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON public.transactions(account_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_bill_payments_user_id ON public.bill_payments(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_wire_transfers_user_id ON public.wire_transfers(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_zelle_transfers_user_id ON public.zelle_transfers(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_login_history_user_id ON public.login_history(user_id)');
    console.log('✓ Indexes created');

    console.log('\n✓ Migration completed successfully!');
    console.log('All banking database tables have been created in Neon PostgreSQL.');

  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  } finally {
    await client.release();
    await pool.end();
  }
}

runMigration();
