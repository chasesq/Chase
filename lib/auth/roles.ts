/**
 * Role-Based Access Control (RBAC) Constants and Utilities
 * Defines user roles, permissions, and helper functions for authorization
 */

export type UserRole = 'admin' | 'user' | 'moderator';

export const ROLES = {
  ADMIN: 'admin' as UserRole,
  USER: 'user' as UserRole,
  MODERATOR: 'moderator' as UserRole,
};

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrator',
  user: 'User',
  moderator: 'Moderator',
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  admin: 'Full system access with user and transfer management',
  user: 'Standard user with personal account access',
  moderator: 'Support and compliance role',
};

/**
 * Permission definitions for each role
 * Uses a simple permission model: admin has all, user has limited, moderator has some admin features
 */
export const PERMISSIONS: Record<UserRole, string[]> = {
  admin: [
    'view_users',
    'manage_users',
    'view_transfers',
    'manage_transfers',
    'view_accounts',
    'manage_accounts',
    'view_reports',
    'export_data',
    'access_admin_dashboard',
    'manage_roles',
  ],
  user: [
    'view_own_profile',
    'edit_own_profile',
    'view_own_accounts',
    'create_transactions',
    'view_own_transactions',
  ],
  moderator: [
    'view_users',
    'view_transfers',
    'view_accounts',
    'view_reports',
    'manage_transfers',
  ],
};

/**
 * Check if a user with the given role has a specific permission
 * @param role - The user's role
 * @param permission - The permission to check
 * @returns true if the role has the permission, false otherwise
 */
export function hasPermission(role: UserRole, permission: string): boolean {
  return PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Check if a user role is an admin
 * @param role - The user's role
 * @returns true if the role is admin, false otherwise
 */
export function isAdminRole(role: UserRole): boolean {
  return role === ROLES.ADMIN;
}

/**
 * Check if a user role is a moderator
 * @param role - The user's role
 * @returns true if the role is moderator, false otherwise
 */
export function isModeratorRole(role: UserRole): boolean {
  return role === ROLES.MODERATOR;
}

/**
 * Check if a user role is a standard user
 * @param role - The user's role
 * @returns true if the role is user, false otherwise
 */
export function isUserRole(role: UserRole): boolean {
  return role === ROLES.USER;
}

/**
 * Validate a role string against the defined roles
 * @param role - The role string to validate
 * @returns true if the role is valid, false otherwise
 */
export function isValidRole(role: string): role is UserRole {
  return Object.values(ROLES).includes(role as UserRole);
}

/**
 * Get the default role for new users
 * @returns The default user role
 */
export function getDefaultRole(): UserRole {
  return ROLES.USER;
}
