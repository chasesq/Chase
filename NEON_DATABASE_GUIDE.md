# Neon Database Guide - Chase Banking App

## Overview

This application uses **Neon** - a serverless PostgreSQL database - as its primary data store. All banking operations, user management, and financial transactions are managed through Neon.

### Connection
- **Library**: `@neondatabase/serverless` (HTTP-based)
- **Environment**: `DATABASE_URL` (automatically set by Vercel integration)
- **Location**: `/lib/db.ts`

---

## Database Schema

### 1. **Users Table**
Stores user account information and authentication data.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  phone TEXT,
  role TEXT DEFAULT 'user',
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  totp_secret TEXT,
  backup_codes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);
```

**Key Fields:**
- `id`: Unique user identifier
- `email`: User login email (unique)
- `password_hash`: Bcrypt hashed password
- `two_factor_enabled`: 2FA status
- `role`: User role (user, admin, etc.)

---

### 2. **Accounts Table**
Stores bank accounts linked to users.

```sql
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Checking Account',
  account_type TEXT NOT NULL DEFAULT 'checking',
  account_number TEXT,
  full_account_number TEXT,
  routing_number TEXT DEFAULT '021000021',
  balance NUMERIC(15,2) DEFAULT 0.00,
  available_balance NUMERIC(15,2) DEFAULT 0.00,
  interest_rate NUMERIC(6,4) DEFAULT 0.01,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Account Types:**
- `checking`: Checking account (default for new users)
- `savings`: Savings account
- `money_market`: Money market account
- `credit_card`: Credit card account

---

### 3. **Transactions Table**
Records all financial transactions.

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES accounts(id),
  user_id UUID REFERENCES users(id),
  description TEXT NOT NULL,
  amount NUMERIC(15,2) NOT NULL,
  type TEXT NOT NULL DEFAULT 'debit',
  category TEXT DEFAULT 'general',
  status TEXT DEFAULT 'completed',
  recipient_name TEXT,
  recipient_account TEXT,
  transaction_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Transaction Types:**
- `debit`: Money out
- `credit`: Money in
- `transfer`: Account to account
- `payment`: Bill payment

**Categories:**
- General, Groceries, Utilities, Entertainment, Travel, etc.

---

### 4. **Bill Payments Table**
Manages scheduled bill payments.

```sql
CREATE TABLE bill_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  from_account_id UUID REFERENCES accounts(id),
  amount NUMERIC(15,2) NOT NULL,
  payee TEXT NOT NULL,
  due_date DATE,
  scheduled_date DATE,
  frequency TEXT DEFAULT 'once',
  status TEXT DEFAULT 'processing',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Frequency Options:**
- `once`: One-time payment
- `weekly`: Every week
- `biweekly`: Every two weeks
- `monthly`: Every month
- `quarterly`: Every three months
- `annual`: Once per year

---

### 5. **Wire Transfers Table**
Stores wire transfer records.

```sql
CREATE TABLE wire_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  from_account_id UUID REFERENCES accounts(id),
  amount NUMERIC(15,2) NOT NULL,
  recipient_name TEXT,
  recipient_bank TEXT,
  recipient_routing_number TEXT,
  recipient_account_number TEXT,
  status TEXT DEFAULT 'processing',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 6. **Zelle Transfers Table**
Records person-to-person Zelle transfers.

```sql
CREATE TABLE zelle_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  from_account_id UUID REFERENCES accounts(id),
  amount NUMERIC(15,2) NOT NULL,
  recipient_email TEXT,
  recipient_phone TEXT,
  recipient_name TEXT,
  status TEXT DEFAULT 'sent',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 7. **Notifications Table**
Manages user notifications and alerts.

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT DEFAULT 'info',
  category TEXT DEFAULT 'general',
  is_read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Notification Types:**
- `info`: Informational
- `warning`: Warning message
- `alert`: Critical alert
- `success`: Success confirmation
- `error`: Error notification

---

### 8. **Credit Scores Table**
Tracks user credit information.

```sql
CREATE TABLE credit_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER DEFAULT 750,
  status TEXT DEFAULT 'good',
  trend TEXT DEFAULT 'stable',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Status Options:**
- `poor`: < 580
- `fair`: 580-669
- `good`: 670-739
- `very_good`: 740-799
- `excellent`: 800+

---

### 9. **Login History Table**
Records user login activities for security.

