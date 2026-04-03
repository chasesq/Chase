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
        const session = await authClient.getSession()
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email,
            name: session.user.name,
            image: session.user.image,
            emailVerified: session.user.emailVerified,
          })
        }
      } catch (error) {
        console.error('[NeonAuth] Failed to get session:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await authClient.signIn.email(
        { email, password },
        { onSuccess: () => window.location.href = '/' }
      )
      if (response?.user) {
        setUser({
          id: response.user.id,
          email: response.user.email,
          name: response.user.name,
          image: response.user.image,
          emailVerified: response.user.emailVerified,
        })
      }
    } catch (error) {
      console.error('[NeonAuth] Sign in failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const signUp = useCallback(async (email: string, password: string, name?: string) => {
    setIsLoading(true)
    try {
      const response = await authClient.signUp.email(
        { email, password, name },
        { onSuccess: () => window.location.href = '/' }
      )
      if (response?.user) {
        setUser({
          id: response.user.id,
          email: response.user.email,
          name: response.user.name,
          image: response.user.image,
          emailVerified: response.user.emailVerified,
        })
      }
    } catch (error) {
      console.error('[NeonAuth] Sign up failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const signOut = useCallback(async () => {
    setIsLoading(true)
    try {
      await authClient.signOut()
      setUser(null)
      window.location.href = '/auth/login'
    } catch (error) {
      console.error('[NeonAuth] Sign out failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const resetPassword = useCallback(async (email: string) => {
    try {
      await authClient.forgetPassword({
        email,
        redirectUrl: `${window.location.origin}/auth/reset-password`,
      })
    } catch (error) {
      console.error('[NeonAuth] Password reset failed:', error)
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
