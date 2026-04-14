import { Pool } from '@neondatabase/serverless'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

async function addProfileFields() {
  const client = await pool.connect()

  try {
    console.log('Adding new profile fields to users table...')

    // Check which columns already exist
    const columnsResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users'
    `)

    const existingColumns = columnsResult.rows.map((row) => row.column_name)
    console.log('Existing columns:', existingColumns)

    const migrations = [
      {
        name: 'address',
        sql: `ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT`,
      },
      {
        name: 'date_of_birth',
        sql: `ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth DATE`,
      },
      {
        name: 'government_id_type',
        sql: `ALTER TABLE users ADD COLUMN IF NOT EXISTS government_id_type VARCHAR(50)`,
      },
      {
        name: 'account_type_preference',
        sql: `ALTER TABLE users ADD COLUMN IF NOT EXISTS account_type_preference VARCHAR(50)`,
      },
      {
        name: 'currency_preference',
        sql: `ALTER TABLE users ADD COLUMN IF NOT EXISTS currency_preference VARCHAR(10) DEFAULT 'USD'`,
      },
      {
        name: 'language_preference',
        sql: `ALTER TABLE users ADD COLUMN IF NOT EXISTS language_preference VARCHAR(10) DEFAULT 'en'`,
      },
      {
        name: 'email_notifications',
        sql: `ALTER TABLE users ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT TRUE`,
      },
      {
        name: 'sms_notifications',
        sql: `ALTER TABLE users ADD COLUMN IF NOT EXISTS sms_notifications BOOLEAN DEFAULT FALSE`,
      },
      {
        name: 'inapp_notifications',
        sql: `ALTER TABLE users ADD COLUMN IF NOT EXISTS inapp_notifications BOOLEAN DEFAULT TRUE`,
      },
      {
        name: 'two_factor_enabled',
        sql: `ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE`,
      },
    ]

    // Execute migrations
    for (const migration of migrations) {
      if (!existingColumns.includes(migration.name)) {
        console.log(`Adding column: ${migration.name}`)
        await client.query(migration.sql)
        console.log(`✓ Added column: ${migration.name}`)
      } else {
        console.log(`✓ Column already exists: ${migration.name}`)
      }
    }

    // Create indexes for performance
    const indexQueries = [
      `CREATE INDEX IF NOT EXISTS idx_users_email_notifications ON users(email_notifications)`,
      `CREATE INDEX IF NOT EXISTS idx_users_account_type ON users(account_type_preference)`,
      `CREATE INDEX IF NOT EXISTS idx_users_date_of_birth ON users(date_of_birth)`,
    ]

    for (const indexQuery of indexQueries) {
      console.log(`Creating index: ${indexQuery.split('ON')[0].trim()}`)
      await client.query(indexQuery)
    }

    console.log('✓ All profile fields added successfully!')
  } catch (error) {
    console.error('Error adding profile fields:', error)
    throw error
  } finally {
    await client.release()
    await pool.end()
  }
}

addProfileFields().catch((error) => {
  console.error('Migration failed:', error)
  process.exit(1)
})