```sql
CREATE TABLE login_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  device TEXT,
  location TEXT,
  ip_address TEXT,
  status TEXT DEFAULT 'success',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 10. **User Settings Table**
Stores user preferences and configurations.

```sql
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  dark_mode BOOLEAN DEFAULT FALSE,
  language TEXT DEFAULT 'English',
  currency TEXT DEFAULT 'USD',
  biometric_login BOOLEAN DEFAULT FALSE,
  two_factor_method TEXT DEFAULT 'sms',
  session_timeout INTEGER DEFAULT 15,
  settings_data JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Database Functions

All database functions are in `/lib/db.ts`. Here's how to use them:

### User Operations

```typescript
import { createUser, getUserByEmail, getUserById } from '@/lib/db'

// Create a new user
const user = await createUser({
  email: 'user@example.com',
  password_hash: 'hashed_password',
  full_name: 'John Doe',
  phone: '+1234567890'
})

// Get user by email
const user = await getUserByEmail('user@example.com')

// Get user by ID
const user = await getUserById('user-uuid-here')
```

### Account Operations

```typescript
import { 
  getUserAccounts, 
  getAccountById, 
  createAccount,
  getUserTotalBalance 
} from '@/lib/db'

// Get all accounts for a user
const accounts = await getUserAccounts(userId)

// Get specific account
const account = await getAccountById(accountId)

// Create new account
const account = await createAccount(userId, {
  account_type: 'savings',
  account_number: '****1234',
  balance: 0,
  currency: 'USD'
})

// Get user's total balance across all accounts
const totalBalance = await getUserTotalBalance(userId)
```

### Transaction Operations

```typescript
import { 
  getAccountTransactions, 
  createTransaction 
} from '@/lib/db'

// Get transactions for an account
const transactions = await getAccountTransactions(accountId, limit = 50)

// Create a transaction
const transaction = await createTransaction(userId, accountId, {
  type: 'debit',
  amount: 50.00,
  description: 'Coffee purchase',
  category: 'general',
  recipient_name: 'Starbucks'
})
```

### Balance Operations

```typescript
import { 
  getAccountBalance, 
  updateAccountBalance 
} from '@/lib/db'

// Get current balance
const { balance, available_balance } = await getAccountBalance(accountId)

// Update balance
const updated = await updateAccountBalance(accountId, 1500.00)
```

### Notification Operations

```typescript
import { 
  getUserNotifications, 
  createNotification, 
  markNotificationAsRead,
  getUnreadNotificationCount 
} from '@/lib/db'

// Get notifications
const notifications = await getUserNotifications(userId, limit = 20)

// Create notification
const notif = await createNotification(userId, {
  title: 'Transfer Completed',
  message: 'Your transfer of $100 was successful',
  type: 'success',
  category: 'transactions'
})

// Mark as read
await markNotificationAsRead(notificationId)

// Get unread count
const unreadCount = await getUnreadNotificationCount(userId)
```

### Bill Payment Operations

```typescript
import { 
  getUserBillPayments, 
  createBillPayment,
  updateBillPaymentStatus 
} from '@/lib/db'

// Get user's bills
const bills = await getUserBillPayments(userId)

// Create bill payment
const bill = await createBillPayment(userId, accountId, {
  payee: 'Electric Company',
  amount: 150.00,
  due_date: '2024-05-15',
  frequency: 'monthly'
})

// Update bill status
await updateBillPaymentStatus(billId, 'completed')
```

### Wire Transfer Operations

```typescript
import { 
  createWireTransfer, 
  getUserWireTransfers 
} from '@/lib/db'

// Create wire transfer
const wire = await createWireTransfer(userId, accountId, {
  amount: 5000.00,
  recipient_name: 'John Smith',
  recipient_bank: 'Chase Bank',
  recipient_routing_number: '021000021',
  recipient_account_number: '1234567890'
})

// Get user's wire transfers
const wires = await getUserWireTransfers(userId)
```

### Zelle Transfer Operations

```typescript
import { 
  createZelleTransfer, 
  getUserZelleTransfers 
} from '@/lib/db'

// Create Zelle transfer
const zelle = await createZelleTransfer(userId, accountId, {
  amount: 100.00,
  recipient_name: 'Jane Doe',
  recipient_email: 'jane@example.com'
})

// Get user's Zelle transfers
const zelles = await getUserZelleTransfers(userId)
```

### Credit Score Operations

