import { auth } from '@/lib/auth/server'
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

    // Call the better-auth sign-up endpoint
    const response = await auth.api.signUpEmail({
      email,
      password,
      name,
      headers: request.headers,
    })

    console.log('[v0] User created successfully')

    return response
  } catch (error) {
    console.error('[v0] Sign-up error:', error)
    
    // Check if email already exists
    if (error instanceof Error && error.message.includes('already exists')) {
      return NextResponse.json(
        { message: 'Email already registered' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { message: 'Failed to sign up' },
      { status: 500 }
    )
  }
}

