# Role-Based Authentication Flow Implementation

## Overview
This document outlines the complete implementation of a two-tier authentication system with separate customer and admin flows. Customers get immediate dashboard access with a zero balance, while admins see aggregated system data.

## Implementation Summary

### 1. Database Schema Updates ✅
**File**: `scripts/007-add-user-roles.sql`

Added role-based access control to the users table:
- Added `role` column (VARCHAR(50)) with CHECK constraint for 'customer' | 'admin'
- Default value: 'customer'
- Created index on `users.role` for query performance
- Supports both `users` and `public.users` tables
- All existing users set to 'customer' role

### 2. Database Functions ✅
**File**: `lib/db.ts`

Added new role-aware database functions:
- `getUserRole(userId)` - Get user's role ('customer' | 'admin' | null)
- `updateUserRole(userId, role)` - Update user role (admin only)
- `createAdminUser(data)` - Create admin user with role='admin'
- `getUserTotalBalance(userId)` - Sum all accounts for a user
- `getAllUsersWithBalances()` - Aggregated view of all users with account counts and total balances
- Updated `getSession(token)` - Now includes role in session data

### 3. Authentication Flow ✅
**File**: `lib/auth.ts`

Session management includes role information:
- `getCurrentUser()` returns role along with id, email, full_name
- `createUserSession()` stores role in session cookie
- Role persists across page navigation through session management
- Password hashing and verification unchanged

### 4. Signup Route Enhancement ✅
**File**: `app/api/auth/sign-up/route.ts`

Customer signup flow:
- Creates user with default `role = 'customer'`
- Auto-creates checking account with `balance = 0`
- Returns role in signup response
- User immediately gains dashboard access

### 5. Middleware & Route Protection ✅
**File**: `middleware.ts`

Role-based access control:
- `/admin/*` routes require `role = 'admin'` (enforced via ProtectedAdminRoute component)
- `/dashboard`, `/transfer`, `/transactions` require authentication
- `/auth/login`, `/auth/sign-up` redirect authenticated users to `/dashboard`
- Unauthenticated users accessing protected routes redirected to login
- Non-admin users accessing `/admin` redirected to `/dashboard`

### 6. Admin Dashboard Enhancement ✅
**File**: `app/admin/page.tsx`

New admin-only features:
- "Users & Balances" tab showing all customers with aggregated data
- System-wide balance display
- User table with: email, name, role, account count, total balance, join date
- Role badge (Admin in purple, Customer in blue)
- Protected by `ProtectedAdminRoute` component that verifies `role = 'admin'`

**File**: `app/api/admin/users-balances/route.ts`

New API endpoint:
- GET `/api/admin/users-balances` - Admin only
- Returns all users with their aggregated balance data
- Calculates total system balance
- Requires admin role for access

### 7. Customer Dashboard Pages ✅

**File**: `app/dashboard/page.tsx`
- Shows user's own accounts and profile information
- Displays role as 'customer'
- Cannot view other users' data or admin info

**File**: `app/transfer/page.tsx`
- Allows transfers between own accounts
- Validates sufficient balance before transfer
- Shows only user's own accounts
- Transfers are personal, not system-wide

**File**: `app/transactions/page.tsx`
- Transaction history for selected account
- Shows only user's own transactions
- Displays transaction type, amount, status, date
- No visibility into other users' transactions

### 8. Auth Context Integration ✅
**File**: `lib/auth-context.tsx`

The existing AuthContext already supports:
- `userRole: UserRole | null` - Current user's role
- `isAdmin: boolean` - Quick check for admin role
- `profile.role` - Role available in user profile
- `ProtectedAdminRoute` component validates `profile?.role` before granting access

## User Flows

### Customer Flow ✓
1. User visits `/auth/sign-up`
2. Enters email and password
3. Account created with `role = 'customer'`
4. Checking account auto-created with `balance = 0`
5. Session set, user redirected to `/dashboard`
6. Can access:
   - `/dashboard` - View profile and accounts
   - `/transfer` - Transfer between own accounts
   - `/transactions` - View transaction history
7. Cannot access:
   - `/admin` - Middleware redirects to `/dashboard`
   - Admin data endpoints - API validates role

