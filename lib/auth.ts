import { createSession, deleteSession, getSession } from './db'
import { cookies } from 'next/headers'
import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcrypt'

const SESSION_COOKIE_NAME = 'chase_session_token'
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
const BCRYPT_ROUNDS = 12

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    const hash = await bcrypt.hash(password, BCRYPT_ROUNDS)
    return hash
  } catch (error) {
    console.error('[v0] Error hashing password:', error)
    throw new Error('Failed to hash password')
  }
}

/**
 * Verify a password against a bcrypt hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    const isValid = await bcrypt.compare(password, hash)
    return isValid
  } catch (error) {
    console.error('[v0] Error verifying password:', error)
    return false
  }
}

/**
 * Create a new session for a user
 */
export async function createUserSession(userId: string) {
  try {
    const token = uuidv4()
    const expiresAt = new Date(Date.now() + SESSION_DURATION)
    
    const session = await createSession(userId, token, expiresAt)
    
    // Set session cookie
    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_DURATION / 1000, // Convert to seconds
      path: '/',
    })
    
    return session
  } catch (error) {
    console.error('[v0] Error creating session:', error)
    throw error
  }
}

/**
 * Get the current user session from cookies
 */
export async function getCurrentSession() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
    
    if (!token) {
      return null
    }
    
    const session = await getSession(token)
    return session
  } catch (error) {
    console.error('[v0] Error getting session:', error)
    return null
  }
}

/**
 * Get the current user from session
 */
export async function getCurrentUser() {
  const session = await getCurrentSession()
  return session ? { id: session.user_id, email: session.email, full_name: session.full_name, role: session.role } : null
}

/**
 * Logout a user by deleting their session
 */
export async function logoutUser() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
    
    if (token) {
      await deleteSession(token)
      cookieStore.delete(SESSION_COOKIE_NAME)
    }
  } catch (error) {
    console.error('[v0] Error logging out:', error)
    throw error
  }
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
