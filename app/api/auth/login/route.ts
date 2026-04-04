import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Check for admin accounts first (before creating Supabase client)
    const adminAccounts: { [key: string]: { password: string; full_name: string; balance: number; username: string; tier: string } } = {
      'admin@chasebank.com': {
        password: 'SuperAdmin@2024',
        full_name: 'Super Admin',
        balance: 500000,
        username: 'SUPER_ADMIN',
        tier: 'super_admin',
      },
      'admin.transfers@chasebank.com': {
        password: 'AdminTransfers@2024',
        full_name: 'Transfer Admin',
        balance: 250000,
        username: 'ADMIN_TRANSFERS',
        tier: 'admin',
      },
      'admin.finance@chasebank.com': {
        password: 'AdminFinance@2024',
        full_name: 'Finance Admin',
        balance: 300000,
        username: 'ADMIN_FINANCE',
        tier: 'admin',
      },
    }

    if (adminAccounts[email]) {
      const adminAccount = adminAccounts[email]
      if (password === adminAccount.password) {
        const adminProfile = {
          id: `admin-${adminAccount.username.toLowerCase()}`,
          email: email,
          username: adminAccount.username,
          full_name: adminAccount.full_name,
          phone: '+1-866-935-9935',
          address: '270 Park Avenue, New York, NY 10017',
          member_since: '2020-01-15',
          tier: adminAccount.tier,
          account_number: `ADMIN-${adminAccount.username}`,
          balance: adminAccount.balance,
          is_admin: true,
        }

        return NextResponse.json({
          success: true,
          user: adminProfile,
        })
      } else {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        )
      }
    }

    // Check for Lin Huang user
    if (email === 'linhuang011@gmail.com' && password === 'Lin2000') {
      const linHuangProfile = {
        id: 'user-lin-huang-001',
        email: 'linhuang011@gmail.com',
        username: 'LIN_HUANG',
        full_name: 'Lin Huang',
        phone: '+1-415-555-0147',
        address: '456 Technology Lane, San Francisco, CA 94105',
        member_since: '2024-04-04',
        tier: 'premium',
        account_number: 'CHK-****7890',
        balance: 0,
        is_admin: false,
        accounts: [
          {
            id: 'acc-lin-checking-001',
            name: 'Checking Account',
            type: 'checking',
            number: 'CHK-****7890',
            balance: 0,
            currency: 'USD',
          },
          {
            id: 'acc-lin-savings-001',
            name: 'Savings Account',
            type: 'savings',
            number: 'SAV-****7891',
            balance: 0,
            currency: 'USD',
          },
        ],
      }

      return NextResponse.json({
        success: true,
        user: linHuangProfile,
      })
    }

    // Check for other demo user
    if (email === 'johnnymercer1122@gmail.com' && password === 'Johnny11') {
      const johnnyProfile = {
        id: 'user-johnny-mercer-001',
        email: 'johnnymercer1122@gmail.com',
        username: 'JOHNNY_MERCER',
        full_name: 'Johnny Mercer',
        phone: '+1-415-555-0123',
        address: '789 Market Street, San Francisco, CA 94102',
        member_since: '2024-01-15',
        tier: 'premium',
        account_number: 'CHK-****5678',
        balance: 0,
        is_admin: false,
      }

      return NextResponse.json({
        success: true,
        user: johnnyProfile,
      })
    }

    const supabase = createServiceClient()

    // Query user from database for other users
    const { data: dbUser, error: dbError } = await supabase
      .from('users')
      .select('id, email, username, full_name, phone, address, member_since, tier, account_number, balance')
      .eq('email', email)
      .single()

    if (dbError || !dbUser) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Create session and return user profile
    const userProfile = {
      id: dbUser.id,
      email: dbUser.email,
      username: dbUser.username,
      full_name: dbUser.full_name,
      phone: dbUser.phone,
      address: dbUser.address,
      member_since: dbUser.member_since,
      tier: dbUser.tier,
      account_number: dbUser.account_number,
      balance: dbUser.balance || 0,
    }

    return NextResponse.json({
      success: true,
      user: userProfile,
    })
  } catch (error) {
    console.error('[v0] Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
