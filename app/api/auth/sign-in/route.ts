import { auth } from '@/lib/auth/server'
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

    // Call the better-auth sign-in endpoint
    const response = await auth.api.signInEmail({
      email,
      password,
      headers: request.headers,
    })

    return response
  } catch (error) {
    console.error('[v0] Sign-in error:', error)
    return NextResponse.json(
      { message: 'Failed to sign in' },
      { status: 500 }
    )
  }
}
