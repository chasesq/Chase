import { neon } from '@neondatabase/serverless'
import bcrypt from 'bcrypt'

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set')
}

const sql = neon(DATABASE_URL)

async function seedTestUser() {
  try {
    console.log('🌱 Seeding test user...')

    // Hash a test password
    const testPassword = 'TestPassword123!'
    const passwordHash = await bcrypt.hash(testPassword, 12)

    // Insert test user
    const result = await sql`
      INSERT INTO users (
        email, 
        password_hash, 
        full_name, 
        phone,
        currency_preference,
        language_preference,
        role
      ) VALUES (
        'test@example.com',
        ${passwordHash},
        'Test User',
        '555-1234',
        'USD',
        'en',
        'user'
      )
      ON CONFLICT (email) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
      RETURNING id, email, full_name
    `

    console.log('✅ Test user created successfully!')
    console.log('📧 Email: test@example.com')
    console.log('🔐 Password: TestPassword123!')
    console.log('\nYou can now log in with these credentials.')
  } catch (error) {
    console.error('❌ Error seeding test user:', error)
    process.exit(1)
  }
}

seedTestUser()
