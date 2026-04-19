const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function setupDatabase() {
  console.log('[Setup] Initializing database with Supabase + Neon integration...\n');
  
  try {
    // 1. Create users table
    console.log('[Setup] Creating users table...');
    await sql.query(`
      CREATE TABLE IF NOT EXISTS public.users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        supabase_user_id UUID UNIQUE,
        email TEXT UNIQUE NOT NULL,
        full_name TEXT,
        phone TEXT,
        address TEXT,
        date_of_birth TEXT,
        government_id_type TEXT,
        account_type_preference TEXT,
        currency_preference TEXT DEFAULT 'USD',
        language_preference TEXT DEFAULT 'en',
        password_hash TEXT,
        role TEXT DEFAULT 'user',
        two_factor_enabled BOOLEAN DEFAULT FALSE,
        totp_secret TEXT,
        backup_codes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        last_login TIMESTAMPTZ
      );
    `);
    console.log('[Setup] ✓ Users table created');

    // 2. Create accounts table
    console.log('[Setup] Creating accounts table...');
    await sql.query(`
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
      );
    `);
    console.log('[Setup] ✓ Accounts table created');

    // 3. Create transactions table
    console.log('[Setup] Creating transactions table...');
    await sql.query(`
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
      );
    `);
    console.log('[Setup] ✓ Transactions table created');

    // 4. Create indexes
    console.log('[Setup] Creating indexes...');
    await sql.query(`CREATE INDEX IF NOT EXISTS idx_users_supabase_user_id ON public.users(supabase_user_id);`);
    await sql.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);`);
    await sql.query(`CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON public.accounts(user_id);`);
    await sql.query(`CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);`);
    console.log('[Setup] ✓ Indexes created');

    // 5. Enable RLS
    console.log('[Setup] Enabling Row Level Security...');
    await sql.query(`ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;`);
    await sql.query(`ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;`);
    await sql.query(`ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;`);
    console.log('[Setup] ✓ RLS enabled');

    console.log('\n[Setup] ✓ Database setup completed successfully!');
    console.log('[Setup] You can now sign up with Supabase auth and data will be stored in Neon.');
    
  } catch (error) {
    console.error('\n[Setup] Error:', error.message);
    console.error('[Setup] Stack:', error.stack);
    process.exit(1);
  }
}

setupDatabase();
