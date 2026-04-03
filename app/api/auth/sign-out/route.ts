import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Clear session cookie
    const response = NextResponse.json({
      message: 'Sign out successful',
    })

    response.cookies.set('session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Clear the cookie
    })

    return response
  } catch (error) {
    console.error('[v0] Sign-out error:', error)
    return NextResponse.json(
      { message: 'Failed to sign out' },
      { status: 500 }
    )
  }
}
