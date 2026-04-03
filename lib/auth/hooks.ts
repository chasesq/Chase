'use client'

import { useNeonAuth } from './neon-context'

/**
 * Hook to get the current authenticated user
 */
export function useUser() {
  const { user, isLoading } = useNeonAuth()
  return { user, isLoading }
}

/**
 * Hook to handle sign in
 */
export function useSignIn() {
  const { signIn, isLoading } = useNeonAuth()
  return { signIn, isLoading }
}

/**
 * Hook to handle sign up
 */
export function useSignUp() {
  const { signUp, isLoading } = useNeonAuth()
  return { signUp, isLoading }
}

/**
 * Hook to handle sign out
 */
export function useSignOut() {
  const { signOut, isLoading } = useNeonAuth()
  return { signOut, isLoading }
}

/**
 * Hook to check if user is authenticated
 */
export function useIsAuthenticated() {
  const { isAuthenticated, isLoading } = useNeonAuth()
  return { isAuthenticated, isLoading }
}
