/**
 * API Authentication Middleware
 * Provides utilities for verifying user roles and permissions in API routes
 */

import { NextRequest, NextResponse } from 'next/server'
import { hasPermission, type UserRole } from '@/lib/auth/roles'

export interface AuthContext {
  userId: string | null
  role: UserRole | null
  isAdmin: boolean
  hasPermission: (permission: string) => boolean
}

/**
 * Extract authentication context from request headers
 * @param request - The NextRequest object
 * @returns AuthContext with user info and permission helpers
 */
export function getAuthContext(request: NextRequest): AuthContext {
  const userId = request.headers.get('x-user-id')
  const role = request.headers.get('x-user-role') as UserRole | null

  return {
    userId,
    role,
    isAdmin: role === 'admin',
    hasPermission: (permission: string) => {
      if (!role) return false
      return hasPermission(role, permission)
    },
  }
}

/**
 * Verify admin access for an API route
 * @param request - The NextRequest object
 * @returns { error: null, context } on success, { error: NextResponse } on failure
 */
export function verifyAdminAccess(request: NextRequest): { error: null; context: AuthContext } | { error: NextResponse } {
  const context = getAuthContext(request)

  if (!context.isAdmin) {
    return {
      error: NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      ),
    }
  }

  return { error: null, context }
}

/**
 * Verify that user has a specific permission
 * @param request - The NextRequest object
 * @param permission - The permission to check
 * @returns { error: null, context } on success, { error: NextResponse } on failure
 */
export function verifyPermission(request: NextRequest, permission: string): { error: null; context: AuthContext } | { error: NextResponse } {
  const context = getAuthContext(request)

  if (!context.hasPermission(permission)) {
    return {
      error: NextResponse.json(
        { error: `Unauthorized - ${permission} permission required` },
        { status: 403 }
      ),
    }
  }

  return { error: null, context }
}

/**
 * Verify user is authenticated
 * @param request - The NextRequest object
 * @returns { error: null, context } on success, { error: NextResponse } on failure
 */
export function verifyAuthenticated(request: NextRequest): { error: null; context: AuthContext } | { error: NextResponse } {
  const context = getAuthContext(request)

  if (!context.userId) {
    return {
      error: NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      ),
    }
  }

  return { error: null, context }
}
