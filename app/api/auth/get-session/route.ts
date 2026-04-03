import { auth } from '@/lib/auth/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Get the current session
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session) {
      return NextResponse.json(
        { message: 'No active session' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      user: session.user,
      session: session.session,
    })
  } catch (error) {
    console.error('[v0] Get session error:', error)
    return NextResponse.json(
      { message: 'Failed to get session' },
      { status: 500 }
    )
  }
}
