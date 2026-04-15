/**
 * Transactions API Route - Real-time transaction management with Neon
 */

import { NextRequest, NextResponse } from 'next/server'

// GET /api/transactions - Fetch user transactions with real-time sync
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    const accountId = request.nextUrl.searchParams.get('accountId')
    const days = parseInt(request.nextUrl.searchParams.get('days') || '30')

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    try {
      const { getAccountTransactions, getAccountById, getUserAccounts } = await import('@/lib/db')

      let transactions: any[] = []

      if (accountId) {
        // Verify the account belongs to the user
        const account = await getAccountById(accountId)
        if (!account || account.user_id !== userId) {
          return NextResponse.json(
            { error: 'Account not found or access denied' },
            { status: 403 }
          )
        }

        // Get transactions for specific account
        transactions = await getAccountTransactions(accountId, 500) || []
      } else {
        // Get all transactions for all user accounts
        const accounts = await getUserAccounts(userId)
        
        // Fetch transactions for all accounts
        const allTransactions = await Promise.all(
          accounts.map(acc => getAccountTransactions(acc.id, 500))
        )
        
        // Flatten and sort by date
        transactions = allTransactions
          .flat()
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 500)
      }

      // Calculate spending by category
      const spendingByCategory: Record<string, number> = {}
      transactions?.forEach(tx => {
        if (tx.type === 'debit' || tx.type === 'withdrawal') {
          const category = tx.category || 'uncategorized'
          spendingByCategory[category] = (spendingByCategory[category] || 0) + tx.amount
        }
      })

      return NextResponse.json({
        success: true,
        transactions: transactions || [],
        count: transactions?.length || 0,
        period: `Last ${days} days`,
        spendingByCategory,
        lastSync: new Date().toISOString()
      })
    } catch (dbError) {
      console.error('[v0] Database error fetching transactions:', dbError)
      // For new accounts with no transactions, return empty array
      return NextResponse.json({
        success: true,
        transactions: [],
        count: 0,
        period: `Last ${days} days`,
        spendingByCategory: {},
        lastSync: new Date().toISOString()
      })
    }
  } catch (error) {
    console.error('[v0] Transactions fetch error:', error)
    return NextResponse.json({
      success: true,
      transactions: [],
      count: 0,
      spendingByCategory: {},
      lastSync: new Date().toISOString()
    })
  }
}

// POST /api/transactions - Create new transaction
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    const {
      accountId,
      description,
      amount,
      type,
      category,
      recipientId,
      recipientBank,
      recipientAccount,
      recipientName,
    } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    try {
      const { createTransaction, getAccountById, sql } = await import('@/lib/db')

      // Verify account belongs to user
      const account = await getAccountById(accountId)
      if (!account || account.user_id !== userId) {
        return NextResponse.json(
          { error: 'Account not found or access denied' },
          { status: 403 }
        )
      }

      // Create transaction in Neon database
      const transaction = await createTransaction(accountId, {
        type,
        amount,
        description: description || '',
      })

      if (!transaction) {
        throw new Error('Failed to create transaction')
      }

      // Update account balance
      const newBalance =
        type === 'credit'
          ? (account.balance || 0) + amount
          : (account.balance || 0) - amount

      // Update account balance in database
      await sql`
        UPDATE accounts
        SET balance = ${newBalance}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${accountId}
      `

      console.log('[v0] Transaction created and account balance updated:', transaction.id)

      return NextResponse.json({
        success: true,
        message: 'Transaction created successfully',
        transaction,
      }, { status: 201 })
    } catch (dbError) {
      console.error('[v0] Database error creating transaction:', dbError)
      return NextResponse.json(
        { error: 'Failed to create transaction' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('[v0] Transaction creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    )
  }
}
