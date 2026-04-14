# Quick Start Guide - Neon Database & Chase Banking App

Get started with the Chase Banking App using Neon serverless PostgreSQL database.

---

## Environment Setup

### Prerequisites
- Node.js 18+
- Neon database connected via Vercel integration
- `DATABASE_URL` environment variable automatically set

### Install Dependencies
```bash
npm install @neondatabase/serverless
```

The app is already configured. No manual setup needed!

---

## User Authentication Flow

### Sign Up
```typescript
// In sign-up component or API route
import { createUser } from '@/lib/db'
import { hashPassword } from '@/lib/auth'

const signUpUser = async (email: string, password: string, fullName: string) => {
  // Hash password
  const passwordHash = await hashPassword(password)
  
  // Create user in database
  const user = await createUser({
    email,
    password_hash: passwordHash,
    full_name: fullName
  })
  
  // User created with account number and zero balances
  console.log('New user:', user)
  // { id, email, full_name, account_number, total_balance: 0 }
}
```

### Sign In
```typescript
import { getUserByEmail } from '@/lib/db'
import { comparePassword } from '@/lib/auth'

const signInUser = async (email: string, password: string) => {
  const user = await getUserByEmail(email)
  if (!user) throw new Error('User not found')
  
  const isValid = await comparePassword(password, user.password_hash)
  if (!isValid) throw new Error('Invalid password')
  
  return user
}
```

---

## Working with Accounts

### Get User's Accounts
```typescript
import { getUserAccounts } from '@/lib/db'

const loadAccounts = async (userId: string) => {
  const accounts = await getUserAccounts(userId)
  
  accounts.forEach(account => {
    console.log(`${account.name}: $${account.balance}`)
  })
}
```

### Create a New Account
```typescript
import { createAccount } from '@/lib/db'

const createNewSavingsAccount = async (userId: string) => {
  const account = await createAccount(userId, {
    account_type: 'savings',
    account_number: '****5678',
    balance: 0,
    currency: 'USD'
  })
  
  return account
}
```

### Get Total Balance
```typescript
import { getUserTotalBalance } from '@/lib/db'

const getTotalBalance = async (userId: string) => {
  const total = await getUserTotalBalance(userId)
  console.log(`Total balance: $${total}`)
  return total
}
```

---

## Recording Transactions

### Debit Transaction
```typescript
import { 
  createTransaction, 
  getAccountBalance, 
  updateAccountBalance 
} from '@/lib/db'

const makeWithdrawal = async (
  userId: string,
  accountId: string,
  amount: number
) => {
  // Check balance
  const { balance } = await getAccountBalance(accountId)
  if (balance < amount) throw new Error('Insufficient funds')
  
  // Deduct from account
  const newBalance = balance - amount
  await updateAccountBalance(accountId, newBalance)
  
  // Record transaction
  const transaction = await createTransaction(userId, accountId, {
    type: 'debit',
    amount,
    description: 'Withdrawal',
    category: 'withdrawal'
  })
  
  return transaction
}
```

### Credit Transaction
```typescript
const makeDeposit = async (
  userId: string,
  accountId: string,
  amount: number,
  source: string = 'Deposit'
) => {
  const { balance } = await getAccountBalance(accountId)
  const newBalance = balance + amount
  
  await updateAccountBalance(accountId, newBalance)
  
  const transaction = await createTransaction(userId, accountId, {
    type: 'credit',
    amount,
    description: source,
    category: 'deposit'
  })
  
  return transaction
}
```

---

## Managing Transactions

### Get Transaction History
```typescript
import { getAccountTransactions } from '@/lib/db'

const getTransactionHistory = async (accountId: string, limit = 50) => {
  const transactions = await getAccountTransactions(accountId, limit)
  
  transactions.forEach(tx => {
    console.log(`${tx.date}: ${tx.description} - ${tx.type} $${tx.amount}`)
  })
  
  return transactions
}
```

---

## Working with Notifications

### Send Notification
```typescript
import { createNotification } from '@/lib/db'

const notifyUser = async (userId: string, title: string, message: string) => {
  const notification = await createNotification(userId, {
    title,
    message,
    type: 'info',
    category: 'general'
  })
  
  return notification
}
```

### Mark Notification as Read
```typescript
import { markNotificationAsRead } from '@/lib/db'

const readNotification = async (notificationId: string) => {
  await markNotificationAsRead(notificationId)
}
```

### Get Unread Count
```typescript
import { getUnreadNotificationCount } from '@/lib/db'

const checkUnread = async (userId: string) => {
  const count = await getUnreadNotificationCount(userId)
  console.log(`You have ${count} unread notifications`)
}
```

---

## Bill Payments

### Create Bill Payment
```typescript
import { createBillPayment } from '@/lib/db'

const scheduleBillPayment = async (
  userId: string,
  accountId: string,
  payee: string,
  amount: number,
  dueDate: string
) => {
  const bill = await createBillPayment(userId, accountId, {
    payee,
    amount,
    due_date: dueDate,
    frequency: 'monthly'
  })
  
  return bill
}
```

