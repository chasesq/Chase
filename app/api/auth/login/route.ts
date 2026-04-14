import { NextRequest, NextResponse } from 'next/server'
import { getUserByEmail } from '@/lib/db'
import { verifyPassword, createUserSession, validateEmail } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Validate email format
    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await getUserByEmail(email.toLowerCase().trim())

    if (!user) {
      console.error('[Neon Login] User not found:', email)
      return NextResponse.json(
        { 
          error: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS'
        },
        { status: 401 }
      )
    }

    // Verify password
    const passwordValid = await verifyPassword(password, user.password_hash)

    if (!passwordValid) {
      console.error('[Neon Login] Invalid password for user:', email)
      return NextResponse.json(
        { 
          error: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS'
        },
        { status: 401 }
      )
    }

    // Create session for user
    try {
      await createUserSession(user.id)
    } catch (sessionError) {
      console.error('[Neon Login] Error creating session:', sessionError)
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      )
    }

    // Build user profile
    const userProfile = {
      id: user.id,
      email: user.email,
      full_name: user.full_name || 'User',
      phone: user.phone || null,
      address: user.address || null,
      currency_preference: user.currency_preference || 'USD',
      language_preference: user.language_preference || 'en',
      role: user.role || 'user',
      account_number: `ACC-${user.id.substring(0, 8).toUpperCase()}`,
      balance: 0,
    }

    console.log('[Neon Login] User logged in successfully:', user.id)

    return NextResponse.json({
      success: true,
      user: userProfile,
    })
  } catch (error) {
    console.error('[Neon Login] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
