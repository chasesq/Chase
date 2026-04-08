import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    const { data: passkeys, error } = await supabase
      .from('passkey_credentials')
      .select('id, device_name, device_type, browser_name, enrolled_at, last_used_at')
      .eq('user_id', userId)
      .eq('verified', true)
      .order('enrolled_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch passkeys' },
        { status: 500 }
      )
    }

    return NextResponse.json({ passkeys: passkeys || [] })
  } catch (error) {
    console.error('[v0] Passkey list error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
