import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

/**
 * Admin Summary Endpoint
 * Returns system-wide statistics (total balances, user count, recent transactions)
 * Only accessible to admin users
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient()

    // Verify admin access
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('email', session.user.email)
      .single()

    if (userError || !userData || userData.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    // Get total system balance
    const { data: balanceData, error: balanceError } = await supabase
      .from('accounts')
      .select('balance')

    if (balanceError) {
      return NextResponse.json(
        { error: balanceError.message },
        { status: 500 }
      )
    }

    const totalBalance = balanceData?.reduce((sum: number, acc: any) => sum + (acc.balance || 0), 0) || 0

    // Get total number of users
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('id', { count: 'exact' })

    if (usersError) {
      return NextResponse.json(
        { error: usersError.message },
        { status: 500 }
      )
    }

    const totalUsers = usersData?.length || 0

    // Get number of accounts (with balances)
    const accountCount = balanceData?.length || 0

    // Get recent transactions (last 10)
    const { data: recentTransactions, error: transError } = await supabase
      .from('transactions')
      .select('id, user_id, description, amount, created_at')
      .order('created_at', { ascending: false })
      .limit(10)

    if (transError) {
      return NextResponse.json(
        { error: transError.message },
        { status: 500 }
      )
    }

    // Get transaction statistics
    const { data: allTransactions, error: allTransError } = await supabase
      .from('transactions')
      .select('amount')

    if (allTransError) {
      return NextResponse.json(
        { error: allTransError.message },
        { status: 500 }
      )
    }

    const totalTransactions = allTransactions?.length || 0
    const totalTransactionVolume = allTransactions?.reduce((sum: number, tx: any) => sum + (tx.amount || 0), 0) || 0
    const avgTransaction = totalTransactions > 0 ? totalTransactionVolume / totalTransactions : 0

    // Get number of active Plaid connections
    const { data: plaidItems, error: plaidError } = await supabase
      .from('plaid_items')
      .select('id', { count: 'exact' })

    if (plaidError) {
      console.error('[v0] Error fetching Plaid items:', plaidError)
    }

    const activeBankConnections = plaidItems?.length || 0

    return NextResponse.json({
      summary: {
        totalBalance,
        totalUsers,
        accountCount,
        totalTransactions,
        totalTransactionVolume,
        averageTransaction: parseFloat(avgTransaction.toFixed(2)),
        activeBankConnections,
      },
      recentTransactions: recentTransactions || [],
    })
  } catch (error) {
    console.error('[v0] Admin summary error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch admin summary' },
      { status: 500 }
    )
  }
}
