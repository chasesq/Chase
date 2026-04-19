"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import { hasPermission, isAdminRole, type UserRole } from "@/lib/auth/roles"
import { supabase } from "@/lib/supabase"

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  address: string | null
  username?: string | null
  account_number?: string | null
  balance?: number
  tier?: string
  member_since?: string | null
  created_at?: string
  updated_at?: string
  role?: UserRole
  currency_preference?: string
  language_preference?: string
}

interface AuthContextType {
  user: UserProfile | null
  profile: UserProfile | null
  isLoading: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, metadata?: { full_name?: string; phone?: string }) => Promise<{ error: Error | null; user: UserProfile | null }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: Error | null }>
  refreshProfile: () => Promise<void>
  userRole: UserRole | null
  isAdmin: boolean
  hasPermission: (permission: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize auth state from Supabase
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check Supabase session
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
          // Fetch user profile from Neon via API
          const response = await fetch('/api/auth/profile', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          })

          if (response.ok) {
            const data = await response.json()
            if (data.user) {
              setUser(data.user)
              setProfile(data.user)
              console.log("[AuthContext] User authenticated from Supabase:", data.user.email)
            }
          }
        } else {
          console.log("[AuthContext] No Supabase session found")
        }
      } catch (err) {
        console.error("[AuthContext] Error initializing auth:", err)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  // Sign in with email and password
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      // Sign in with Supabase
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        return { error: new Error(authError.message || "Sign in failed") }
      }

      if (data.user) {
        // Fetch user profile from Neon
        const response = await fetch('/api/auth/profile', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })

        if (response.ok) {
          const userData = await response.json()
          if (userData.user) {
            setUser(userData.user)
            setProfile(userData.user)
          }
        }
      }

      return { error: null }
    } catch (err) {
      return { error: err instanceof Error ? err : new Error("Sign in failed") }
    }
  }, [])

  // Sign up with email and password
  const signUp = useCallback(async (
    email: string, 
    password: string, 
    metadata?: { full_name?: string; phone?: string }
  ) => {
    try {
      // Sign up with Supabase
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: metadata?.full_name,
            phone: metadata?.phone,
          },
        },
      })

      if (authError) {
        return { error: new Error(authError.message || "Sign up failed"), user: null }
      }

      if (data.user) {
        // Create user profile in Neon via API
        const response = await fetch("/api/auth/sign-up", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            supabase_user_id: data.user.id,
            email: data.user.email,
            name: metadata?.full_name || "",
            phone_number: metadata?.phone || "",
          }),
        })

        const responseData = await response.json()

        if (!response.ok) {
          return { error: new Error(responseData.error || "Sign up failed"), user: null }
        }

        // Update auth state
        if (responseData.user) {
          setUser(responseData.user)
          setProfile(responseData.user)
        }

        return { error: null, user: responseData.user }
      }

      return { error: null, user: null }
    } catch (err) {
      return { 
        error: err instanceof Error ? err : new Error("Sign up failed"), 
        user: null 
      }
    }
  }, [])

  // Sign out
  const signOut = useCallback(async () => {
    try {
      // Sign out from Supabase
      await supabase.auth.signOut()
    } catch (err) {
      console.error("[AuthContext] Error signing out:", err)
    }

    setUser(null)
    setProfile(null)
  }, [])

  // Refresh profile data from Neon
  const refreshProfile = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.user) {
          setProfile(data.user)
        }
      }
    } catch (err) {
      console.error("[AuthContext] Error refreshing profile:", err)
    }
  }, [])

  // Update profile
  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!user) {
      return { error: new Error("Not authenticated") }
    }

    try {
      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          ...updates,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { error: new Error(data.error || "Update profile failed") }
      }

      // Update local state
      const updatedProfile = { ...user, ...updates }
      setUser(updatedProfile)
      setProfile(updatedProfile)
      localStorage.setItem("user_profile", JSON.stringify(updatedProfile))

      return { error: null }
    } catch (err) {
      return { error: err instanceof Error ? err : new Error("Update profile failed") }
    }
  }, [user])

  const value: AuthContextType = {
    user,
    profile,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshProfile,
    userRole: profile?.role ?? null,
    isAdmin: profile?.role ? isAdminRole(profile.role) : false,
    hasPermission: (permission: string) => {
      if (!profile?.role) return false
      return hasPermission(profile.role, permission)
    },
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
