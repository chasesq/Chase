/**
 * Role-Based Access Control (RBAC) utilities
 * Provides helper functions for checking user roles and permissions
 */

export type UserRole = 'user' | 'admin'

export interface RolePermissions {
  [key: string]: string[]
}

// Define role-based permissions
const rolePermissions: RolePermissions = {
  admin: [
    'view_users',
    'manage_users',
    'update_user_role',
    'view_transactions',
    'view_accounts',
    'manage_accounts',
    'view_reports',
    'access_admin_panel',
  ],
  user: [
    'view_own_profile',
    'update_own_profile',
    'view_own_accounts',
    'manage_own_accounts',
    'view_own_transactions',
    'create_transfers',
  ],
}

/**
 * Check if a user role has a specific permission
 */
export function hasPermission(role: UserRole | null, permission: string): boolean {
  if (!role) return false
  return rolePermissions[role]?.includes(permission) || false
}

/**
 * Check if a user is an admin
 */
export function isAdmin(role: UserRole | null): boolean {
  return role === 'admin'
}

/**
 * Get all permissions for a role
 */
export function getPermissions(role: UserRole | null): string[] {
  if (!role) return []
  return rolePermissions[role] || []
}

/**
 * Check if user can access a route based on their role
 */
export function canAccessRoute(role: UserRole | null, route: string): boolean {
  if (!role) return false

  // Admin can access all routes
  if (isAdmin(role)) return true

  // User routes
  const userRoutes = ['/dashboard', '/profile', '/accounts', '/transactions', '/transfer']
  return userRoutes.some(r => route.startsWith(r))
}

/**
 * Check if user can perform an action on a resource
 */
export function canPerformAction(
  userRole: UserRole | null,
  userId: string,
  targetUserId: string,
  action: string
): boolean {
  // Admins can perform any action
  if (isAdmin(userRole)) return true

  // Regular users can only perform actions on their own data
  if (userId === targetUserId) {
    return ['view_own_profile', 'update_own_profile', 'view_own_accounts'].includes(action)
  }

  return false
}
