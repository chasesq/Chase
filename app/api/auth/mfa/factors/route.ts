import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Get user
    const { data: users, error: findError } = await supabase
      .from('users')
      .select('id, two_factor_enabled, totp_secret')
      .eq('email', email)
      .single()

    if (findError || !users) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Return enrolled factors
    // In a real app, you'd track multiple factors in a separate table
    // For now, we'll return based on what's enabled
    const factors = []

    if (users.two_factor_enabled && users.totp_secret) {
      factors.push({
        id: 'totp-primary',
        type: 'totp',
        name: 'Authenticator App',
        enrolled_at: new Date().toISOString(),
        is_primary: true,
        device_info: {
          device_name: 'Mobile Device',
        },
      })
    }

    return NextResponse.json({
      factors,
    })
  } catch (error) {
    console.error('[v0] MFA factors GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
