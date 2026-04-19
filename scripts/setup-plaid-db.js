import fs from 'fs';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function runMigration() {
  console.log('[Migration] Running Plaid integration migration...');
  
  try {
    // Create plaid_items table
    console.log('[Migration] Creating plaid_items table...');
    await sql.query(`
      CREATE TABLE IF NOT EXISTS public.plaid_items (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
        item_id TEXT UNIQUE NOT NULL,
        access_token TEXT NOT NULL,
        institution_id TEXT,
        institution_name TEXT,
        linked_at TIMESTAMPTZ DEFAULT NOW(),
        last_sync TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('[Migration] ✓ plaid_items table created');

    // Create indexes
    console.log('[Migration] Creating indexes...');
    await sql.query(`CREATE INDEX IF NOT EXISTS idx_plaid_items_user_id ON public.plaid_items(user_id);`);
    await sql.query(`CREATE INDEX IF NOT EXISTS idx_plaid_items_item_id ON public.plaid_items(item_id);`);
    console.log('[Migration] ✓ Indexes created');

    // Create trigger function
    console.log('[Migration] Creating trigger function...');
    await sql.query(`
      CREATE OR REPLACE FUNCTION update_plaid_items_updated_at()
      RETURNS TRIGGER AS $trigger$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $trigger$ LANGUAGE plpgsql;
    `);
    console.log('[Migration] ✓ Trigger function created');

    // Create trigger
    console.log('[Migration] Creating trigger...');
    await sql.query(`DROP TRIGGER IF EXISTS plaid_items_updated_at_trigger ON public.plaid_items;`);
    await sql.query(`
      CREATE TRIGGER plaid_items_updated_at_trigger
      BEFORE UPDATE ON public.plaid_items
      FOR EACH ROW
      EXECUTE FUNCTION update_plaid_items_updated_at();
    `);
    console.log('[Migration] ✓ Trigger created');
    
    console.log('[Migration] ✓ Plaid integration setup completed successfully');
  } catch (error) {
    console.error('[Migration] Error:', error.message);
    process.exit(1);
  }
}

runMigration();
