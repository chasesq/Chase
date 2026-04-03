import { neon } from '@neondatabase/serverless'
import { hash, verify } from 'bcryptjs'

const sql = neon(process.env.DATABASE_URL!)

export const auth = {
  async signUpEmail(email: string, password: string, name?: string) {
    try {
      const hashedPassword = await hash(password, 10)
      
      const result = await sql`
        INSERT INTO neon_auth.users (email, name, password_hash, email_verified)
        VALUES (${email}, ${name || email.split('@')[0]}, ${hashedPassword}, false)
        ON CONFLICT (email) DO NOTHING
        RETURNING id, email, name, email_verified
      `
      
      if (result.length === 0) {
        throw new Error('Email already exists')
      }
      
      return result[0]
    } catch (error) {
      console.error('[v0] Sign up error:', error)
      throw error
    }
  },

  async signInEmail(email: string, password: string) {
    try {
      const result = await sql`
        SELECT id, email, name, password_hash, email_verified
        FROM neon_auth.users
        WHERE email = ${email}
      `
      
      if (result.length === 0) {
        throw new Error('Invalid email or password')
      }
      
      const user = result[0]
      const isPasswordValid = await verify(password, user.password_hash)
      
      if (!isPasswordValid) {
        throw new Error('Invalid email or password')
      }
      
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.email_verified,
      }
    } catch (error) {
      console.error('[v0] Sign in error:', error)
      throw error
    }
  },

  async getUser(userId: string) {
    try {
      const result = await sql`
        SELECT id, email, name, email_verified, role
        FROM neon_auth.users
        WHERE id = ${userId}
      `
      
      if (result.length === 0) {
        return null
      }
      
      return result[0]
    } catch (error) {
      console.error('[v0] Get user error:', error)
      throw error
    }
  },
}
