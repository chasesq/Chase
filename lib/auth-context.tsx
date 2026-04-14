"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import { hasPermission, isAdminRole, type UserRole } from "@/lib/auth/roles"

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

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check if user is logged in by checking localStorage
        const isLoggedIn = localStorage.getItem("chase_logged_in") === "true"
        const userProfileStr = localStorage.getItem("user_profile")

        if (isLoggedIn && userProfileStr) {
          try {
            const userProfileData = JSON.parse(userProfileStr) as UserProfile
            setUser(userProfileData)
            setProfile(userProfileData)
          } catch (err) {
            console.error("[AuthContext] Error parsing user profile:", err)
            // Clear invalid data
            localStorage.removeItem("user_profile")
            localStorage.removeItem("chase_logged_in")
          }
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
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { error: new Error(data.error || "Sign in failed") }
      }

      // Update auth state
      if (data.user) {
        setUser(data.user)
        setProfile(data.user)
        localStorage.setItem("user_profile", JSON.stringify(data.user))
        localStorage.setItem("chase_logged_in", "true")
        localStorage.setItem("userEmail", email)
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
      // Use the sign-up API endpoint
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

      // Update auth state
      if (data.user) {
        setUser(data.user)
        setProfile(data.user)
        localStorage.setItem("user_profile", JSON.stringify(data.user))
        localStorage.setItem("chase_logged_in", "true")
        localStorage.setItem("userEmail", email)
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
    setUser(null)
    setProfile(null)
    
    // Clear localStorage
    localStorage.removeItem("user_profile")
    localStorage.removeItem("chase_logged_in")
    localStorage.removeItem("chase_user_id")
    localStorage.removeItem("userEmail")
  }, [])

  // Refresh profile data from localStorage
  const refreshProfile = useCallback(async () => {
    const userProfileStr = localStorage.getItem("user_profile")
    if (userProfileStr) {
      try {
        const profileData = JSON.parse(userProfileStr) as UserProfile
        setProfile(profileData)
      } catch (err) {
        console.error("[AuthContext] Error parsing profile:", err)
      }
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
