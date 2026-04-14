# API Functions Guide - Chase Banking App

Complete reference for all available API endpoints and database functions.

---

## Authentication

### Sign Up
**Endpoint**: `POST /api/auth/route.ts`
**Function**: `createUser()`

```typescript
// Request
{
  email: "user@example.com",
  password: "SecurePassword123",
  full_name: "John Doe",
  phone: "+1234567890"
}

// Response
{
  id: "user-uuid",
  email: "user@example.com",
  full_name: "John Doe",
  account_number: "9123456789",
  created_at: "2024-04-14T10:00:00Z"
}
```

### Sign In
**Endpoint**: `POST /api/auth/login/route.ts`
**Function**: `getUserByEmail()`, `getSession()`

```typescript
// Request
{
  email: "user@example.com",
  password: "SecurePassword123"
}

// Response
{
  id: "user-uuid",
  email: "user@example.com",
  full_name: "John Doe",
  session_token: "token123"
}
```

---

## User Management

### Get User Profile
**Endpoint**: `GET /api/user/profile`
**Function**: `getUserById()`

```typescript
const user = await getUserById(userId)
// Returns: { id, email, name, phone, role, created_at, last_login }
```

### Update User Profile
**Endpoint**: `PATCH /api/user/profile`
**Function**: `updateUser()`

```typescript
const updated = await updateUser(userId, {
  full_name: "Jane Doe",
  phone: "+1987654321",
  currency_preference: "EUR"
})
```

### Get User Settings
**Endpoint**: `GET /api/user/settings`
**Function**: `getUserSettings()`

```typescript
const settings = await getUserSettings(userId)
// Returns: { dark_mode, language, currency, biometric_login, ... }
```

### Update User Settings
**Endpoint**: `PATCH /api/user/settings`
**Function**: `updateUserSettings()`

```typescript
await updateUserSettings(userId, {
  dark_mode: true,
  language: "Spanish",
  session_timeout: 30
})
```

---

## Accounts

### Get All User Accounts
**Endpoint**: `GET /api/accounts`
**Function**: `getUserAccounts()`

```typescript
const accounts = await getUserAccounts(userId)
// Returns: Array of { id, account_type, balance, account_number, status, ... }
```

Example response:
```json
[
  {
    "id": "account-uuid-1",
    "user_id": "user-uuid",
    "account_type": "checking",
    "account_number": "****1234",
    "balance": 2500.50,
    "available_balance": 2500.50,
    "status": "active",
    "interest_rate": 0.01
  },
  {
    "id": "account-uuid-2",
    "user_id": "user-uuid",
    "account_type": "savings",
    "account_number": "****5678",
    "balance": 10000.00,
    "available_balance": 10000.00,
    "status": "active",
    "interest_rate": 0.04
  }
]
```

### Get Account Details
**Endpoint**: `GET /api/accounts/:accountId`
**Function**: `getAccountById()`

```typescript
const account = await getAccountById(accountId)
// Returns: { id, user_id, account_type, balance, account_number, status, ... }
```

### Create New Account
**Endpoint**: `POST /api/accounts`
**Function**: `createAccount()`

```typescript
// Request
{
  account_type: "savings",
  account_number: "****9999"
}

// Function call
const newAccount = await createAccount(userId, {
  account_type: "savings",
  account_number: "****9999",
  balance: 0,
  currency: "USD"
})

// Response
{
  id: "account-uuid",
  user_id: "user-uuid",
  account_type: "savings",
  balance: 0.00,
  status: "active"
}
```

### Get Total Balance
**Endpoint**: `GET /api/accounts/balance/total`
**Function**: `getUserTotalBalance()`

```typescript
const totalBalance = await getUserTotalBalance(userId)
// Returns: 12500.50 (sum of all accounts)
```

### Get Accounts by Type
**Endpoint**: `GET /api/accounts?type=savings`
**Function**: `getUserAccountsByType()`

```typescript
const savingsAccounts = await getUserAccountsByType(userId, "savings")
// Returns: Array of savings accounts only
```

---

## Transactions

### Get Account Transactions
**Endpoint**: `GET /api/accounts/:accountId/transactions`
**Function**: `getAccountTransactions()`

```typescript
const transactions = await getAccountTransactions(accountId, limit = 50)
// Returns: Array of transactions ordered by date DESC
```

Example response:
```json
[
  {
    "id": "transaction-uuid-1",
    "account_id": "account-uuid",
    "user_id": "user-uuid",
    "type": "debit",
    "amount": 45.99,
    "description": "Starbucks Coffee",
    "category": "dining",
    "status": "completed",
    "recipient_name": "Starbucks",
    "transaction_date": "2024-04-14T09:30:00Z"
  },
  {
    "id": "transaction-uuid-2",
    "account_id": "account-uuid",
    "user_id": "user-uuid",
    "type": "credit",
    "amount": 2500.00,
    "description": "Salary Deposit",
    "category": "income",
    "status": "completed",
    "transaction_date": "2024-04-13T15:00:00Z"
  }
]
```

### Create Transaction
**Endpoint**: `POST /api/accounts/:accountId/transactions`
**Function**: `createTransaction()`

