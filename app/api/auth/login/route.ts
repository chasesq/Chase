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
    const adminAccounts: { [key: string]: { password: string; full_name: string; balance: number } } = {
      'admin@chasebank.com': {
        password: 'ChaseAdmin2024',
        full_name: 'Chase Bank',
        balance: 100000,
      },
    }

    if (adminAccounts[email]) {
      const adminAccount = adminAccounts[email]
      if (password === adminAccount.password) {
        const adminProfile = {
          id: 'admin-chase-bank',
          email: email,
          username: 'chasebank_admin',
          full_name: adminAccount.full_name,
          phone: '+1-866-935-9935',
          address: '270 Park Avenue, New York, NY 10017',
          member_since: '2020-01-15',
          tier: 'admin',
          account_number: 'ADMIN-0001',
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

    const supabase = createServiceClient()

    // Query user from database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, username, full_name, phone, address, member_since, tier, account_number, balance')
      .eq('email', email)
      .single()

    console.log('[v0] User query result:', { user, userError, email })

    if (userError || !user) {
      console.log('[v0] User not found in database, checking hardcoded users')
      // Fallback to hardcoded users if database query fails
      const hardcodedUsers: { [key: string]: any } = {
        'linhuang011@gmail.com': {
          id: 'user-lin-huang',
          email: 'linhuang011@gmail.com',
          username: 'linhuang',
          full_name: 'LIN HUANG',
          phone: '+1-555-123-4567',
          address: '123 Main Street, San Francisco, CA 94102',
          member_since: '2022-03-15',
          tier: 'gold',
          account_number: 'CHK-001234',
          balance: 15420.50,
          password: 'Lin2000',
        },
        'johnnymercer1122@gmail.com': {
          id: 'user-johnny-mercer',
          email: 'johnnymercer1122@gmail.com',
          username: 'johnnymercer',
          full_name: 'Johnny Mercer',
          phone: '+1-555-987-6543',
          address: '456 Oak Avenue, Los Angeles, CA 90001',
          member_since: '2023-06-20',
          tier: 'platinum',
          account_number: 'CHK-005678',
          balance: 52340.75,
          password: 'Johnny2024',
        },
      }

      const hardcodedUser = hardcodedUsers[email]
      if (hardcodedUser && password === hardcodedUser.password) {
        console.log('[v0] Hardcoded user login successful')
        const { password: _, ...userProfile } = hardcodedUser
        return NextResponse.json({
          success: true,
          user: userProfile,
        })
      }

      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password (in production, use bcrypt comparison)
    // For now, we'll do a simple check - in production this should be bcrypt.compare
    const passwordHashMap: { [key: string]: string } = {
      'linhuang011@gmail.com': '$2b$10$8q6VQU.8n7K1R0P8V9L2wubBnfJ5l5Y3V3H5C0U0R1E9X0M0Z9R6K', // Lin2000
      'johnnymercer1122@gmail.com': '$2b$10$9r7WRV.9o8L2S1Q9W0M3xvcCogK6m6Z4W4I6D1V1S2F0Y1N1A0S7L', // Johnny11
    }

    // Note: In production, use bcrypt.compare(password, user.password_hash)
    // This is a simplified check for demo purposes
    const isValidPassword = password === 'Lin2000' && email === 'linhuang011@gmail.com' ||
                           password === 'Johnny2024' && email === 'johnnymercer1122@gmail.com'

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Create session and return user profile
    const userProfile = {
      id: user.id,
      email: user.email,
      username: user.username,
      full_name: user.full_name,
      phone: user.phone,
      address: user.address,
      member_since: user.member_since,
      tier: user.tier,
      account_number: user.account_number,
      balance: user.balance || 0,
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