### Admin Flow ✓
1. Admin user login (must have `role = 'admin'` in database)
2. Session created with role
3. Can access `/admin/page.tsx` (protected by ProtectedAdminRoute)
4. Admin dashboard shows:
   - Users & Balances: All customers with aggregated data
   - Total System Balance: Sum of all customer balances
   - User Account Count: Number of accounts per customer
   - User Role Badge: Customer vs Admin indicator
   - Other admin tabs: Users, Transfers, Financial Accounts, etc.
5. Cannot modify customer data directly from dashboard (admin tools available in other tabs)

## Technical Details

### Session Token Flow
1. User authenticates → `createUserSession(userId)`
2. Session token generated and stored in httpOnly cookie
3. `getSession(token)` called on protected routes
4. Returns: `{ user_id, email, full_name, role }`
5. Role validated in `ProtectedAdminRoute` component
6. Middleware prevents unauthorized route access

### Balance Tracking
- Each account has `balance` column (DECIMAL(15,2))
- Accounts created with `balance = 0`
- Balances updated through transaction system
- `getUserTotalBalance()` sums all user's accounts
- `getAllUsersWithBalances()` provides admin view with aggregation

### Data Isolation
- Customers see only their own data via `getCurrentUser()` checks
- Admins have access to aggregated view only
- Direct database queries filtered by `user_id` where applicable
- RLS policies enforce row-level security if using Supabase

## Security Measures

### Authentication
- Passwords hashed with bcrypt (12 rounds)
- Sessions use cryptographically secure tokens (UUID v4)
- HttpOnly cookies prevent XSS access
- Secure flag in production, sameSite=lax

### Authorization
- Role stored in session, validated on each request
- Middleware enforces route-level access control
- Component-level checks in `ProtectedAdminRoute`
- API endpoints validate role before returning admin data

### Data Protection
- No admin data leaked to customer API calls
- Customer APIs only return user's own data
- Admin APIs check role = 'admin' before proceeding
- Database functions isolated by user_id

## Testing Checklist

- [ ] Create new customer account via signup
- [ ] Verify `role = 'customer'` in database
- [ ] Verify checking account created with `balance = 0`
- [ ] Access `/dashboard` immediately after signup
- [ ] Cannot access `/admin` (redirects to `/dashboard`)
- [ ] Can navigate to `/transfer` and `/transactions`
- [ ] Create admin user (via database or CLI)
- [ ] Admin can access `/admin` and all tabs
- [ ] Admin dashboard shows all users and balances
- [ ] Total system balance calculated correctly
- [ ] Customer cannot see other users' data
- [ ] Session persists across page reloads
- [ ] Logout clears role and session

## Files Modified/Created

### Created:
- `scripts/007-add-user-roles.sql` - Database migration
- `app/transfer/page.tsx` - Customer transfer page
- `app/transactions/page.tsx` - Customer transaction history
- `app/api/admin/users-balances/route.ts` - Admin balance aggregation API

### Modified:
- `lib/db.ts` - Added role functions and balance queries
- `lib/auth.ts` - Already included role in getCurrentUser()
- `app/api/auth/sign-up/route.ts` - Added role to response
- `middleware.ts` - Rewritten for role-based access control
- `app/admin/page.tsx` - Added "Users & Balances" tab with admin stats

### Existing (Already Supported):
- `lib/auth-context.tsx` - Already has role support
- `lib/auth/protected-admin.tsx` - Validates admin role
- `lib/auth/roles.ts` - Role utilities
- `app/dashboard/page.tsx` - Works with authenticated users

## Next Steps (Optional Enhancements)

1. **Admin User Management**
   - Create endpoint to promote customers to admins
   - Soft delete users (mark as inactive)
   - View admin audit logs

2. **Balance Management**
   - Manual balance adjustments (admin only)
   - Transaction approval workflow
   - Deposit/withdrawal processing

3. **Enhanced Security**
   - 2FA for admin accounts
   - IP whitelist for admin routes
   - Admin activity audit log

4. **Reporting**
   - Daily balance reports
   - User activity reports
   - System-wide transaction summaries

## Deployment Notes

- Run migration: `scripts/007-add-user-roles.sql`
- Set admin users manually in database or via CLI
- SESSION_COOKIE_NAME: 'chase_session_token'
- SESSION_DURATION: 7 days (configurable in lib/auth.ts)
- Ensure DATABASE_URL is set for Neon connection
- Test signup flow creates account with role='customer'
