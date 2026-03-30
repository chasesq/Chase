import { NextRequest, NextResponse } from 'next/server'
import { verifyOTP, getOTPKey } from '@/lib/auth/otp-store'
import { createServiceClient } from '@/lib/supabase/server'

// Mock token generation (in production, use JWT with Auth0)
function generateTokens(userId: string) {
  const now = Date.now()
  const accessToken = Buffer.from(
    JSON.stringify({
      sub: userId,
      iat: now,
      exp: now + 3600000, // 1 hour
      iss: 'https://chase.auth0.com',
    })
  ).toString('base64')

  const refreshToken = Buffer.from(
    JSON.stringify({
      sub: userId,
      iat: now,
      exp: now + 2592000000, // 30 days
      iss: 'https://chase.auth0.com',
    })
  ).toString('base64')

  return { accessToken, refreshToken }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { identifier, code, method } = body

    if (!identifier || !code || !method) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (code.length !== 6 || !/^\d+$/.test(code)) {
      return NextResponse.json(
        { error: 'Invalid code format' },
        { status: 400 }
      )
    }

    // Verify OTP
    const otpKey = getOTPKey(method as 'email' | 'sms', identifier)
    const verificationResult = verifyOTP(otpKey, code)

    if (!verificationResult.valid) {
      return NextResponse.json(
        { error: verificationResult.error || 'Invalid OTP code' },
        { status: 401 }
      )
    }

    // Find or create user in Supabase
    const supabase = createServiceClient()

    // For email method, use email as identifier
    const userEmail = method === 'email' ? identifier : `${identifier}@sms.chase.local`

    const { data: user, error: findError } = await supabase
      .from('users')
      .select('id, email')
      .eq(method === 'email' ? 'email' : 'phone', identifier)
      .single()

    let userId: string

    if (findError && findError.code === 'PGRST116') {
      // User doesn't exist - create new user
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          email: userEmail,
          phone: method === 'sms' ? identifier : null,
          password_hash: null, // Passwordless users don't have passwords
          auth_method: 'passwordless',
          created_at: new Date().toISOString(),
        })
        .select('id')
        .single()

      if (createError) {
        console.error('[Passwordless Verify] Create user error:', createError)
        return NextResponse.json(
          { error: 'Failed to create user' },
          { status: 500 }
        )
      }

      userId = newUser.id
    } else if (!findError && user) {
      userId = user.id
    } else {
      console.error('[Passwordless Verify] Database error:', findError)
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      )
    }

    // Generate tokens
    const tokens = generateTokens(userId)

    // Create response with secure httpOnly cookie
    const response = NextResponse.json(
      {
        success: true,
        message: 'Authentication successful',
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
      { status: 200 }
    )

    // Set httpOnly cookie for security
    response.cookies.set('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600, // 1 hour
      path: '/',
    })

    return response
  } catch (error) {
    console.error('[Passwordless Verify] Error:', error)
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    )
  }
}
