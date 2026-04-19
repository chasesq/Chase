/**
 * GET /api/admin/users-balances
 * Admin-only endpoint that returns all users with their total balances
 * Used for admin dashboard to show system-wide balance aggregation
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getAllUsersWithBalances } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      )
    }

    const users = await getAllUsersWithBalances()
    
    // Calculate total system balance
    const totalBalance = users.reduce((sum, user) => sum + (user.total_balance || 0), 0)
    
    return NextResponse.json({
      success: true,
      users: users || [],
      totalBalance,
      count: users.length,
    })
  } catch (error) {
    console.error('[api/admin/users-balances] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users and balances' },
      { status: 500 }
    )
  }
}
