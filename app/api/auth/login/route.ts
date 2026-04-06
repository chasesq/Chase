import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      console.error('[Supabase Login] Auth error:', authError.message)
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Login failed' },
        { status: 401 }
      )
    }

    // Fetch user profile from profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (profileError) {
      console.error('[Supabase Login] Profile error:', profileError.message)
    }

    // Build user profile from auth data and profile table
    const userProfile = {
      id: authData.user.id,
      email: authData.user.email,
      username: profile?.username || authData.user.email?.split('@')[0],
      full_name: profile?.full_name || authData.user.user_metadata?.full_name || 'User',
      phone: profile?.phone || authData.user.user_metadata?.phone || null,
      address: profile?.address || null,
      member_since: profile?.member_since || authData.user.created_at?.split('T')[0],
      tier: profile?.tier || 'standard',
      account_number: profile?.account_number || `ACC-${authData.user.id.substring(0, 8).toUpperCase()}`,
      balance: profile?.balance || 0,
    }

    console.log('[Supabase Login] User logged in successfully:', authData.user.id)

    return NextResponse.json({
      success: true,
      user: userProfile,
    })
  } catch (error) {
    console.error('[Supabase Login] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
