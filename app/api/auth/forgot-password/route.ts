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

    // Placeholder password reset - in production would send email
    console.log('[v0] Password reset requested for:', email)

    return NextResponse.json({
      message: 'Password reset email sent successfully',
      email: email,
    })
  } catch (error) {
    console.error('[v0] Forgot password error:', error)
    return NextResponse.json(
      { message: 'Failed to process password reset request' },
      { status: 500 }
    )
  }
}
