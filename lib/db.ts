import { neon } from '@neondatabase/serverless'
import type { NeonQueryFunction } from '@neondatabase/serverless'

let sqlInstance: NeonQueryFunction<false, false> | null = null

function getSql(): NeonQueryFunction<false, false> {
  if (!sqlInstance) {
    const DATABASE_URL = process.env.DATABASE_URL
    if (!DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set')
    }
    sqlInstance = neon(DATABASE_URL)
  }
  return sqlInstance
}

export function sql(strings: TemplateStringsArray, ...values: any[]): any {
  return getSql()(strings, ...values)
}

// User operations
export async function getUserByEmail(email: string) {
  try {
    const result = await sql`
      SELECT u.id, u.email, u.name as full_name, u."createdAt"
      FROM neon_auth."user" u
      WHERE u.email = ${email}
    `
    return result[0] || null
  } catch (error: any) {
    console.log('[v0] getUserByEmail error:', error.message)
    return null
  }
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
  try {
    // First insert the user in neon_auth schema
    const userResult = await sql`
      INSERT INTO neon_auth."user" (
        email,
        name
      ) VALUES (
        ${data.email},
        ${data.full_name || data.email.split('@')[0]}
      )
      RETURNING id, email, name as full_name, created_at
    `
    
    const user = userResult[0]
    
    // Then insert credentials in neon_auth schema
    if (user) {
      await sql`
        INSERT INTO neon_auth.credentials (
          user_id,
          password_hash
        ) VALUES (
          ${user.id},
          ${data.password_hash}
        )
      `
    }
    
    return user
  } catch (error: any) {
    console.log('[v0] createUser error:', error.message)
    throw error
  }
}

export async function getUserById(id: string) {
  try {
    const result = await sql`
      SELECT id, email, name as full_name, created_at
      FROM neon_auth."user"
      WHERE id = ${id}
    `
    return result[0] || null
  } catch (error: any) {
    console.log('[v0] getUserById error:', error.message)
    return null
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
  
  const result = await getSql()(query, values)
  return result[0]
}

// Session operations
export async function createSession(userId: string, token: string, expiresAt: Date) {
  try {
    const result = await sql`
      INSERT INTO neon_auth.session (user_id, token, expires_at)
      VALUES (${userId}, ${token}, ${expiresAt.toISOString()})
      RETURNING id, user_id, token, expires_at
    `
    return result[0]
  } catch (error: any) {
    console.log('[v0] createSession error:', error.message)
    throw error
  }
}

export async function getSession(token: string) {
  try {
    const result = await sql`
      SELECT s.id, s.token, s.expires_at, 
             u.id as user_id, u.email, u.name as full_name
      FROM neon_auth.session s
      JOIN neon_auth."user" u ON s.user_id = u.id
      WHERE s.token = ${token} AND s.expires_at > CURRENT_TIMESTAMP
    `
    return result[0] || null
  } catch (error: any) {
    console.log('[v0] getSession error:', error.message)
    return null
  }
}

// Role-based operations
export async function getUserRole(userId: string): Promise<'customer' | 'admin' | null> {
  const result = await sql`SELECT role FROM users WHERE id = ${userId}`
  return result[0]?.role || null
}

export async function updateUserRole(userId: string, role: 'customer' | 'admin') {
  const result = await sql`
    UPDATE users
    SET role = ${role}
    WHERE id = ${userId}
    RETURNING id, email, role
  `
  return result[0] || null
}

export async function createAdminUser(data: {
  email: string
  password_hash: string
  full_name?: string
}) {
  const result = await sql`
    INSERT INTO users (
      email,
      password_hash,
      full_name,
      role,
      currency_preference,
      language_preference
    ) VALUES (
      ${data.email},
      ${data.password_hash},
      ${data.full_name || null},
      'admin',
      'USD',
      'en'
    )
    RETURNING id, email, full_name, role, created_at
  `
  return result[0]
}

export async function getUserTotalBalance(userId: string): Promise<number> {
  const result = await sql`
    SELECT COALESCE(SUM(balance), 0) as total_balance
    FROM accounts
    WHERE user_id = ${userId}
  `
  return parseFloat(result[0]?.total_balance || '0')
}

export async function getAllUsersWithBalances() {
  const result = await sql`
    SELECT 
      u.id,
      u.email,
      u.full_name,
      u.role,
      u.created_at,
      COUNT(a.id) as account_count,
      COALESCE(SUM(a.balance), 0) as total_balance
    FROM users u
    LEFT JOIN accounts a ON u.id = a.user_id
    WHERE u.role = 'customer'
    GROUP BY u.id, u.email, u.full_name, u.role, u.created_at
    ORDER BY u.created_at DESC
  `
  return result
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
  account_type?: string
  account_number?: string
  balance?: number
  currency?: string
}) {
  const result = await sql`
    INSERT INTO accounts (user_id, name, account_type, account_number, balance)
    VALUES (${userId}, ${data.account_type || 'Checking Account'}, ${data.account_type || 'checking'}, ${data.account_number || null}, ${data.balance || 0})
    RETURNING id, user_id, name, account_type, account_number, balance
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

export async function createTransaction(accountId: string, data: {
  type: string
  amount: number
  description?: string
}) {
  const result = await sql`
    INSERT INTO transactions (account_id, type, amount, description)
    VALUES (${accountId}, ${data.type}, ${data.amount}, ${data.description || null})
    RETURNING *
  `
  return result[0]
}
