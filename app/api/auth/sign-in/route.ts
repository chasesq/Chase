import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Placeholder authentication - in production would verify against database
    // For demo: allow login with admin credentials
    const adminEmails = ['admin@chase.com', 'manager@chase.com', 'support@chase.com']
    
    if (adminEmails.includes(email)) {
      // Create session cookie
      const response = NextResponse.json({
        user: {
          id: email.split('@')[0],
          email: email,
          name: email.split('@')[0],
        },
        message: 'Sign in successful',
      })

      // Set session cookie
      response.cookies.set('session', email, {
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
