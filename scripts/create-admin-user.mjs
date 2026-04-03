import bcryptjs from 'bcryptjs'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

const adminUsers = [
  {
    email: 'admin@chase.com',
    name: 'Admin User',
    password: 'Admin@2024!',
    role: 'admin',
  },
  {
    email: 'manager@chase.com',
    name: 'Manager User',
    password: 'Manager@2024!',
    role: 'manager',
  },
  {
    email: 'support@chase.com',
    name: 'Support User',
    password: 'Support@2024!',
    role: 'support',
  },
]

async function createAdminUsers() {
  console.log('[v0] Starting admin user creation...')

  for (const admin of adminUsers) {
    try {
      const hashedPassword = await bcryptjs.hash(admin.password, 10)

      // Check if user exists
      const existing = await sql`
        SELECT id FROM neon_auth.users WHERE email = ${admin.email}
      `

      if (existing.length > 0) {
        console.log(`[v0] User ${admin.email} already exists, skipping...`)
        continue
      }

      // Create new admin user
      const result = await sql`
        INSERT INTO neon_auth.users (email, name, password_hash, email_verified, role)
        VALUES (${admin.email}, ${admin.name}, ${hashedPassword}, true, ${admin.role})
        RETURNING id, email, name, role
      `

      console.log(`[v0] Created admin user: ${admin.email}`)
      console.log(`    Email: ${admin.email}`)
      console.log(`    Password: ${admin.password}`)
      console.log(`    Role: ${admin.role}`)
      console.log(`    ID: ${result[0].id}`)
    } catch (error) {
      console.error(`[v0] Failed to create admin user ${admin.email}:`, error)
    }
  }

  console.log('[v0] Admin user creation completed!')
  console.log('')
  console.log('=== ADMIN LOGIN CREDENTIALS ===')
  for (const admin of adminUsers) {
    console.log(`${admin.role.toUpperCase()}:`)
    console.log(`  Email: ${admin.email}`)
    console.log(`  Password: ${admin.password}`)
    console.log(`  URL: http://localhost:3000/auth/login`)
    console.log('')
  }
  console.log('================================')
  console.log('[v0] IMPORTANT: Change these passwords after first login!')
}

createAdminUsers().catch(console.error)
