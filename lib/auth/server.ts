import { betterAuth } from 'better-auth'
import { neonAdapter } from 'better-auth/adapters/neon'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export const auth = betterAuth({
  database: neonAdapter(sql),
  emailAndPassword: {
    enabled: true,
    autoSignInAfterSignUp: true,
  },
  appName: 'Chase Banking',
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
  basePath: '/api/auth',
  secret: process.env.BETTER_AUTH_SECRET || 'your-secret-key',
})
