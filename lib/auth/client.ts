'use client'

// Simple client-side auth utilities for Neon-based authentication
export const authClient = {
  async getSession() {
    try {
      const response = await fetch('/api/auth/get-session')
      if (!response.ok) return null
      return await response.json()
    } catch {
      return null
    }
  },

  async signIn(email: string, password: string) {
    const response = await fetch('/api/auth/sign-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Sign in failed')
    }
    return await response.json()
  },

  async signUp(email: string, password: string, name?: string) {
    const response = await fetch('/api/auth/sign-up', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Sign up failed')
    }
    return await response.json()
  },

  async signOut() {
    const response = await fetch('/api/auth/sign-out', {
      method: 'POST',
    })
    if (!response.ok) throw new Error('Sign out failed')
    return await response.json()
  },
}
