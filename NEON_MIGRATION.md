# Neon Database Migration Guide

## Overview
Successfully migrated from Supabase Auth to Neon PostgreSQL with custom authentication system.

## What Changed

### Database
- **Provider**: Supabase → Neon PostgreSQL
- **Tables Created**:
  - `users`: User accounts with password hashing
  - `sessions`: Session management with token-based auth
  - `accounts`: User bank accounts
  - `transactions`: Transaction history

### Authentication
- **Type**: Supabase Auth → Custom JWT/Token-based
- **Password Hashing**: bcrypt (12 rounds)
- **Session Storage**: Database + HTTP-only cookies

### Environment Variables
Required:
- `DATABASE_URL`: Neon connection string (already set)

### API Routes
1. **POST `/api/auth/sign-up`**
   - Creates new user with hashed password
   - Auto-creates session
   - Returns user profile

2. **POST `/api/auth/login`**
   - Validates email and password
   - Creates session with secure cookie
   - Returns user profile

3. **PUT `/api/auth/profile`**
   - Updates user profile information
   - Requires userId

## Key Features

### Security
✅ Passwords hashed with bcrypt (12 rounds)
✅ Session tokens stored in HTTP-only cookies
✅ Password validation on signup
✅ Email format validation

### User Experience
✅ Auto-login after successful signup
✅ Dashboard accessible immediately after login
✅ Session persistence via localStorage + cookies
✅ Profile data cached in localStorage

## Testing

### Sign Up Flow
1. Go to `/auth/sign-up`
2. Fill in name, email, phone, password
3. Submit - creates user and auto-logs in
4. Redirects to dashboard `/`

### Login Flow
1. Go to `/auth/login`
2. Enter email and password
3. Submit - validates and creates session
4. Redirects to dashboard `/`

### Logout
- Click logout in dashboard
- Clears session and localStorage
- Redirects to login page

## File Structure

```
lib/
├── db.ts                    # Database operations
├── auth.ts                  # Password hashing, session management
└── auth-context.tsx         # React auth context

app/api/auth/
├── sign-up/route.ts        # User registration
├── login/route.ts          # User authentication
└── profile/route.ts        # Profile management

components/
├── login-form.tsx          # Login form component
└── sign-up-form.tsx        # Sign-up form component

scripts/
└── init-neon-db.ts         # Database initialization
```

## Troubleshooting

### Database Connection
- Check `DATABASE_URL` env var is set correctly
- Verify Neon database is running
- Check network connectivity

### Login Issues
- Ensure password meets requirements (8+ chars, uppercase, number)
- Verify user email exists in database
- Check browser cookies are enabled

### Session Issues
- Clear localStorage and cookies
- Check session token hasn't expired (7 days)
- Verify `chase_session_token` cookie is set
