import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Resend the verification email
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
          `${request.nextUrl.origin}/auth/callback`,
      },
    })

    if (error) {
      console.error('[Resend Verification] Error:', error.message)
      return NextResponse.json(
        { error: 'Failed to resend verification email. Please try again.' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Verification email sent successfully',
    })
  } catch (error) {
    console.error('[Resend Verification] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
