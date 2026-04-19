'use client'

import { useAuth } from '@/lib/auth-context'
import { hasPermission, isAdmin, getPermissions, canAccessRoute } from '@/lib/auth/rbac'
import type { UserRole } from '@/lib/auth/rbac'

/**
 * Hook for checking roles and permissions in components
 * Usage:
 *   const { userRole, isAdmin: isUserAdmin, hasPermission: check } = useRBAC()
 *   if (check('access_admin_panel')) { ... }
 */
export function useRBAC() {
  const { profile } = useAuth()

  const userRole = (profile?.role as UserRole | null) || null

  return {
    // Current user's role
    userRole,

    // Check if user is admin
    isAdmin: isAdmin(userRole),

    // Check specific permission
    hasPermission: (permission: string) => hasPermission(userRole, permission),

    // Get all user permissions
    permissions: getPermissions(userRole),

    // Check if user can access a route
    canAccessRoute: (route: string) => canAccessRoute(userRole, route),

    // Check if user can perform action on resource
    canPerformAction: (userId: string, targetUserId: string, action: string) => {
      if (!profile?.id) return false
      return (
        isAdmin(userRole) ||
        (userId === targetUserId &&
          ['view_own_profile', 'update_own_profile', 'view_own_accounts'].includes(action))
      )
    },
  }
}
