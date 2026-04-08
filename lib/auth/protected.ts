'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

/**
 * Get the current user session on the server
 * Throws redirect if not authenticated
 */
export async function getUser() {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user
}

/**
 * Get the current user without redirecting if not authenticated
 * Returns null if not authenticated
 */
export async function getUserSafe() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user
}

/**
 * Check if user is authenticated
 * Returns true if authenticated, false otherwise
 */
export async function isAuthenticated() {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return !!session
}

/**
 * Verify user has admin role
 * Throws redirect if not admin
 */
export async function requireAdmin() {
  const user = await getUser()
  
  // Check user metadata for admin role
  const isAdmin = user?.user_metadata?.role === 'admin'

  if (!isAdmin) {
    redirect('/auth/error')
  }

  return user
}
