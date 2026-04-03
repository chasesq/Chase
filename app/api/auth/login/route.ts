import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    console.log('[v0] Login attempt:', { email, passwordLength: password?.length })

    if (!email || !password) {
      console.log('[v0] Missing email or password')
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Check for admin accounts first
    const adminAccounts: { [key: string]: { password: string; full_name: string; role: string; balance: number } } = {
      'admin@chasebank.com': {
        password: 'ChaseAdmin2024',
        full_name: 'Chase Bank Administrator',
        role: 'Super Admin',
        balance: 500000,
      },
      'manager@chase.com': {
        password: 'Manager@2024!',
        full_name: 'Chase Manager',
        role: 'Manager',
        balance: 250000,
      },
      'support@chase.com': {
        password: 'Support@2024!',
        full_name: 'Chase Support',
        role: 'Support Agent',
        balance: 100000,
      },
    }

    if (adminAccounts[email]) {
      console.log('[v0] Admin account found:', email)
      const adminAccount = adminAccounts[email]
      if (password === adminAccount.password) {
        console.log('[v0] Admin password correct')
        const adminProfile = {
          id: `admin-${email.split('@')[0]}`,
          email: email,
          username: email.split('@')[0],
          full_name: adminAccount.full_name,
          phone: '+1-866-935-9935',
          address: '270 Park Avenue, New York, NY 10017',
          member_since: '2020-01-15',
          tier: adminAccount.role.toLowerCase(),
          account_number: `ADMIN-${email.split('@')[0].toUpperCase()}`,
          balance: adminAccount.balance,
          is_admin: true,
          role: adminAccount.role,
        }

        console.log('[v0] Admin login successful:', { email, id: adminProfile.id })
        
        // Set admin session cookie
        const response = NextResponse.json({
          success: true,
          user: adminProfile,
        })
        
        // Set session cookie with admin flag
        response.cookies.set('session', JSON.stringify(adminProfile), {
          httpOnly: true,
          maxAge: 86400 * 7, // 7 days
          path: '/',
        })
        response.cookies.set('admin_session', 'true', {
          httpOnly: true,
          maxAge: 86400 * 7,
          path: '/',
        })

        return response
      } else {
        console.log('[v0] Admin password incorrect')
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        )
      }
    }

    console.log('[v0] Not an admin account, checking regular accounts')
    
    // Check regular user accounts
    const regularAccounts: { [key: string]: { password: string; full_name: string; account_number: string } } = {
      'linhuang011@gmail.com': {
        password: 'Lin2000',
        full_name: 'Lin Huang',
        account_number: 'ACC-001',
      },
      'johnnymercer1122@gmail.com': {
        password: 'Johnny11',
        full_name: 'Johnny Mercer',
        account_number: 'ACC-002',
      },
    }

    if (regularAccounts[email]) {
      const account = regularAccounts[email]
      if (password === account.password) {
        const userProfile = {
          id: email.split('@')[0],
          email: email,
          username: email.split('@')[0],
          full_name: account.full_name,
          phone: '+1-555-0100',
          address: '123 Main St, City, State 12345',
          member_since: '2023-01-15',
          tier: 'regular',
          account_number: account.account_number,
          balance: 5000,
          is_admin: false,
        }

        // Set regular user session cookie
        const response = NextResponse.json({
          success: true,
          user: userProfile,
        })
        
        response.cookies.set('session', JSON.stringify(userProfile), {
          httpOnly: true,
          maxAge: 86400 * 7,
          path: '/',
        })

        return response
      } else {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Invalid email or password' },
      { status: 401 }
    )
  } catch (error) {
    console.error('[v0] Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
