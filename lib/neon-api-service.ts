/**
 * Neon Database API Integration Service
 * Syncs banking data between Neon database and React context in real-time
 */

import type { Account, Transaction } from '@/lib/banking-context'

export interface NeonAccount {
  id: string
  user_id: string
  account_type: string
  account_number: string
  balance: number
  available_balance?: number
  currency: string
  name?: string
  routing_number?: string
  type?: string
  created_at: string
  updated_at: string
}

export interface NeonTransaction {
  id: string
  account_id: string
  type: string
  amount: number
  description: string
  category?: string
  status?: string
  created_at: string
  date?: string
  reference?: string
  fee?: number
}

/**
 * Fetch user accounts from Neon database via API
 */
export async function fetchUserAccounts(userId: string): Promise<Account[]> {
  try {
    const response = await fetch('/api/accounts', {
      method: 'GET',
      headers: {
        'x-user-id': userId,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.error('[v0] Failed to fetch accounts:', response.statusText)
      return []
    }

    const data = await response.json()
    const accounts = data.accounts || []

    // Transform Neon accounts to banking context Account type
    return accounts.map((acc: NeonAccount) => ({
      id: acc.id,
      name: acc.name || acc.account_type || 'Account',
      type: acc.type || acc.account_type?.toLowerCase() || 'checking',
      balance: acc.balance || 0,
      availableBalance: acc.available_balance || acc.balance || 0,
      accountNumber: acc.account_number,
      routingNumber: acc.routing_number || '',
      interestRate: 0,
    }))
  } catch (error) {
    console.error('[v0] Error fetching accounts from Neon:', error)
    return []
  }
}

/**
 * Fetch transactions for a specific account
 */
export async function fetchAccountTransactions(userId: string, accountId?: string): Promise<Transaction[]> {
  try {
    const url = new URL('/api/transactions', window.location.origin)
    url.searchParams.append('days', '90')
    if (accountId) {
      url.searchParams.append('accountId', accountId)
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'x-user-id': userId,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.error('[v0] Failed to fetch transactions:', response.statusText)
      return []
    }

    const data = await response.json()
    const transactions = data.transactions || []

    // Transform Neon transactions to banking context Transaction type
    return transactions.map((tx: NeonTransaction) => ({
      id: tx.id,
      description: tx.description || 'Transaction',
      amount: tx.amount || 0,
      date: tx.date || tx.created_at,
      type: (tx.type === 'credit' ? 'credit' : 'debit') as 'credit' | 'debit',
      category: tx.category || 'Uncategorized',
      status: (tx.status || 'completed') as 'completed' | 'pending' | 'failed',
      reference: tx.reference,
      fee: tx.fee,
      accountId: tx.account_id,
    }))
  } catch (error) {
    console.error('[v0] Error fetching transactions from Neon:', error)
    return []
  }
}

/**
 * Create a new account in Neon database
 */
export async function createAccountInNeon(
  userId: string,
  data: {
    account_type: string
    currency?: string
    balance?: number
  }
): Promise<Account | null> {
  try {
    const response = await fetch('/api/accounts', {
      method: 'POST',
      headers: {
        'x-user-id': userId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      console.error('[v0] Failed to create account:', response.statusText)
      return null
    }

    const result = await response.json()
    const account = result.account

    return {
      id: account.id,
      name: account.name || account.account_type || 'New Account',
      type: account.type || account.account_type?.toLowerCase() || 'checking',
      balance: account.balance || 0,
      availableBalance: account.available_balance || account.balance || 0,
      accountNumber: account.account_number,
      routingNumber: account.routing_number || '',
      interestRate: 0,
    }
  } catch (error) {
    console.error('[v0] Error creating account in Neon:', error)
    return null
  }
}

/**
 * Create a transaction in Neon database
 */
export async function createTransactionInNeon(
  userId: string,
  accountId: string,
  data: {
    type: 'credit' | 'debit'
    amount: number
    description: string
  }
): Promise<Transaction | null> {
  try {
    const response = await fetch('/api/transactions', {
      method: 'POST',
      headers: {
        'x-user-id': userId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accountId,
        ...data,
      }),
    })

    if (!response.ok) {
      console.error('[v0] Failed to create transaction:', response.statusText)
      return null
    }

    const result = await response.json()
    const tx = result.transaction

    return {
      id: tx.id,
      description: tx.description || 'Transaction',
      amount: tx.amount || 0,
      date: tx.date || tx.created_at || new Date().toISOString(),
      type: (tx.type === 'credit' ? 'credit' : 'debit') as 'credit' | 'debit',
      category: tx.category || 'Uncategorized',
      status: (tx.status || 'completed') as 'completed' | 'pending' | 'failed',
      reference: tx.reference,
      fee: tx.fee,
      accountId: tx.account_id,
    }
  } catch (error) {
    console.error('[v0] Error creating transaction in Neon:', error)
    return null
  }
}

/**
 * Sync all banking data from Neon database
 * Useful for background sync and keeping data fresh
 */
export async function syncBankingDataFromNeon(userId: string) {
  try {
    const [accounts, transactions] = await Promise.all([
      fetchUserAccounts(userId),
      fetchAccountTransactions(userId),
    ])

    return {
      success: true,
      accounts,
      transactions,
      lastSync: new Date().toISOString(),
    }
  } catch (error) {
    console.error('[v0] Error syncing banking data from Neon:', error)
    return {
      success: false,
      accounts: [],
      transactions: [],
      lastSync: null,
    }
  }
}

/**
 * Setup real-time polling for account updates
 * Fetches data at regular intervals (default every 30 seconds)
 */
export function setupRealtimeSync(
  userId: string,
  onDataUpdate: (data: { accounts: Account[]; transactions: Transaction[] }) => void,
  intervalMs: number = 30000
) {
  let isRunning = true

  const sync = async () => {
    if (!isRunning) return

    const result = await syncBankingDataFromNeon(userId)
    if (result.success) {
      onDataUpdate({
        accounts: result.accounts,
        transactions: result.transactions,
      })
    }

    // Schedule next sync
    if (isRunning) {
      setTimeout(sync, intervalMs)
    }
  }

  // Start first sync
  sync()

  // Return cleanup function
  return () => {
    isRunning = false
  }
}
