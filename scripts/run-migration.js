const fs = require('fs');
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function runMigration() {
  console.log('[Migration] Running Supabase integration migration...');
  
  try {
    // Execute migrations using sql.query for raw SQL
    console.log('[Migration] Adding columns to users table...');
    await sql.query(`
      ALTER TABLE IF EXISTS public.users
        ADD COLUMN IF NOT EXISTS full_name TEXT,
        ADD COLUMN IF NOT EXISTS address TEXT,
        ADD COLUMN IF NOT EXISTS date_of_birth TEXT,
        ADD COLUMN IF NOT EXISTS government_id_type TEXT,
        ADD COLUMN IF NOT EXISTS account_type_preference TEXT,
        ADD COLUMN IF NOT EXISTS currency_preference TEXT DEFAULT 'USD',
        ADD COLUMN IF NOT EXISTS language_preference TEXT DEFAULT 'en';
    `);
    console.log('[Migration] ✓ Columns added');

    console.log('[Migration] Updating name -> full_name...');
    await sql.query(`
      UPDATE public.users
      SET full_name = name
      WHERE full_name IS NULL AND name IS NOT NULL;
    `);
    console.log('[Migration] ✓ Updated');

    console.log('[Migration] Adding supabase_user_id column...');
    await sql.query(`
      ALTER TABLE IF EXISTS public.users
        ADD COLUMN IF NOT EXISTS supabase_user_id UUID UNIQUE;
    `);
    console.log('[Migration] ✓ Column added');

    console.log('[Migration] Creating indexes...');
    await sql.query(`CREATE INDEX IF NOT EXISTS idx_users_supabase_user_id ON public.users(supabase_user_id);`);
    await sql.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);`);
    console.log('[Migration] ✓ Indexes created');
    
    console.log('[Migration] ✓ Migration completed successfully');
  } catch (error) {
    console.error('[Migration] Error:', error.message);
    process.exit(1);
  }
}

runMigration();
