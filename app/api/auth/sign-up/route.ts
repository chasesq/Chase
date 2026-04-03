import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, phone_number } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Password validation (minimum 8 characters)
    if (password.length < 8) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Placeholder sign-up - in production would save to database
    const newUser = {
      id: email.split('@')[0],
      email: email,
      name: name || email.split('@')[0],
    }

    console.log('[v0] User created successfully:', newUser)

    // Create session cookie
    const response = NextResponse.json({
      user: newUser,
      message: 'User created successfully',
    }, { status: 201 })

    // Set session cookie
    response.cookies.set('session', email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error('[v0] Sign-up error:', error)
    
    return NextResponse.json(
      { message: 'Failed to sign up' },
      { status: 500 }
    )
  }
}

