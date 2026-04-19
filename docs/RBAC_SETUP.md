# Role-Based Access Control (RBAC) Setup Guide

This guide explains how to set up and manage role-based access control in your Supabase + Neon banking app.

## Architecture Overview

The RBAC system has three layers:

1. **Database Layer** (Neon PostgreSQL)
   - Users table stores the `role` field ('user' or 'admin')
   - Default role is 'user' for new registrations

2. **Supabase Auth Layer**
   - Supabase manages authentication via JWT tokens
   - Custom JWT claims can include the user's role

3. **Application Layer**
   - Middleware enforces route access based on roles
   - API endpoints check user roles before processing requests
   - Frontend respects role permissions for UI visibility

## Step 1: Database Setup

The users table already has a `role` column:

```sql
ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user';
```

Users are created with role = 'user' by default.

## Step 2: Configure Supabase JWT Custom Claims (Optional but Recommended)

To include user roles in JWT tokens, configure Supabase to add custom claims:

1. Go to your **Supabase Dashboard**
2. Navigate to **Authentication → Policies**
3. Look for **JWT Custom Claims** or **SQL Editor**
4. Add a function or policy to include role in the JWT:

```sql
-- Create a function to add role to JWT claims
create or replace function public.custom_access_token_hook(event jsonb) 
returns jsonb language plpgsql as $$
declare
  claims jsonb;
  user_role text;
begin
  -- Get the user's role from the users table
  select role into user_role 
  from public.users 
  where supabase_user_id = (event->>'sub')::uuid;
  
  claims := event->'claims';
  
  -- Add role to claims
  claims := jsonb_set(claims, '{role}', to_jsonb(coalesce(user_role, 'user')));
  
  event := jsonb_set(event, '{claims}', claims);
  return event;
end;
$$;
```

## Step 3: Middleware Role Enforcement

The middleware.ts file automatically:

1. Checks if user has a Supabase session
2. Fetches user role from JWT claims or database fallback
3. Enforces access control:
   - Protects `/admin` routes (admin only)
   - Protects `/dashboard`, `/settings` routes (authenticated users only)
   - Redirects unauthenticated users to `/auth/login`

### Protected Routes

- **Admin Only**: `/admin/*`
- **Authenticated**: `/dashboard`, `/settings`, `/profile`, `/user-dashboard`
- **Public**: `/auth/login`, `/auth/sign-up`, `/`

## Step 4: Managing User Roles

### Via Admin API

**Endpoint**: `PUT /api/admin/users`

```bash
curl -X PUT http://localhost:3000/api/admin/users \
  -H "Content-Type: application/json" \
  -H "x-user-id: <admin-user-id>" \
  -H "x-user-role: admin" \
  -d '{
    "userId": "<target-user-id>",
    "role": "admin"
  }'
```

**Response**:
```json
{
  "success": true,
  "message": "User role updated to admin",
  "user": {
    "id": "...",
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "admin"
  }
}
```

### Via Database

For manual updates in Neon:

```sql
UPDATE users SET role = 'admin' WHERE email = 'user@example.com';
```

## Step 5: Role Permissions

The system defines permissions per role in `lib/auth/rbac.ts`:

### Admin Permissions
- `view_users` - View all users
- `manage_users` - Create/delete users
- `update_user_role` - Change user roles
- `view_transactions` - View all transactions
- `view_accounts` - View all accounts
- `manage_accounts` - Create/delete accounts
- `view_reports` - Access admin reports
- `access_admin_panel` - Access admin dashboard

### User Permissions
- `view_own_profile` - View own profile
- `update_own_profile` - Update own profile
- `view_own_accounts` - View own accounts
- `manage_own_accounts` - Create/manage own accounts
- `view_own_transactions` - View own transactions
- `create_transfers` - Create transfers

## Step 6: Using RBAC in Components

### Check Permission in React

```tsx
import { useAuth } from '@/lib/auth-context'
import { hasPermission } from '@/lib/auth/rbac'

export function AdminPanel() {
  const { user, profile } = useAuth()

  if (!profile || !hasPermission(profile.role as any, 'access_admin_panel')) {
    return <div>Access Denied</div>
  }

  return <div>Admin Dashboard</div>
}
```

### Protect API Routes

```ts
import { verifyAdminAccess } from '@/app/api/middleware/auth'

export async function POST(request: NextRequest) {
  const adminVerification = verifyAdminAccess(request)
  if (adminVerification.error) {
    return adminVerification.error
  }

  // Your admin-only logic here
}
```

## Security Best Practices

1. **Never trust client-side role checks alone** - Always verify roles in middleware and API routes
2. **Use server-side rendering for sensitive data** - Don't expose admin data in initial HTML
3. **Audit role changes** - Log when roles are updated (see audit logging)
4. **Minimize admin users** - Keep the number of admins small
5. **Use strong authentication** - Require 2FA for admin accounts (future feature)
6. **Rotate secrets** - Keep JWT_SECRET and database credentials secure

## Troubleshooting

### Users can't access admin panel
- Check middleware.ts logs
- Verify user role in database: `SELECT email, role FROM users WHERE email='...';`
- Ensure request includes valid `x-user-role` header (if using header-based auth)

### Role changes not taking effect
- Clear browser cookies/cache
- Wait for JWT refresh (typically 1 hour)
- Or sign out and sign back in

### Admins can't update other users' roles
- Verify admin user has `role = 'admin'` in database
- Check API endpoint auth headers are correct
- Review error response from PUT /api/admin/users

## Next Steps

1. Set up JWT custom claims in Supabase dashboard
2. Test admin access by promoting a test user
3. Create an admin dashboard UI (coming soon)
4. Implement audit logging for role changes
5. Add 2FA for admin accounts (future)
