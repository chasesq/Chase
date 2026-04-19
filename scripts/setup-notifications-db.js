import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function setupNotifications() {
  console.log('[Migration] Setting up notifications...');
  
  try {
    // Create notifications table
    console.log('[Migration] Creating notifications table...');
    await sql.query(`
      CREATE TABLE IF NOT EXISTS public.notifications (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
        type TEXT NOT NULL,
        message TEXT NOT NULL,
        data JSONB,
        read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('[Migration] ✓ notifications table created');

    // Create indexes
    console.log('[Migration] Creating indexes...');
    await sql.query(`CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);`);
    await sql.query(`CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, read);`);
    await sql.query(`CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);`);
    console.log('[Migration] ✓ Indexes created');

    // Create notification_preferences table
    console.log('[Migration] Creating notification_preferences table...');
    await sql.query(`
      CREATE TABLE IF NOT EXISTS public.notification_preferences (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
        transaction_alerts BOOLEAN DEFAULT TRUE,
        payment_confirmations BOOLEAN DEFAULT TRUE,
        system_messages BOOLEAN DEFAULT TRUE,
        push_notifications BOOLEAN DEFAULT TRUE,
        email_notifications BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('[Migration] ✓ notification_preferences table created');

    // Create index for preferences
    await sql.query(`CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON public.notification_preferences(user_id);`);
    console.log('[Migration] ✓ Preference index created');

    // Create trigger function for updated_at
    console.log('[Migration] Creating trigger functions...');
    await sql.query(`
      CREATE OR REPLACE FUNCTION update_notifications_updated_at()
      RETURNS TRIGGER AS $trigger$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $trigger$ LANGUAGE plpgsql;
    `);
    
    await sql.query(`
      CREATE OR REPLACE FUNCTION update_notification_preferences_updated_at()
      RETURNS TRIGGER AS $trigger$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $trigger$ LANGUAGE plpgsql;
    `);
    console.log('[Migration] ✓ Trigger functions created');

    // Create triggers
    console.log('[Migration] Creating triggers...');
    await sql.query(`DROP TRIGGER IF EXISTS notifications_updated_at_trigger ON public.notifications;`);
    await sql.query(`
      CREATE TRIGGER notifications_updated_at_trigger
      BEFORE UPDATE ON public.notifications
      FOR EACH ROW
      EXECUTE FUNCTION update_notifications_updated_at();
    `);

    await sql.query(`DROP TRIGGER IF EXISTS notification_preferences_updated_at_trigger ON public.notification_preferences;`);
    await sql.query(`
      CREATE TRIGGER notification_preferences_updated_at_trigger
      BEFORE UPDATE ON public.notification_preferences
      FOR EACH ROW
      EXECUTE FUNCTION update_notification_preferences_updated_at();
    `);
    console.log('[Migration] ✓ Triggers created');
    
    console.log('[Migration] ✓ Notifications setup completed successfully');
  } catch (error) {
    console.error('[Migration] Error:', error.message);
    process.exit(1);
  }
}

setupNotifications();