```typescript
import { 
  getUserCreditScore, 
  updateCreditScore 
} from '@/lib/db'

// Get credit score
const creditInfo = await getUserCreditScore(userId)

// Update credit score
await updateCreditScore(userId, {
  score: 780,
  status: 'very_good',
  trend: 'improving'
})
```

### Login History Operations

```typescript
import { 
  createLoginHistory, 
  getUserLoginHistory 
} from '@/lib/db'

// Record login
const login = await createLoginHistory(userId, {
  device: 'Chrome on macOS',
  location: 'San Francisco, CA',
  ip_address: '192.168.1.1',
  status: 'success'
})

// Get login history
const history = await getUserLoginHistory(userId, limit = 20)
```

### User Settings Operations

```typescript
import { 
  getUserSettings, 
  updateUserSettings 
} from '@/lib/db'

// Get user settings
const settings = await getUserSettings(userId)

// Update settings
await updateUserSettings(userId, {
  dark_mode: true,
  language: 'Spanish',
  currency: 'EUR',
  session_timeout: 30
})
```

---

## Best Practices

### 1. **Always Null-Check Results**
```typescript
const user = await getUserById(userId)
if (!user) {
  throw new Error('User not found')
}
```

### 2. **Use Transactions for Multiple Operations**
```typescript
// When updating balance and creating transaction together
const balance = await getAccountBalance(accountId)
const newBalance = balance.balance - amount
await updateAccountBalance(accountId, newBalance)
await createTransaction(userId, accountId, { ... })
```

### 3. **Handle Errors Appropriately**
```typescript
try {
  const result = await createUser({ ... })
} catch (error) {
  if (error.message.includes('duplicate')) {
    // Handle duplicate email
  }
  throw error
}
```

### 4. **Use Appropriate Limits**
```typescript
// Don't fetch unlimited records
const transactions = await getAccountTransactions(accountId, 50) // Limit to 50
```

### 5. **Index-Friendly Queries**
The database includes indexes on:
- `accounts(user_id)`
- `transactions(user_id, account_id, created_at)`
- `notifications(user_id)`
- `bill_payments(user_id)`
- `login_history(user_id)`

---

## Common Operations

### Sign Up New User

```typescript
const newUser = await createUser({
  email: email,
  password_hash: await hashPassword(password),
  full_name: fullName,
  phone: phoneNumber
})

// Create checking account automatically
const account = await createAccount(newUser.id, {
  account_type: 'checking',
  account_number: generateAccountNumber(),
  balance: 0,
  currency: 'USD'
})
```

### Process Transaction

```typescript
// Debit from account
const currentBalance = await getAccountBalance(accountId)
const newBalance = currentBalance.balance - transactionAmount

await updateAccountBalance(accountId, newBalance)

const transaction = await createTransaction(userId, accountId, {
  type: 'debit',
  amount: transactionAmount,
  description: description
})

// Create notification
await createNotification(userId, {
  title: 'Transaction Processed',
  message: `$${transactionAmount} has been deducted`,
  type: 'success'
})
```

### Get User Dashboard Data

```typescript
const [accounts, notifications, creditScore] = await Promise.all([
  getUserAccounts(userId),
  getUserNotifications(userId, 10),
  getUserCreditScore(userId)
])

const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0)
```

---

## Row-Level Security (RLS)

All tables have RLS enabled. Current policies allow:
- Users can read their own data
- Users can insert their own data
- Users can update their own data
- Users can delete their own data

Modify RLS policies in the migration scripts if additional restrictions are needed.

---

## Performance Tips

1. **Use Limits**: Always limit query results (e.g., LIMIT 50)
2. **Index on Foreign Keys**: Indexes exist on user_id columns
3. **Connection Pooling**: HTTP connections are automatically pooled by Neon
4. **Avoid N+1 Queries**: Use Promise.all() for parallel queries
5. **Cache When Possible**: Cache user settings and frequently accessed data

---

## Monitoring & Logs

Monitor your Neon database at:
- **Console**: [https://console.neon.tech](https://console.neon.tech)
- **Vercel Integration**: Settings → Integrations → Neon

Check query performance in:
- Neon Console → Monitoring tab
- Application logs in Vercel dashboard

---

## Environment Variables

Required environment variables (auto-set by Vercel integration):

```
DATABASE_URL=postgresql://user:password@host/database
```

No manual configuration needed if Neon is connected via Vercel marketplace.
