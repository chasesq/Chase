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
      
      // Check if it's an email not confirmed error
      if (authError.message.includes('Email not confirmed')) {
        return NextResponse.json(
          { 
            error: 'Please verify your email before logging in. Check your inbox for the verification link.',
            code: 'EMAIL_NOT_CONFIRMED'
          },
          { status: 401 }
        )
      }
      
      return NextResponse.json(
        { 
          error: 'Invalid email or password. If you just signed up, please check your email to verify your account first.',
          code: 'INVALID_CREDENTIALS'
        },
        { status: 401 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Login failed' },
        { status: 401 }
      )
    }

    // Fetch user profile from users table
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (profileError) {
      console.error('[Supabase Login] Profile error:', profileError.message)
      // Try profiles table as fallback
      const { data: fallbackProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single()
      
      if (fallbackProfile) {
        console.log('[Supabase Login] Found profile in fallback profiles table')
      }
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
