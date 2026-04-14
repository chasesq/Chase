# TypeScript Types & Database Schemas

Complete type definitions and schemas for the Chase Banking App.

---

## User Types

```typescript
interface User {
  id: string  // UUID
  email: string  // Unique email
  name: string
  password_hash: string  // Never expose
  phone?: string
  role: 'user' | 'admin' | 'moderator'
  two_factor_enabled: boolean
  totp_secret?: string  // Never expose
  backup_codes?: string  // Never expose
  created_at: Date
  updated_at: Date
  last_login?: Date
}

interface UserProfile {
  id: string
  name: string
  email: string
  phone: string
  address: string
  memberSince: string
  tier: string
  ultimateRewardsPoints: number
  profilePicture: string | null
  dateOfBirth: string
  ssn: string  // Never expose
  preferredLanguage: string
  currency: string
  timezone: string
  avatarUrl?: string
  accountNumber?: string
  totalBalance?: number
  totalCheckingBalance?: number
  totalSavingsBalance?: number
  totalSavingsGoals?: number
}

interface UserSettings {
  id: string
  user_id: string
  dark_mode: boolean
  language: 'English' | 'Spanish' | 'French' | 'German' | string
  currency: 'USD' | 'EUR' | 'GBP' | 'CAD' | string
  biometric_login: boolean
  two_factor_method: 'sms' | 'email' | 'authenticator'
  session_timeout: number  // in minutes
  settings_data?: Record<string, any>
  updated_at: Date
}
```

---

## Account Types

```typescript
type AccountType = 'checking' | 'savings' | 'money_market' | 'credit_card'
type AccountStatus = 'active' | 'closed' | 'frozen' | 'pending'

interface Account {
  id: string  // UUID
  user_id: string  // UUID
  name: string
  account_type: AccountType
  account_number: string  // Display: last 4 digits
  full_account_number: string  // Complete number (stored securely)
  routing_number: string  // Default: '021000021'
  balance: number  // DECIMAL(15,2)
  available_balance: number
  interest_rate: number  // DECIMAL(6,4)
  status: AccountStatus
  created_at: Date
  updated_at: Date
}

interface AccountBalance {
  balance: number
  available_balance: number
  account_type: AccountType
}

interface AccountDetails {
  id: string
  account_type: AccountType
  account_number: string
  balance: number
  status: AccountStatus
  interest_earned: number
  last_transaction: Date | null
}
```

---

## Transaction Types

```typescript
type TransactionType = 'debit' | 'credit' | 'transfer' | 'payment'
type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled'
type TransactionCategory = 
  | 'general' | 'groceries' | 'utilities' | 'entertainment'
  | 'travel' | 'dining' | 'shopping' | 'transfer' | 'salary'
  | 'investment' | 'other'

interface Transaction {
  id: string  // UUID
  account_id: string  // UUID
  user_id: string  // UUID
  description: string
  amount: number  // DECIMAL(15,2)
  type: TransactionType
  category: TransactionCategory
  status: TransactionStatus
  reference?: string
  fee?: number
  recipient_id?: string
  recipient_bank?: string
  recipient_account?: string
  recipient_name?: string
  sender_name?: string
  scheduled_date?: Date
  transaction_date: Date
  settlement_date?: Date
  created_at: Date
}

interface TransactionRequest {
  type: TransactionType
  amount: number
  description: string
  category?: TransactionCategory
  recipient_name?: string
  recipient_account?: string
  recipient_email?: string
}

interface TransactionDetail {
  id: string
  date: Date
  description: string
  amount: number
  type: TransactionType
  status: TransactionStatus
  category: TransactionCategory
  balance_after: number
  reference_number?: string
}
```

---

## Notification Types

```typescript
type NotificationType = 'info' | 'warning' | 'alert' | 'success' | 'error'
type NotificationCategory = 
  | 'general' | 'transactions' | 'accounts' | 'security'
  | 'offers' | 'system' | 'reminder'

interface Notification {
  id: string  // UUID
  user_id: string  // UUID
  title: string
  message: string
  type: NotificationType
  category: NotificationCategory
  is_read: boolean
  read?: boolean  // Legacy field
  data?: Record<string, any>  // Additional data
  action_url?: string
  created_at: Date
}

interface NotificationPreferences {
  id: string  // UUID
  user_id: string  // UUID
  email_notifications: boolean
  sms_notifications: boolean
  push_notifications: boolean
  transaction_alerts: boolean
  security_alerts: boolean
  offer_notifications: boolean
  promotional_emails: boolean
  updated_at: Date
}
```

