import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, accountId, amount, method, description } = body

    // Validate required fields
    if (!userId || !accountId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid request. User ID, account ID, and amount are required' },
        { status: 400 }
      )
    }

    // Validate amount is a positive number
    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      )
    }

    console.log(`[v0] Adding ${numAmount} to account ${accountId} for user ${userId}`)

    // Update account balance
    const result = await sql`
      UPDATE accounts
      SET balance = balance + ${numAmount}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${accountId} AND user_id = ${userId}
      RETURNING id, balance, user_id
    `

    if (!result || result.length === 0) {
      return NextResponse.json(
        { error: 'Account not found or update failed' },
        { status: 404 }
      )
    }

    const updatedAccount = result[0]

    // Create transaction record
    const transactionDescription = description || `Deposit via ${method || 'Bank Transfer'}`
    const txResult = await sql`
      INSERT INTO transactions (
        account_id,
        type,
        amount,
        description,
        status,
        created_at
      ) VALUES (
        ${accountId},
        'deposit',
        ${numAmount},
        ${transactionDescription},
        'completed',
        CURRENT_TIMESTAMP
      )
      RETURNING id, amount, description, created_at
    `

    console.log(`[v0] Fund added successfully. New balance: ${updatedAccount.balance}`)

    return NextResponse.json(
      {
        success: true,
        message: `Successfully added $${numAmount.toFixed(2)} to your account`,
        account: {
          id: updatedAccount.id,
          balance: updatedAccount.balance,
        },
        transaction: txResult[0] || null,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[v0] Add funds error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'An error occurred while adding funds',
      },
      { status: 500 }
    )
  }
}
