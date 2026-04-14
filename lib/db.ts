import { neon } from '@neondatabase/serverless'

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set')
}

export const sql = neon(DATABASE_URL)

// User operations
export async function getUserByEmail(email: string) {
  const result = await sql`SELECT * FROM users WHERE email = ${email}`
  return result[0] || null
}

export async function getUserById(id: string) {
  const result = await sql`SELECT * FROM users WHERE id = ${id}`
  return result[0] || null
}

/**
 * Generate unique account number for new user
 */
function generateAccountNumber(): string {
  const prefix = '9'
  const random = Math.floor(Math.random() * 9000000000) + 1000000000
  return prefix + random.toString().slice(1)
}

export async function createUser(data: {
  email: string
  password_hash: string
  full_name?: string
  phone?: string
  address?: string
  date_of_birth?: string
  government_id_type?: string
  account_type_preference?: string
  currency_preference?: string
  language_preference?: string
}) {
  const accountNumber = generateAccountNumber()
  
  const result = await sql`
    INSERT INTO users (
      email,
      password_hash,
      full_name,
      phone,
      address,
      date_of_birth,
      government_id_type,
      account_type_preference,
      currency_preference,
      language_preference
    ) VALUES (
      ${data.email},
      ${data.password_hash},
      ${data.full_name || null},
      ${data.phone || null},
      ${data.address || null},
      ${data.date_of_birth || null},
      ${data.government_id_type || null},
      ${data.account_type_preference || null},
      ${data.currency_preference || 'USD'},
      ${data.language_preference || 'en'}
    )
    RETURNING id, email, full_name, phone, created_at
  `
  
  const user = result[0]
  if (!user) return null
  
  // Try to add account metadata if the columns exist
  return {
    ...user,
    account_number: accountNumber,
    total_balance: 0,
    total_checking_balance: 0,
    total_savings_balance: 0,
    total_savings_goals: 0,
  }
}

export async function updateUser(id: string, data: Partial<{
  full_name: string
  phone: string
  address: string
  currency_preference: string
  language_preference: string
}>) {
  const updates: string[] = []
  const values: any[] = [id]
  let paramCount = 2

  Object.entries(data).forEach(([key, value]) => {
    updates.push(`${key} = $${paramCount}`)
    values.push(value)
    paramCount++
  })

  if (updates.length === 0) {
    return getUserById(id)
  }

  const query = `
    UPDATE users
    SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
  `
  
  const result = await sql(query, values)
  return result[0]
}

// Session operations
export async function createSession(userId: string, token: string, expiresAt: Date) {
  const result = await sql`
    INSERT INTO sessions (user_id, token, expires_at)
    VALUES (${userId}, ${token}, ${expiresAt.toISOString()})
    RETURNING id, user_id, token, expires_at
  `
  return result[0]
}

export async function getSession(token: string) {
  const result = await sql`
    SELECT s.*, u.id as user_id, u.email, u.full_name, u.role
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.token = ${token} AND s.expires_at > CURRENT_TIMESTAMP
  `
  return result[0] || null
}

export async function deleteSession(token: string) {
  await sql`DELETE FROM sessions WHERE token = ${token}`
}

export async function deleteUserSessions(userId: string) {
  await sql`DELETE FROM sessions WHERE user_id = ${userId}`
}

// Account operations
export async function getUserAccounts(userId: string) {
  const result = await sql`
    SELECT * FROM accounts
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `
  return result
}

export async function getAccountById(accountId: string) {
  const result = await sql`SELECT * FROM accounts WHERE id = ${accountId}`
  return result[0] || null
}

export async function createAccount(userId: string, data: {
  account_type: string
  account_number: string
  balance?: number
  currency?: string
}) {
  const result = await sql`
    INSERT INTO accounts (user_id, account_type, account_number, balance, currency)
    VALUES (${userId}, ${data.account_type}, ${data.account_number}, ${data.balance || 0}, ${data.currency || 'USD'})
    RETURNING *
  `
  return result[0]
}

// Transaction operations
export async function getAccountTransactions(accountId: string, limit = 50) {
  const result = await sql`
    SELECT * FROM transactions
    WHERE account_id = ${accountId}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `
  return result
}

export async function createTransaction(userId: string, accountId: string, data: {
  type: string
  amount: number
  description: string
  category?: string
  recipient_name?: string
  recipient_account?: string
}) {
  const result = await sql`
    INSERT INTO transactions (user_id, account_id, type, amount, description, category, recipient_name, recipient_account)
    VALUES (${userId}, ${accountId}, ${data.type}, ${data.amount}, ${data.description}, ${data.category || 'general'}, ${data.recipient_name || null}, ${data.recipient_account || null})
    RETURNING *
  `
  return result[0]
}

// Balance operations
export async function getAccountBalance(accountId: string) {
  const result = await sql`
    SELECT balance, available_balance FROM accounts WHERE id = ${accountId}
  `
  return result[0] || { balance: 0, available_balance: 0 }
}

export async function updateAccountBalance(accountId: string, newBalance: number) {
  const result = await sql`
    UPDATE accounts
    SET balance = ${newBalance}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${accountId}
    RETURNING *
  `
  return result[0]
}

export async function getUserTotalBalance(userId: string) {
  const result = await sql`
    SELECT COALESCE(SUM(balance), 0) as total_balance
    FROM accounts
    WHERE user_id = ${userId}
  `
  return result[0]?.total_balance || 0
}

export async function getUserAccountsByType(userId: string, accountType: string) {
  const result = await sql`
    SELECT * FROM accounts
    WHERE user_id = ${userId} AND account_type = ${accountType}
    ORDER BY created_at DESC
  `
  return result
}

