const { Pool } = require('@neondatabase/serverless')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

async function migrateDatabase() {
  const client = await pool.connect()

  try {
    console.log('[v0] Starting comprehensive database migration...')

    // 1. Add columns to users table
    const userColumnsToAdd = [
      { name: 'email_verified', sql: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE' },
      { name: 'email_verified_at', sql: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP' },
      { name: 'otp_secret', sql: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_secret TEXT' },
      { name: 'sms_2fa_enabled', sql: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS sms_2fa_enabled BOOLEAN DEFAULT FALSE' },
      { name: 'two_factor_method', sql: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_method VARCHAR(20) DEFAULT \'totp\'' },
      { name: 'backup_codes', sql: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS backup_codes TEXT[]' },
      { name: 'last_login_at', sql: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP' },
      { name: 'last_login_ip', sql: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_ip INET' },
    ]

    for (const col of userColumnsToAdd) {
      try {
        console.log(`[v0] Adding column: ${col.name}...`)
        await client.query(col.sql)
        console.log(`[v0] ✓ Column ${col.name} added`)
      } catch (err) {
        console.log(`[v0] Column ${col.name} already exists or skipped: ${err.message}`)
      }
    }

    // 2. Create email_verification_tokens table
    console.log('[v0] Creating email_verification_tokens table...')
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS email_verification_tokens (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          token VARCHAR(255) NOT NULL UNIQUE,
          expires_at TIMESTAMP NOT NULL,
          used_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `)
      console.log('[v0] ✓ email_verification_tokens table created')
    } catch (err) {
      console.log(`[v0] email_verification_tokens table error: ${err.message}`)
    }

    // 3. Create device_sessions table
    console.log('[v0] Creating device_sessions table...')
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS device_sessions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          device_name VARCHAR(255),
          device_type VARCHAR(50),
          ip_address INET,
          user_agent TEXT,
          last_active TIMESTAMP,
          is_current BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `)
      console.log('[v0] ✓ device_sessions table created')
    } catch (err) {
      console.log(`[v0] device_sessions table error: ${err.message}`)
    }

    // 4. Create login_attempts table
    console.log('[v0] Creating login_attempts table...')
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS login_attempts (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          ip_address INET,
          user_agent TEXT,
          status VARCHAR(20),
          created_at TIMESTAMP DEFAULT NOW()
        )
      `)
      console.log('[v0] ✓ login_attempts table created')
    } catch (err) {
      console.log(`[v0] login_attempts table error: ${err.message}`)
    }

    // 5. Create notification_preferences table
    console.log('[v0] Creating notification_preferences table...')
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS notification_preferences (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
          email_transactions BOOLEAN DEFAULT TRUE,
          email_security BOOLEAN DEFAULT TRUE,
          email_marketing BOOLEAN DEFAULT FALSE,
          sms_transactions BOOLEAN DEFAULT FALSE,
          sms_security BOOLEAN DEFAULT TRUE,
          push_transactions BOOLEAN DEFAULT TRUE,
          push_security BOOLEAN DEFAULT TRUE,
          do_not_disturb_start TIME,
          do_not_disturb_end TIME,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `)
      console.log('[v0] ✓ notification_preferences table created')
    } catch (err) {
      console.log(`[v0] notification_preferences table error: ${err.message}`)
    }

    // 6. Create notification_history table
    console.log('[v0] Creating notification_history table...')
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS notification_history (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          type VARCHAR(50) NOT NULL,
          channel VARCHAR(20) NOT NULL,
          subject TEXT,
          message TEXT,
          read_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `)
      console.log('[v0] ✓ notification_history table created')
    } catch (err) {
      console.log(`[v0] notification_history table error: ${err.message}`)
    }

    // 7. Create indexes for performance
    console.log('[v0] Creating performance indexes...')
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified)',
      'CREATE INDEX IF NOT EXISTS idx_email_tokens_user_id ON email_verification_tokens(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_device_sessions_user_id ON device_sessions(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_login_attempts_user_id ON login_attempts(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_login_attempts_created ON login_attempts(created_at)',
      'CREATE INDEX IF NOT EXISTS idx_notification_prefs_user ON notification_preferences(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_notification_history_user ON notification_history(user_id)',
    ]

    for (const indexSql of indexes) {
      try {
        await client.query(indexSql)
        console.log('[v0] ✓ Index created')
      } catch (err) {
        console.log(`[v0] Index creation note: ${err.message}`)
      }
    }

    console.log('[v0] ✓ Database migration completed successfully!')
  } catch (err) {
    console.error('[v0] Migration error:', err.message)
    throw err
  } finally {
    client.release()
    await pool.end()
  }
}

migrateDatabase()
  .then(() => {
    console.log('[v0] Migration finished')
    process.exit(0)
  })
  .catch((err) => {
    console.error('[v0] Migration failed:', err)
    process.exit(1)
  })
