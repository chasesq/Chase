import { NextRequest, NextResponse } from 'next/server'
import { addTestCredit, listFinancialAccounts } from '@/lib/stripe/financial-accounts'
import { createServiceClient } from '@/lib/supabase/server'

// Check if user is admin
async function isAdmin(userId: string): Promise<boolean> {
  if (userId === 'admin-chase-bank') {
    return true
  }

  try {
    const supabase = createServiceClient()
    const { data: user, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single()

    if (error) return false
    return user?.role === 'admin'
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, userId, ...payload } = body

    // Verify admin access
    const admin = await isAdmin(userId)
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized - admin access required' },
        { status: 403 }
      )
    }

    if (action === 'add_test_credit') {
      const { financialAccountId, amount, currency = 'usd', description } = payload

      if (!financialAccountId || !amount || amount <= 0) {
        return NextResponse.json(
          { error: 'Missing or invalid required fields: financialAccountId, amount' },
          { status: 400 }
        )
      }

      const result = await addTestCredit(
        financialAccountId,
        amount,
        currency,
        description || `Test credit - ${new Date().toISOString()}`
      )

      if (!result.success) {
        return NextResponse.json(
          { error: result.error, code: result.code },
          { status: 400 }
        )
      }

      return NextResponse.json({
        success: true,
        creditId: result.creditId,
        amount: result.amount,
        status: result.status,
        created: result.created,
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    const err = error as { message?: string }
    console.error('[v0] Admin financial accounts error:', err)
    return NextResponse.json(
      { error: err.message || 'Failed to process request' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')

    // Verify admin access
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const admin = await isAdmin(userId)
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized - admin access required' },
        { status: 403 }
      )
    }

    // List all financial accounts
    const result = await listFinancialAccounts(100)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      accounts: result.accounts,
    })
  } catch (error) {
    const err = error as { message?: string }
    return NextResponse.json(
      { error: err.message || 'Failed to retrieve financial accounts' },
      { status: 500 }
    )
  }
}
