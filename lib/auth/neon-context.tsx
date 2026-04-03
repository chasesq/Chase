'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { authClient } from './client'

export interface NeonAuthUser {
  id: string
  email: string
  name?: string
  image?: string
  emailVerified?: boolean
}

export interface NeonAuthContextType {
  user: NeonAuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name?: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const NeonAuthContext = createContext<NeonAuthContextType | undefined>(undefined)

export function NeonAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<NeonAuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize auth session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Use the better-auth client to get the current session
        const response = await fetch('/api/auth/get-session')
        if (response.ok) {
          const data = await response.json()
          if (data?.user) {
            setUser({
              id: data.user.id,
              email: data.user.email,
              name: data.user.name,
              image: data.user.image,
              emailVerified: data.user.emailVerified,
            })
          }
        }
      } catch (error) {
        console.error('[v0] Failed to get session:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Sign in failed')
      }
      
      const data = await response.json()
      if (data?.user) {
        setUser({
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          image: data.user.image,
          emailVerified: data.user.emailVerified,
        })
      }
      window.location.href = '/'
    } catch (error) {
      console.error('[v0] Sign in failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const signUp = useCallback(async (email: string, password: string, name?: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Sign up failed')
      }
      
      const data = await response.json()
      if (data?.user) {
        setUser({
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          image: data.user.image,
          emailVerified: data.user.emailVerified,
        })
      }
      window.location.href = '/'
    } catch (error) {
      console.error('[v0] Sign up failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const signOut = useCallback(async () => {
    setIsLoading(true)
    try {
      await fetch('/api/auth/sign-out', {
        method: 'POST',
      })
      setUser(null)
      window.location.href = '/auth/login'
    } catch (error) {
      console.error('[v0] Sign out failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const resetPassword = useCallback(async (email: string) => {
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Password reset request failed')
      }
    } catch (error) {
      console.error('[v0] Password reset failed:', error)
      throw error
    }
  }, [])

  const value: NeonAuthContextType = {
    user,
    isLoading,
    isAuthenticated: user !== null,
    signIn,
    signUp,
    signOut,
    resetPassword,
  }

  return (
    <NeonAuthContext.Provider value={value}>
      {children}
    </NeonAuthContext.Provider>
  )
}

export function useNeonAuth() {
  const context = useContext(NeonAuthContext)
  if (!context) {
    throw new Error('useNeonAuth must be used within NeonAuthProvider')
  }
  return context
}
