# Role-Based Auth System - Quick Start Guide

## 🚀 How It Works

### Customer Journey
```
Sign Up at /auth/sign-up
     ↓
Email + Password → User created with role='customer'
     ↓
Checking account auto-created with balance=$0
     ↓
Redirect to /dashboard
     ↓
Full access to customer features:
- /dashboard (profile & accounts)
- /transfer (between own accounts)
- /transactions (transaction history)
```

### Admin Journey
```
Login with admin account (role='admin' in DB)
     ↓
Session set with role
     ↓
Access /admin dashboard
     ↓
View all features:
- Users & Balances (new!)
- New Users
- Pending Transfers
- Transfer History
- And more...
```

## 🔐 Access Control

### Public Routes (No Auth Required)
- `/auth/login`
- `/auth/sign-up`
- `/` (home)

### Customer Routes (Auth Required, role='customer')
- `/dashboard` - Profile and account management
- `/transfer` - Send money between own accounts
- `/transactions` - View transaction history
- `/settings` - User settings

### Admin Routes (Auth Required, role='admin')
- `/admin` - All admin features
  - Users & Balances (new feature!)
  - Create Users
  - Manage Transfers
  - Financial Accounts
  - And more...

## 📊 What Customers See

**Dashboard:**
- Own profile information
- Own account list with balances
- Own account details

**Transfers:**
- Own accounts only
- Send between own accounts
- All transfers personal (not to other users)

**Transactions:**
- Own transaction history only
- By account
- View status, amount, type

## 📊 What Admins See

**Users & Balances (NEW!):**
- All customers in a table
- Email, name, role, account count
- Total balance per customer
- System-wide total balance
- Join date

**Other Tabs:**
- Create new users
- Manage transfers
- Financial accounts
- Payout schedules
- Issuing & cards
- Credit management
- Test utilities

## 🗄️ Database Tables

### Users Table
```sql
- id (UUID)
- email
- password_hash
- full_name
- phone
- address
- role (VARCHAR) -- 'customer' or 'admin'
- created_at
- updated_at
```

### Accounts Table
```sql
- id (UUID)
- user_id (references users)
- account_type ('Checking', 'Savings', etc.)
- account_number
- balance (DECIMAL) -- Starts at 0
- currency ('USD')
- created_at
- updated_at
```

### Sessions Table
```sql
- id
- user_id
- token (UUID)
- expires_at
- created_at
```

## 🔑 Key APIs

### Signup (Public)
```
POST /api/auth/sign-up
{
  email: "user@example.com",
  password: "SecurePassword123",
  full_name: "John Doe"
}

Response includes:
- id, email, full_name
- role: "customer" (always for signup)
- checking_account (auto-created, balance: 0)
```

### Get User Accounts (Auth Required)
```
GET /api/accounts

Response:
{
  success: true,
  accounts: [
    {
      id: "...",
      name: "Checking",
      type: "Checking",
      balance: 0,
      account_number: "..."
    }
  ],
  totalBalance: 0
}
```

### Get All Users with Balances (Admin Only)
```
GET /api/admin/users-balances

Response:
{
  success: true,
  users: [
    {
      id: "...",
      email: "customer@example.com",
      full_name: "John Doe",
      role: "customer",
      account_count: 1,
      total_balance: 0,
      created_at: "2024-..."
    }
  ],
  totalBalance: 0,
  count: 1
}
```

## 🧪 Testing

### 1. Create a Customer
```bash
curl -X POST http://localhost:3000/api/auth/sign-up \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123",
    "full_name": "Test User"
  }'
```

Expected response:
```json
{
  "success": true,
  "user": {
    "role": "customer",
    "checking_account": {
      "balance": 0
    }
  }
}
```

### 2. Access Customer Dashboard
```bash
# Without session: redirected to login
curl http://localhost:3000/dashboard

# With session: shows dashboard
curl -b "chase_session_token=..." http://localhost:3000/dashboard
```

### 3. Try to Access Admin as Customer
```bash
# Middleware redirects to dashboard
curl -b "chase_session_token=..." http://localhost:3000/admin
# → Redirects to /dashboard
```

### 4. Access Admin Dashboard
```bash
# Must have role='admin' in database
curl -b "chase_session_token=..." http://localhost:3000/admin
# → Shows admin dashboard with all users & balances
```

## 📝 Manual Admin Setup

If you need to create an admin user without signup:

```sql
INSERT INTO users (
  email,
  password_hash,
  full_name,
  role,
  currency_preference,
  language_preference,
  created_at,
  updated_at
) VALUES (
  'admin@example.com',
  '$2b$12$...',  -- bcrypt hash of password
  'Admin User',
  'admin',       -- Set role to 'admin'
  'USD',
  'en',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);
```

## 🛡️ Security Features

✅ Role-based access control (RBAC)
✅ Role stored in secure session cookie
✅ Passwords hashed with bcrypt
✅ HttpOnly cookies prevent XSS
✅ Middleware enforces authorization
✅ Row-level data isolation
✅ No admin data leaked to customers
✅ Each customer only sees own data

## 🔄 Session Flow

```
1. User logs in
2. Password verified via bcrypt
3. createUserSession() called
4. UUID token generated
5. Token stored in DB with user_id
6. Token set in httpOnly cookie (7 days)
7. On each request:
   - Middleware reads cookie
   - getSession(token) fetches user + role
   - Component validates role
   - Access granted/denied
8. Logout: session deleted, cookie cleared
```

## 📚 Files to Know

- `middleware.ts` - Route protection & redirects
- `lib/db.ts` - Role functions & queries
- `lib/auth.ts` - Session management
- `lib/auth-context.tsx` - React auth state
- `lib/auth/protected-admin.tsx` - Admin route wrapper
- `app/api/admin/users-balances/route.ts` - Admin data API
- `scripts/007-add-user-roles.sql` - Database migration

## ⚠️ Important Notes

1. **First Login After Migration**
   - Run `scripts/007-add-user-roles.sql` to add role column
   - All existing users set to role='customer'
   - Create admin users manually in database

2. **Zero Balance Design**
   - New accounts start with balance=0
   - Balances updated through transaction system
   - Admin can view total balances per user

3. **Session Duration**
   - Sessions expire after 7 days
   - Can be changed in `lib/auth.ts`
   - SESSION_DURATION = 7 * 24 * 60 * 60 * 1000

4. **Database Connection**
   - Requires DATABASE_URL environment variable
   - Must point to valid Neon PostgreSQL instance
   - Connection pooling handled by @neondatabase/serverless

## 🚨 Troubleshooting

### "Unauthorized" when accessing admin
→ Check user role in database: `SELECT id, email, role FROM users WHERE email='admin@example.com';`

### Redirects to login when should be logged in
→ Check session cookie is set: `document.cookie` in browser console
→ Check session in database: `SELECT * FROM sessions WHERE user_id='...' AND expires_at > NOW();`

### Can't create account on signup
→ Check DATABASE_URL is set
→ Check users table exists: `SELECT * FROM users LIMIT 1;`
→ Check password validation requirements in lib/auth.ts

### Dashboard shows no accounts after signup
→ Check accounts table exists
→ Check account was created: `SELECT * FROM accounts WHERE user_id='...';`
→ Check /api/accounts endpoint response

## 📞 Support

See `ROLE_BASED_AUTH_IMPLEMENTATION.md` for detailed technical documentation.