```typescript
// Request
{
  type: "debit",
  amount: 45.99,
  description: "Coffee purchase",
  category: "dining",
  recipient_name: "Starbucks"
}

// Function call
const transaction = await createTransaction(userId, accountId, {
  type: "debit",
  amount: 45.99,
  description: "Coffee purchase",
  category: "dining",
  recipient_name: "Starbucks"
})

// Response
{
  "id": "transaction-uuid",
  "account_id": "account-uuid",
  "user_id": "user-uuid",
  "type": "debit",
  "amount": 45.99,
  "description": "Coffee purchase",
  "category": "dining",
  "status": "completed",
  "transaction_date": "2024-04-14T10:00:00Z"
}
```

---

## Notifications

### Get Notifications
**Endpoint**: `GET /api/notifications`
**Function**: `getUserNotifications()`

```typescript
const notifications = await getUserNotifications(userId, limit = 20)
// Returns: Array of notifications ordered by date DESC
```

Example response:
```json
[
  {
    "id": "notif-uuid-1",
    "user_id": "user-uuid",
    "title": "Transaction Completed",
    "message": "Your transfer of $100 was successful",
    "type": "success",
    "category": "transactions",
    "is_read": false,
    "action_url": "/transactions/uuid",
    "created_at": "2024-04-14T10:30:00Z"
  },
  {
    "id": "notif-uuid-2",
    "user_id": "user-uuid",
    "title": "Login Alert",
    "message": "New login from Chrome on macOS",
    "type": "alert",
    "category": "security",
    "is_read": true,
    "created_at": "2024-04-14T09:00:00Z"
  }
]
```

### Create Notification
**Endpoint**: `POST /api/notifications`
**Function**: `createNotification()`

```typescript
// Request
{
  title: "Transaction Completed",
  message: "Your transfer of $100 was successful",
  type: "success",
  category: "transactions"
}

// Function call
const notif = await createNotification(userId, {
  title: "Transaction Completed",
  message: "Your transfer of $100 was successful",
  type: "success",
  category: "transactions"
})
```

### Mark Notification as Read
**Endpoint**: `PATCH /api/notifications/:notificationId/read`
**Function**: `markNotificationAsRead()`

```typescript
await markNotificationAsRead(notificationId)
// Returns: Updated notification with is_read = true
```

### Get Unread Count
**Endpoint**: `GET /api/notifications/unread/count`
**Function**: `getUnreadNotificationCount()`

```typescript
const unreadCount = await getUnreadNotificationCount(userId)
// Returns: 3 (number of unread notifications)
```

---

## Bill Payments

### Get Bill Payments
**Endpoint**: `GET /api/bills`
**Function**: `getUserBillPayments()`

```typescript
const bills = await getUserBillPayments(userId)
// Returns: Array of bills ordered by due_date ASC
```

Example response:
```json
[
  {
    "id": "bill-uuid",
    "user_id": "user-uuid",
    "from_account_id": "account-uuid",
    "payee": "Electric Company",
    "amount": 150.00,
    "due_date": "2024-04-20",
    "scheduled_date": "2024-04-18",
    "frequency": "monthly",
    "status": "processing"
  }
]
```

### Create Bill Payment
**Endpoint**: `POST /api/bills`
**Function**: `createBillPayment()`

```typescript
// Request
{
  payee: "Electric Company",
  amount: 150.00,
  due_date: "2024-04-20",
  frequency: "monthly"
}

// Function call
const bill = await createBillPayment(userId, accountId, {
  payee: "Electric Company",
  amount: 150.00,
  due_date: "2024-04-20",
  frequency: "monthly"
})
```

### Update Bill Status
**Endpoint**: `PATCH /api/bills/:billId`
**Function**: `updateBillPaymentStatus()`

```typescript
const updated = await updateBillPaymentStatus(billId, "completed")
// Status options: processing, completed, failed, pending
```

---

## Transfers

### Wire Transfer

**Create Wire Transfer**
**Endpoint**: `POST /api/transfers/wire`
**Function**: `createWireTransfer()`

```typescript
// Request
{
  amount: 5000.00,
  recipient_name: "John Smith",
  recipient_bank: "Chase Bank",
  recipient_routing_number: "021000021",
  recipient_account_number: "1234567890"
}

// Function call
const wire = await createWireTransfer(userId, accountId, {
  amount: 5000.00,
  recipient_name: "John Smith",
  recipient_bank: "Chase Bank",
  recipient_routing_number: "021000021",
  recipient_account_number: "1234567890"
})

// Response
{
  "id": "wire-uuid",
  "user_id": "user-uuid",
  "from_account_id": "account-uuid",
  "amount": 5000.00,
  "recipient_name": "John Smith",
  "recipient_bank": "Chase Bank",
  "status": "processing",
  "created_at": "2024-04-14T10:00:00Z"
}
```

**Get Wire Transfers**
**Endpoint**: `GET /api/transfers/wire`
**Function**: `getUserWireTransfers()`

```typescript
const wires = await getUserWireTransfers(userId, limit = 50)
// Returns: Array of wire transfers
```

### Zelle Transfer