---

## Bill Payment Types

```typescript
type BillFrequency = 'once' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annual'
type PaymentStatus = 'processing' | 'scheduled' | 'completed' | 'failed' | 'cancelled'

interface BillPayment {
  id: string  // UUID
  user_id: string  // UUID
  from_account_id: string  // UUID
  amount: number  // DECIMAL(15,2)
  payee: string
  due_date: Date
  scheduled_date?: Date
  frequency: BillFrequency
  status: PaymentStatus
  created_at: Date
}

interface Bill {
  id: string
  payee: string
  amount: number
  due_date: Date
  status: PaymentStatus
  frequency: BillFrequency
  last_paid?: Date
  next_payment?: Date
}

interface BillPaymentRequest {
  payee: string
  amount: number
  due_date: string  // YYYY-MM-DD
  scheduled_date?: string
  frequency?: BillFrequency
}
```

---

## Transfer Types

```typescript
type TransferStatus = 'processing' | 'sent' | 'received' | 'failed' | 'cancelled'

interface WireTransfer {
  id: string  // UUID
  user_id: string  // UUID
  from_account_id: string  // UUID
  amount: number  // DECIMAL(15,2)
  recipient_name: string
  recipient_bank: string
  recipient_routing_number: string
  recipient_account_number: string
  status: TransferStatus
  created_at: Date
}

interface ZelleTransfer {
  id: string  // UUID
  user_id: string  // UUID
  from_account_id: string  // UUID
  amount: number  // DECIMAL(15,2)
  recipient_name: string
  recipient_email?: string
  recipient_phone?: string
  status: TransferStatus
  created_at: Date
}

interface WireTransferRequest {
  amount: number
  recipient_name: string
  recipient_bank: string
  recipient_routing_number: string
  recipient_account_number: string
}

interface ZelleTransferRequest {
  amount: number
  recipient_name: string
  recipient_email?: string
  recipient_phone?: string
}
```

---

## Credit Score Types

```typescript
type CreditStatus = 'poor' | 'fair' | 'good' | 'very_good' | 'excellent'
type CreditTrend = 'declining' | 'stable' | 'improving'

interface CreditScore {
  id: string  // UUID
  user_id: string  // UUID
  score: number  // 300-850
  status: CreditStatus  // Based on score
  trend: CreditTrend
  updated_at: Date
}

interface CreditScoreRange {
  min: number
  max: number
  status: CreditStatus
  description: string
  actions: string[]
}
```

---

## Login History Types

```typescript
type LoginStatus = 'success' | 'failed' | 'locked'

interface LoginHistory {
  id: string  // UUID
  user_id: string  // UUID
  device?: string  // e.g., "Chrome on macOS"
  location?: string  // e.g., "San Francisco, CA"
  ip_address?: string
  status: LoginStatus
  created_at: Date
}

interface DeviceInfo {
  browser: string
  os: string
  device_type: 'mobile' | 'tablet' | 'desktop'
  ip_address: string
  location: string
}
```

---

## Session Types

```typescript
interface Session {
  id: string  // UUID
  user_id: string  // UUID
  token: string
  expires_at: Date
  created_at: Date
  user?: User
}

interface AuthContext {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  signUp: (email: string, password: string, data: any) => Promise<any>
  signIn: (email: string, password: string) => Promise<any>
  signOut: () => Promise<void>
  updateProfile: (data: any) => Promise<void>
}
```

---

## API Request/Response Types

