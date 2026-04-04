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

    // Check for Alice Johnson
    if (email === 'alice.johnson@example.com' && password === 'Alice2024') {
      const aliceProfile = {
        id: 'user-alice-johnson-001',
        email: 'alice.johnson@example.com',
        username: 'ALICE_JOHNSON',
        full_name: 'Alice Johnson',
        phone: '+1-415-555-0201',
        address: '123 Oak Street, San Francisco, CA 94110',
        member_since: '2024-04-04',
        tier: 'premium',
        account_number: 'CHK-****1001',
        balance: 5000,
        is_admin: false,
        accounts: [
          {
            id: 'acc-alice-checking-001',
            name: 'Checking Account',
            type: 'checking',
            number: 'CHK-****1001',
            balance: 2500,
            currency: 'USD',
          },
          {
            id: 'acc-alice-savings-001',
            name: 'Savings Account',
            type: 'savings',
            number: 'SAV-****1002',
            balance: 1500,
            currency: 'USD',
          },
          {
            id: 'acc-alice-money-market-001',
            name: 'Money Market',
            type: 'money_market',
            number: 'MM-****1003',
            balance: 1000,
            currency: 'USD',
          },
        ],
      }

      return NextResponse.json({
        success: true,
        user: aliceProfile,
      })
    }

    // Check for Bob Smith
    if (email === 'bob.smith@example.com' && password === 'Bob2024') {
      const bobProfile = {
        id: 'user-bob-smith-001',
        email: 'bob.smith@example.com',
        username: 'BOB_SMITH',
        full_name: 'Bob Smith',
        phone: '+1-415-555-0202',
        address: '456 Pine Avenue, San Francisco, CA 94111',
        member_since: '2024-04-04',
        tier: 'standard',
        account_number: 'CHK-****2001',
        balance: 7500,
        is_admin: false,
        accounts: [
          {
            id: 'acc-bob-checking-001',
            name: 'Checking Account',
            type: 'checking',
            number: 'CHK-****2001',
            balance: 4500,
            currency: 'USD',
          },
          {
            id: 'acc-bob-savings-001',
            name: 'Savings Account',
            type: 'savings',
            number: 'SAV-****2002',
            balance: 3000,
            currency: 'USD',
          },
        ],
      }

      return NextResponse.json({
        success: true,
        user: bobProfile,
      })
    }

    // Check for Carol White
    if (email === 'carol.white@example.com' && password === 'Carol2024') {
      const carolProfile = {
        id: 'user-carol-white-001',
        email: 'carol.white@example.com',
        username: 'CAROL_WHITE',
        full_name: 'Carol White',
        phone: '+1-415-555-0203',
        address: '789 Maple Drive, San Francisco, CA 94112',
        member_since: '2024-04-04',
        tier: 'premium',
        account_number: 'CHK-****3001',
        balance: 10000,
        is_admin: false,
        accounts: [
          {
            id: 'acc-carol-checking-001',
            name: 'Checking Account',
            type: 'checking',
            number: 'CHK-****3001',
            balance: 5000,
            currency: 'USD',
          },
          {
            id: 'acc-carol-savings-001',
            name: 'Savings Account',
            type: 'savings',
            number: 'SAV-****3002',
            balance: 3000,
            currency: 'USD',
          },
          {
            id: 'acc-carol-money-market-001',
            name: 'Money Market',
            type: 'money_market',
            number: 'MM-****3003',
            balance: 2000,
            currency: 'USD',
          },
        ],
      }

      return NextResponse.json({
        success: true,
        user: carolProfile,
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

    // Fetch user accounts from user_accounts table
    const { data: userAccounts, error: accountsError } = await supabase
      .from('user_accounts')
      .select('id, account_type, account_name, account_number, balance, currency, is_active')
      .eq('user_id', dbUser.id)
      .order('created_at', { ascending: true })

    // Create session and return user profile with accounts
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
      is_admin: false,
      accounts: userAccounts || [],
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
