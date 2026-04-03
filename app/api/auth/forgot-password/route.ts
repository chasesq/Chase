import { auth } from '@/lib/auth/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      )
    }

    // Call the better-auth forget-password endpoint
    const response = await auth.api.forgetPassword({
      email,
      redirectUrl: `${request.nextUrl.origin}/auth/reset-password`,
      headers: request.headers,
    })

    return response
  } catch (error) {
    console.error('[v0] Forgot password error:', error)
    return NextResponse.json(
      { message: 'Failed to process password reset request' },
      { status: 500 }
    )
  }
}