```typescript
// Standard API Response
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
  code?: string
}

// Paginated Response
interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  total_pages: number
}

// Error Response
interface ErrorResponse {
  error: string
  message: string
  code: string
  details?: Record<string, any>
}

// Sign Up Request
interface SignUpRequest {
  email: string
  password: string
  full_name: string
  phone?: string
}

// Sign In Request
interface SignInRequest {
  email: string
  password: string
}

// Sign Up Response
interface SignUpResponse {
  id: string
  email: string
  full_name: string
  accountNumber: string
  totalBalance: number
  totalCheckingBalance: number
  totalSavingsBalance: number
}

// Dashboard Response
interface DashboardResponse {
  user: UserProfile
  accounts: Account[]
  accountDetails: {
    accountNumber: string
    totalBalance: number
    totalCheckingBalance: number
    totalSavingsBalance: number
    totalSavingsGoals: number
  }
  recentTransactions: Transaction[]
  notifications: Notification[]
  creditScore: CreditScore
  bills: BillPayment[]
}
```

---

## Form Validation Schemas

```typescript
// Sign Up Form Validation
const signUpSchema = {
  email: {
    required: true,
    type: 'email',
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address'
  },
  password: {
    required: true,
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
    message: 'Password must contain uppercase, lowercase, and numbers'
  },
  full_name: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z\s'-]+$/,
    message: 'Please enter a valid name'
  },
  phone: {
    required: false,
    pattern: /^\+?1?\d{9,15}$/,
    message: 'Please enter a valid phone number'
  }
}

// Transaction Validation
const transactionSchema = {
  amount: {
    required: true,
    type: 'number',
    min: 0.01,
    message: 'Amount must be greater than 0'
  },
  description: {
    required: true,
    minLength: 1,
    maxLength: 255,
    message: 'Please enter a description'
  },
  recipient_name: {
    required: false,
    maxLength: 100,
    message: 'Recipient name too long'
  }
}
```

---

## Common Patterns

### Data Validation
```typescript
function validateTransaction(data: TransactionRequest): boolean {
  if (!data.description || data.description.trim() === '') {
    throw new Error('Description is required')
  }
  if (data.amount <= 0) {
    throw new Error('Amount must be greater than 0')
  }
  if (data.amount > 999999.99) {
    throw new Error('Amount exceeds maximum limit')
  }
  return true
}
```

### Type Guards
```typescript
function isValidAccount(account: any): account is Account {
  return (
    typeof account.id === 'string' &&
    typeof account.user_id === 'string' &&
    typeof account.balance === 'number' &&
    ['checking', 'savings', 'money_market', 'credit_card'].includes(account.account_type)
  )
}
```

### Nullable Types
```typescript
type Nullable<T> = T | null
type Optional<T> = T | undefined

// Usage
const user: Nullable<User> = null
const settings: Optional<UserSettings> = undefined
```

### Partial Updates
```typescript
type UserUpdate = Partial<Omit<User, 'id' | 'password_hash' | 'created_at'>>

// Only allows updating certain fields
const update: UserUpdate = {
  name: 'John Doe',
  phone: '+1234567890'
}
```

---

## Database Column Types

```sql
-- Common Column Types
UUID PRIMARY KEY DEFAULT gen_random_uuid()  -- User IDs
TEXT UNIQUE NOT NULL                        -- Email
TEXT NOT NULL                               -- Strings
NUMERIC(15,2)                               -- Money: $999,999,999.99
NUMERIC(6,4)                                -- Interest: 0.0001
BOOLEAN DEFAULT FALSE                       -- Flags
INTEGER                                     -- Counts
TIMESTAMPTZ DEFAULT NOW()                   -- Timestamps
JSONB                                       -- Flexible data
DATE                                        -- Dates without time
```

---

## Enum Values Reference

```typescript
// Account Types
type AccountType = 'checking' | 'savings' | 'money_market' | 'credit_card'

// Transaction Types
type TransactionType = 'debit' | 'credit' | 'transfer' | 'payment'

// Status Types
type Status = 'active' | 'closed' | 'pending' | 'processing' | 'completed' | 'failed'

// Frequencies
type Frequency = 'once' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annual'

// Languages
type Language = 'English' | 'Spanish' | 'French' | 'German' | 'Portuguese'

// Currencies
type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY'
```

---

## Type Export Example

```typescript
// lib/types.ts
export type {
  User,
  UserProfile,
  Account,
  Transaction,
  Notification,
  BillPayment,
  WireTransfer,
  ZelleTransfer,
  CreditScore,
  LoginHistory,
  Session
}

// Usage in components
import type { Account, Transaction } from '@/lib/types'

const accounts: Account[] = []
const transaction: Transaction = { ... }
```
