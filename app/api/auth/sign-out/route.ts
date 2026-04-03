import { auth } from '@/lib/auth/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Call the better-auth sign-out endpoint
    const response = await auth.api.signOut({
      headers: request.headers,
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
