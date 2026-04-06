"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User, Session } from "@supabase/supabase-js"

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  address: string | null
  username: string | null
  account_number: string | null
  balance: number
  tier: string
  member_since: string | null
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  isLoading: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, metadata?: { full_name?: string; phone?: string }) => Promise<{ error: Error | null; user: User | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: Error | null }>
  updatePassword: (password: string) => Promise<{ error: Error | null }>
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: Error | null }>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createClient()

  // Fetch user profile from profiles table
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single()

      if (error) {
        console.error("[AuthContext] Error fetching profile:", error.message)
        return null
      }

      return data as UserProfile
    } catch (err) {
      console.error("[AuthContext] Error in fetchProfile:", err)
      return null
    }
  }, [supabase])

  // Refresh profile data
  const refreshProfile = useCallback(async () => {
    if (!user) return
    const profileData = await fetchProfile(user.id)
    if (profileData) {
      setProfile(profileData)
      // Also update localStorage for the banking context
      localStorage.setItem("user_profile", JSON.stringify(profileData))
    }
  }, [user, fetchProfile])

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Get current session
        const { data: { session: currentSession } } = await supabase.auth.getSession()
        
        if (currentSession?.user) {
          setSession(currentSession)
          setUser(currentSession.user)
          
          // Fetch profile
          const profileData = await fetchProfile(currentSession.user.id)
          if (profileData) {
            setProfile(profileData)
            localStorage.setItem("user_profile", JSON.stringify(profileData))
          }
        }
      } catch (err) {
        console.error("[AuthContext] Error initializing auth:", err)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession)
        setUser(newSession?.user ?? null)

        if (newSession?.user) {
          const profileData = await fetchProfile(newSession.user.id)
          if (profileData) {
            setProfile(profileData)
            localStorage.setItem("user_profile", JSON.stringify(profileData))
          }
        } else {
          setProfile(null)
          localStorage.removeItem("user_profile")
        }

        if (event === "SIGNED_OUT") {
          // Clear all auth-related localStorage
          localStorage.removeItem("user_profile")
          localStorage.removeItem("chase_logged_in")
          localStorage.removeItem("chase_user_id")
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, fetchProfile])

  // Sign in with email and password
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { error: new Error(error.message) }
      }

      return { error: null }
    } catch (err) {
      return { error: err instanceof Error ? err : new Error("Sign in failed") }
    }
  }, [supabase])

  // Sign up with email and password
  const signUp = useCallback(async (
    email: string, 
    password: string, 
    metadata?: { full_name?: string; phone?: string }
  ) => {
    try {
      // Use the sign-up API endpoint which auto-confirms users
      const response = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          name: metadata?.full_name || "",
          phone_number: metadata?.phone || "",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { error: new Error(data.error || "Sign up failed"), user: null }
      }

      return { error: null, user: data.user }
    } catch (err) {
      return { 
        error: err instanceof Error ? err : new Error("Sign up failed"), 
        user: null 
      }
    }
  }, [])

  // Sign out
  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setProfile(null)
    
    // Clear localStorage
    localStorage.removeItem("user_profile")
    localStorage.removeItem("chase_logged_in")
    localStorage.removeItem("chase_user_id")
  }, [supabase])

  // Reset password
  const resetPassword = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        return { error: new Error(error.message) }
      }

      return { error: null }
    } catch (err) {
      return { error: err instanceof Error ? err : new Error("Reset password failed") }
    }
  }, [supabase])

  // Update password
  const updatePassword = useCallback(async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password })

      if (error) {
        return { error: new Error(error.message) }
      }

      return { error: null }
    } catch (err) {
      return { error: err instanceof Error ? err : new Error("Update password failed") }
    }
  }, [supabase])

  // Update profile
  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!user) {
      return { error: new Error("Not authenticated") }
    }

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (error) {
        return { error: new Error(error.message) }
      }

      // Refresh profile after update
      await refreshProfile()
      return { error: null }
    } catch (err) {
      return { error: err instanceof Error ? err : new Error("Update profile failed") }
    }
  }, [user, supabase, refreshProfile])

  const value: AuthContextType = {
    user,
    session,
    profile,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    refreshProfile,
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
