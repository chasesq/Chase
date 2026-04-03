import { NextRequest, NextResponse } from 'next/server'

// Admin users with account names
const adminUsers = [
  { email: 'admin@chase.com', password: 'Admin@2024!', accountName: 'Chase Admin', role: 'admin' },
  { email: 'manager@chase.com', password: 'Manager@2024!', accountName: 'Chase Manager', role: 'manager' },
  { email: 'support@chase.com', password: 'Support@2024!', accountName: 'Chase Support', role: 'support' },
]

export async function POST(request: NextRequest) {
  try {
    const { email, password, accountName } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user in admin list
    const user = adminUsers.find(u => u.email === email && u.password === password)
    
    if (user) {
      // Create session cookie with account name
      const sessionData = JSON.stringify({
        email: user.email,
        accountName: accountName || user.accountName,
        role: user.role,
      })

      const response = NextResponse.json({
        user: {
          id: email.split('@')[0],
          email: user.email,
          name: accountName || user.accountName,
          accountName: accountName || user.accountName,
          role: user.role,
        },
        message: 'Sign in successful',
      })

      // Set session cookie
      response.cookies.set('session', btoa(sessionData), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })

      return response
    }

    return NextResponse.json(
      { message: 'Invalid email or password' },
      { status: 401 }
    )
  } catch (error) {
    console.error('[v0] Sign-in error:', error)
    return NextResponse.json(
      { message: 'Failed to sign in' },
      { status: 500 }
    )
  }
}