**Create Zelle Transfer**
**Endpoint**: `POST /api/transfers/zelle`
**Function**: `createZelleTransfer()`

```typescript
// Request
{
  amount: 100.00,
  recipient_name: "Jane Doe",
  recipient_email: "jane@example.com"
}

// Function call
const zelle = await createZelleTransfer(userId, accountId, {
  amount: 100.00,
  recipient_name: "Jane Doe",
  recipient_email: "jane@example.com"
})

// Response
{
  "id": "zelle-uuid",
  "user_id": "user-uuid",
  "from_account_id": "account-uuid",
  "amount": 100.00,
  "recipient_name": "Jane Doe",
  "recipient_email": "jane@example.com",
  "status": "sent",
  "created_at": "2024-04-14T10:00:00Z"
}
```

**Get Zelle Transfers**
**Endpoint**: `GET /api/transfers/zelle`
**Function**: `getUserZelleTransfers()`

```typescript
const zelles = await getUserZelleTransfers(userId, limit = 50)
// Returns: Array of Zelle transfers
```

---

## Credit Score

### Get Credit Score
**Endpoint**: `GET /api/credit-score`
**Function**: `getUserCreditScore()`

```typescript
const creditScore = await getUserCreditScore(userId)

// Response
{
  "id": "score-uuid",
  "user_id": "user-uuid",
  "score": 750,
  "status": "good",
  "trend": "stable",
  "updated_at": "2024-04-14T10:00:00Z"
}
```

### Update Credit Score
**Endpoint**: `PATCH /api/credit-score`
**Function**: `updateCreditScore()`

```typescript
const updated = await updateCreditScore(userId, {
  score: 780,
  status: "very_good",
  trend: "improving"
})
```

---

## Login History

### Get Login History
**Endpoint**: `GET /api/security/login-history`
**Function**: `getUserLoginHistory()`

```typescript
const history = await getUserLoginHistory(userId, limit = 20)

// Response
[
  {
    "id": "login-uuid",
    "user_id": "user-uuid",
    "device": "Chrome on macOS",
    "location": "San Francisco, CA",
    "ip_address": "192.168.1.1",
    "status": "success",
    "created_at": "2024-04-14T10:00:00Z"
  }
]
```

### Record Login
**Endpoint**: `POST /api/security/login-history`
**Function**: `createLoginHistory()`

```typescript
const login = await createLoginHistory(userId, {
  device: "Chrome on macOS",
  location: "San Francisco, CA",
  ip_address: "192.168.1.1",
  status: "success"
})
```

---

## Balance Operations

### Get Account Balance
**Endpoint**: `GET /api/accounts/:accountId/balance`
**Function**: `getAccountBalance()`

```typescript
const { balance, available_balance } = await getAccountBalance(accountId)
// Returns: { balance: 2500.50, available_balance: 2500.50 }
```

### Update Account Balance
**Endpoint**: `PATCH /api/accounts/:accountId/balance`
**Function**: `updateAccountBalance()`

```typescript
const updated = await updateAccountBalance(accountId, 3000.00)
// Be careful: Use transactions for safe balance updates
```

---

## Error Handling

All functions may throw errors. Wrap in try-catch:

```typescript
try {
  const user = await getUserById(userId)
  if (!user) {
    return Response.json(
      { error: 'User not found' },
      { status: 404 }
    )
  }
} catch (error) {
  console.error('[v0] Database error:', error)
  return Response.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}
```

---

## Data Validation

Always validate input before database operations:

```typescript
// Example: Validate transaction amount
if (amount <= 0) {
  throw new Error('Amount must be greater than 0')
}

if (amount > account.available_balance) {
  throw new Error('Insufficient funds')
}

// Create transaction
const transaction = await createTransaction(userId, accountId, {
  type: 'debit',
  amount: amount,
  description: description
})
```

---

## Rate Limiting

Implement rate limiting for security-sensitive operations:

```typescript
// Example: Limit failed login attempts
const recentFailures = await getUserLoginHistory(userId, 5)
const failedAttempts = recentFailures.filter(
  l => l.status === 'failed' && 
  new Date(l.created_at) > new Date(Date.now() - 15 * 60000) // Last 15 mins
).length

if (failedAttempts >= 3) {
  throw new Error('Too many failed login attempts. Try again later.')
}
```

---

## Performance Tips

1. **Batch Operations**: Use Promise.all() for parallel queries
2. **Limit Results**: Always specify a limit
3. **Index Awareness**: Queries on user_id, account_id are optimized
4. **Cache Settings**: Cache user settings in memory
5. **Avoid N+1**: Load related data together

Example - Efficient dashboard fetch:
```typescript
const [accounts, bills, notifications] = await Promise.all([
  getUserAccounts(userId),
  getUserBillPayments(userId),
  getUserNotifications(userId, 10)
])
```

---

## Testing

Test database functions with mock data:

```typescript
// Mock user
const mockUser = {
  id: 'test-uuid',
  email: 'test@example.com',
  full_name: 'Test User'
}

// Test get user
const user = await getUserById(mockUser.id)
expect(user.email).toBe(mockUser.email)
```