### Get Bills
```typescript
import { getUserBillPayments } from '@/lib/db'

const loadBills = async (userId: string) => {
  const bills = await getUserBillPayments(userId)
  
  bills.forEach(bill => {
    console.log(`${bill.payee}: $${bill.amount} due ${bill.due_date}`)
  })
  
  return bills
}
```

---

## Transfers

### Wire Transfer
```typescript
import { createWireTransfer } from '@/lib/db'

const sendWireTransfer = async (
  userId: string,
  accountId: string,
  recipientName: string,
  recipientBank: string,
  amount: number
) => {
  const wire = await createWireTransfer(userId, accountId, {
    amount,
    recipient_name: recipientName,
    recipient_bank: recipientBank,
    recipient_routing_number: '021000021',
    recipient_account_number: '1234567890'
  })
  
  return wire
}
```

### Zelle Transfer
```typescript
import { createZelleTransfer } from '@/lib/db'

const sendZelleTransfer = async (
  userId: string,
  accountId: string,
  recipientName: string,
  recipientEmail: string,
  amount: number
) => {
  const zelle = await createZelleTransfer(userId, accountId, {
    amount,
    recipient_name: recipientName,
    recipient_email: recipientEmail
  })
  
  return zelle
}
```

---

## Dashboard Data

### Load Complete Dashboard
```typescript
import {
  getUserAccounts,
  getUserTotalBalance,
  getAccountTransactions,
  getUserNotifications,
  getUserBillPayments,
  getUserCreditScore
} from '@/lib/db'

const loadDashboard = async (userId: string) => {
  const accounts = await getUserAccounts(userId)
  
  const [
    transactions,
    notifications,
    bills,
    creditScore
  ] = await Promise.all([
    accounts[0] ? getAccountTransactions(accounts[0].id, 10) : [],
    getUserNotifications(userId, 5),
    getUserBillPayments(userId),
    getUserCreditScore(userId)
  ])
  
  const totalBalance = await getUserTotalBalance(userId)
  
  return {
    accounts,
    totalBalance,
    recentTransactions: transactions,
    notifications,
    upcomingBills: bills.filter(b => b.status !== 'completed'),
    creditScore
  }
}
```

---

## Error Handling

### Safe Database Calls
```typescript
const safeDatabaseCall = async (fn: () => Promise<any>) => {
  try {
    return await fn()
  } catch (error) {
    console.error('[v0] Database error:', error)
    throw new Error('An error occurred. Please try again.')
  }
}

// Usage
const user = await safeDatabaseCall(() => getUserById(userId))
```

---

## API Endpoint Template

### Create API Route
```typescript
// app/api/transactions/create/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createTransaction, updateAccountBalance, getAccountBalance } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Parse request body
    const body = await request.json()
    const { accountId, amount, description, type } = body
    
    // Validate input
    if (!accountId || !amount || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Check balance if debit
    if (type === 'debit') {
      const { balance } = await getAccountBalance(accountId)
      if (balance < amount) {
        return NextResponse.json(
          { error: 'Insufficient funds' },
          { status: 400 }
        )
      }
      
      // Update balance
      await updateAccountBalance(accountId, balance - amount)
    }
    
    // Create transaction
    const transaction = await createTransaction(user.id, accountId, {
      type,
      amount,
      description
    })
    
    return NextResponse.json({
      success: true,
      transaction
    })
  } catch (error) {
    console.error('[v0] Transaction error:', error)
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    )
  }
}
```

---

## Complete Documentation

For comprehensive reference, see these detailed guides:

1. **NEON_DATABASE_GUIDE.md** - Complete database schema and functions
2. **API_FUNCTIONS_GUIDE.md** - All available API endpoints
3. **TYPES_AND_SCHEMAS.md** - TypeScript types and validation schemas

---

## Key Database Functions Available

- **Users**: `createUser`, `getUserByEmail`, `getUserById`, `updateUser`
- **Accounts**: `getUserAccounts`, `getAccountById`, `createAccount`, `getUserTotalBalance`
- **Transactions**: `getAccountTransactions`, `createTransaction`, `getAccountBalance`, `updateAccountBalance`
- **Notifications**: `getUserNotifications`, `createNotification`, `markNotificationAsRead`, `getUnreadNotificationCount`
- **Bills**: `getUserBillPayments`, `createBillPayment`, `updateBillPaymentStatus`
- **Transfers**: `createWireTransfer`, `getUserWireTransfers`, `createZelleTransfer`, `getUserZelleTransfers`
- **Credit**: `getUserCreditScore`, `updateCreditScore`
- **Security**: `createLoginHistory`, `getUserLoginHistory`
- **Settings**: `getUserSettings`, `updateUserSettings`

All functions are in `/lib/db.ts` and use Neon serverless PostgreSQL via HTTP.