// Notification operations
export async function getUserNotifications(userId: string, limit = 20) {
  const result = await sql`
    SELECT * FROM notifications
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `
  return result
}

export async function createNotification(userId: string, data: {
  title: string
  message: string
  type?: string
  category?: string
  action_url?: string
}) {
  const result = await sql`
    INSERT INTO notifications (user_id, title, message, type, category, action_url)
    VALUES (${userId}, ${data.title}, ${data.message}, ${data.type || 'info'}, ${data.category || 'general'}, ${data.action_url || null})
    RETURNING *
  `
  return result[0]
}

export async function markNotificationAsRead(notificationId: string) {
  const result = await sql`
    UPDATE notifications
    SET is_read = true, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${notificationId}
    RETURNING *
  `
  return result[0]
}

export async function getUnreadNotificationCount(userId: string) {
  const result = await sql`
    SELECT COUNT(*) as count FROM notifications
    WHERE user_id = ${userId} AND is_read = false
  `
  return result[0]?.count || 0
}

// Bill payment operations
export async function getUserBillPayments(userId: string) {
  const result = await sql`
    SELECT * FROM bill_payments
    WHERE user_id = ${userId}
    ORDER BY due_date ASC
  `
  return result
}

export async function createBillPayment(userId: string, accountId: string, data: {
  payee: string
  amount: number
  due_date: string
  scheduled_date?: string
  frequency?: string
}) {
  const result = await sql`
    INSERT INTO bill_payments (user_id, from_account_id, payee, amount, due_date, scheduled_date, frequency)
    VALUES (${userId}, ${accountId}, ${data.payee}, ${data.amount}, ${data.due_date}, ${data.scheduled_date || null}, ${data.frequency || 'once'})
    RETURNING *
  `
  return result[0]
}

export async function updateBillPaymentStatus(billPaymentId: string, status: string) {
  const result = await sql`
    UPDATE bill_payments
    SET status = ${status}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${billPaymentId}
    RETURNING *
  `
  return result[0]
}

// Wire transfer operations
export async function createWireTransfer(userId: string, accountId: string, data: {
  amount: number
  recipient_name: string
  recipient_bank: string
  recipient_routing_number: string
  recipient_account_number: string
}) {
  const result = await sql`
    INSERT INTO wire_transfers (user_id, from_account_id, amount, recipient_name, recipient_bank, recipient_routing_number, recipient_account_number)
    VALUES (${userId}, ${accountId}, ${data.amount}, ${data.recipient_name}, ${data.recipient_bank}, ${data.recipient_routing_number}, ${data.recipient_account_number})
    RETURNING *
  `
  return result[0]
}

export async function getUserWireTransfers(userId: string, limit = 50) {
  const result = await sql`
    SELECT * FROM wire_transfers
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `
  return result
}

// Zelle transfer operations
export async function createZelleTransfer(userId: string, accountId: string, data: {
  amount: number
  recipient_name: string
  recipient_email?: string
  recipient_phone?: string
}) {
  const result = await sql`
    INSERT INTO zelle_transfers (user_id, from_account_id, amount, recipient_name, recipient_email, recipient_phone)
    VALUES (${userId}, ${accountId}, ${data.amount}, ${data.recipient_name}, ${data.recipient_email || null}, ${data.recipient_phone || null})
    RETURNING *
  `
  return result[0]
}

export async function getUserZelleTransfers(userId: string, limit = 50) {
  const result = await sql`
    SELECT * FROM zelle_transfers
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `
  return result
}

// Credit score operations
export async function getUserCreditScore(userId: string) {
  const result = await sql`
    SELECT * FROM credit_scores WHERE user_id = ${userId}
  `
  return result[0] || null
}

export async function updateCreditScore(userId: string, data: {
  score: number
  status: string
  trend: string
}) {
  const result = await sql`
    UPDATE credit_scores
    SET score = ${data.score}, status = ${data.status}, trend = ${data.trend}, updated_at = CURRENT_TIMESTAMP
    WHERE user_id = ${userId}
    RETURNING *
  `
  return result[0]
}

// Login history operations
export async function createLoginHistory(userId: string, data: {
  device?: string
  location?: string
  ip_address?: string
  status?: string
}) {
  const result = await sql`
    INSERT INTO login_history (user_id, device, location, ip_address, status)
    VALUES (${userId}, ${data.device || null}, ${data.location || null}, ${data.ip_address || null}, ${data.status || 'success'})
    RETURNING *
  `
  return result[0]
}

export async function getUserLoginHistory(userId: string, limit = 20) {
  const result = await sql`
    SELECT * FROM login_history
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `
  return result
}

// User settings operations
export async function getUserSettings(userId: string) {
  const result = await sql`
    SELECT * FROM user_settings WHERE user_id = ${userId}
  `
  return result[0] || null
}

export async function updateUserSettings(userId: string, data: {
  dark_mode?: boolean
  language?: string
  currency?: string
  biometric_login?: boolean
  two_factor_method?: string
  session_timeout?: number
  settings_data?: Record<string, any>
}) {
  const result = await sql`
    UPDATE user_settings
    SET
      dark_mode = COALESCE(${data.dark_mode}, dark_mode),
      language = COALESCE(${data.language}, language),
      currency = COALESCE(${data.currency}, currency),
      biometric_login = COALESCE(${data.biometric_login}, biometric_login),
      two_factor_method = COALESCE(${data.two_factor_method}, two_factor_method),
      session_timeout = COALESCE(${data.session_timeout}, session_timeout),
      settings_data = COALESCE(${data.settings_data ? JSON.stringify(data.settings_data) : null}, settings_data),
      updated_at = CURRENT_TIMESTAMP
    WHERE user_id = ${userId}
    RETURNING *
  `
  return result[0]
}
