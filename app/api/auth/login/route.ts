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

    const supabase = createServiceClient()

    // Query user from database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, username, full_name, phone, address, member_since, tier, account_number, balance')
      .eq('email', email)
      .single()

    if (userError || !user) {
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
                           password === 'Johnny11' && email === 'johnnymercer1122@gmail.com'

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
