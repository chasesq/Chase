# Neon Auth Setup Guide

This project now uses **Neon Auth** - a managed authentication service that stores users, sessions, and auth configuration directly in your Neon database.

## Quick Start

### 1. Database Setup

The SQL migration script has already been created at `/scripts/setup-neon-auth.sql`. To set up the database schema:

1. Go to your Neon Console: https://console.neon.tech
2. Select your project
3. Navigate to SQL Editor
4. Open the script at `/scripts/setup-neon-auth.sql`
5. Execute the SQL to create the auth schema and tables

This creates:
- `neon_auth.users` - User profiles
- `neon_auth.sessions` - Session management
- `neon_auth.accounts` - OAuth provider accounts
- `neon_auth.credentials` - Password hashes
- `neon_auth.verification_tokens` - Email verification tokens

### 2. Environment Variables

Add the following environment variables to your Vercel project:

```env
# Required for Neon Auth
NEON_AUTH_BASE_URL=https://auth.neon.tech/api/auth  # Get from Neon Console
NEON_AUTH_COOKIE_SECRET=your_secret_here_min_32_chars  # Generate a secure random string

# Optional - Public variable for client-side auth
NEXT_PUBLIC_NEON_AUTH_URL=https://auth.neon.tech/api/auth
```

**To get NEON_AUTH_BASE_URL:**
1. Go to Neon Console → Your Project → Auth
2. Copy the "Auth API Endpoint" value

**To generate NEON_AUTH_COOKIE_SECRET:**
```bash
openssl rand -base64 32
```

### 3. Update Project Settings

Go to your project settings and add these environment variables in the "Vars" section.

## Architecture

### Auth Flow

1. **User submits login/signup** on `/auth/login` or `/auth/sign-up`
2. **Form calls Neon Auth API** via `/api/auth/[...path]` route
3. **Neon Auth validates** credentials against the database
4. **Session cookie created** automatically by Neon Auth
5. **User redirected** to authenticated pages (dashboard)

### Key Files

- **`/lib/auth/server.ts`** - Server-side auth configuration
- **`/lib/auth/client.ts`** - Client-side auth SDK initialization
- **`/lib/auth/neon-context.tsx`** - Auth provider (React context)
- **`/lib/auth/hooks.ts`** - Reusable auth hooks
- **`/app/api/auth/[...path]/route.ts`** - Auth API endpoint
- **`/scripts/setup-neon-auth.sql`** - Database schema

### Updated Components

- **`/components/login-form.tsx`** - Uses Neon Auth for sign-in
- **`/components/sign-up-form.tsx`** - Uses Neon Auth for sign-up
- **`/components/logout-button.tsx`** - Uses Neon Auth for sign-out
- **`/components/forgot-password-form.tsx`** - Uses Neon Auth for password reset
- **`/app/page.tsx`** - Dashboard now checks Neon Auth session

## Using Auth in Components

### Get Current User

```tsx
'use client'

import { useUser } from '@/lib/auth/hooks'

export function MyComponent() {
  const { user, isLoading } = useUser()
  
  if (isLoading) return <p>Loading...</p>
  if (!user) return <p>Not authenticated</p>
  
  return <p>Welcome, {user.email}!</p>
}
```

### Sign In

```tsx
'use client'

import { useSignIn } from '@/lib/auth/hooks'

export function LoginButton() {
  const { signIn, isLoading } = useSignIn()
  
  const handleLogin = async (email: string, password: string) => {
    try {
      await signIn(email, password)
      // User is now authenticated, will be redirected
    } catch (error) {
      console.error('Login failed:', error)
    }
  }
  
  return (
    <button 
      onClick={() => handleLogin('user@example.com', 'password')}
      disabled={isLoading}
    >
      {isLoading ? 'Signing in...' : 'Sign In'}
    </button>
  )
}
```

### Check Authentication

```tsx
'use client'

import { useIsAuthenticated } from '@/lib/auth/hooks'

export function ProtectedComponent() {
  const { isAuthenticated, isLoading } = useIsAuthenticated()
  
  if (isLoading) return <p>Checking...</p>
  if (!isAuthenticated) return <p>Please log in</p>
  
  return <p>This content is protected</p>
}
```

### Sign Out

```tsx
'use client'

import { useSignOut } from '@/lib/auth/hooks'

export function LogoutButton() {
  const { signOut, isLoading } = useSignOut()
  
  return (
    <button 
      onClick={() => signOut()}
      disabled={isLoading}
    >
      {isLoading ? 'Signing out...' : 'Sign Out'}
    </button>
  )
}
```

## Database Branching

One of the key benefits of Neon Auth is **branch-aware authentication**:

- When you create a preview branch in Vercel, your Neon database also branches
- Each branch has its own complete auth state (users, sessions, OAuth configs)
- Test authentication flows in preview environments without affecting production
- Use the Neon Create Branch GitHub Action for CI/CD workflows

## Security Features

✅ **Row-Level Security (RLS)** - Users can only access their own data  
✅ **HTTPS-only cookies** - Session cookies are secure by default  
✅ **Password hashing** - Passwords are hashed with bcrypt  
✅ **Email verification** - Support for email verification tokens  
✅ **OAuth support** - Can add OAuth providers (Google, GitHub, etc.)  

## Pricing

Neon Auth is included in all Neon plans based on Monthly Active Users (MAU):
- **Free**: Up to 60,000 MAU
- **Launch**: Up to 1M MAU
- **Scale**: Up to 1M MAU

## Troubleshooting

### "Auth base URL not configured"
- Make sure `NEON_AUTH_BASE_URL` is set in your environment variables
- Verify it's in the format: `https://auth.neon.tech/api/auth`

### "Session not found"
- Check that cookies are enabled in your browser
- Verify the cookie secret is set correctly
- Check browser DevTools → Application → Cookies for `__auth` cookie

### "CORS errors"
- Ensure your redirect URLs are correct
- Check that `NEXT_PUBLIC_NEON_AUTH_URL` matches your deployment domain

### "Database connection failed"
- Verify your `DATABASE_URL` is correct
- Check that your IP is allowed in Neon Console IP Allow list
- Run the migration script in `/scripts/setup-neon-auth.sql` to create tables

## Resources

- [Neon Auth Documentation](https://neon.com/docs/auth)
- [Better Auth Documentation](https://www.better-auth.com/)
- [Neon Dashboard](https://console.neon.tech)
- [Neon CLI Reference](https://neon.com/docs/reference/neon-cli)

## Next Steps

1. ✅ Execute the database migration script
2. ✅ Set up environment variables
3. ✅ Test the login flow at `/auth/login`
4. ✅ Test the sign-up flow at `/auth/sign-up`
5. ✅ Deploy to Vercel
6. Optional: Add OAuth providers (Google, GitHub, etc.)
7. Optional: Enable MFA/2FA
8. Optional: Add password reset email flow
