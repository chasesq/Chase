import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, phone_number } = body

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, password' },
        { status: 400 },
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 },
      )
    }

    // Password validation (minimum 8 characters)
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 },
      )
    }

    // Use service client to create user with auto-confirm (bypasses email verification)
    const supabase = createServiceClient()

    // Create user with admin API - this auto-confirms the email
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: name,
        phone: phone_number || null,
      },
    })

    if (error) {
      console.error('[Supabase Sign-up] Error:', error.message)
      
      // Handle specific Supabase errors
      if (error.message.includes('already been registered') || error.message.includes('already exists')) {
        return NextResponse.json(
          { error: 'An account with this email already exists' },
          { status: 409 },
        )
      }

      return NextResponse.json(
        { error: error.message || 'Failed to create user' },
        { status: 400 },
      )
    }

    if (!data.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 },
      )
    }

    console.log('[Supabase Sign-up] User created and auto-confirmed:', data.user.id)

    return NextResponse.json(
      {
        message: 'Account created successfully! You can now log in.',
        user_id: data.user.id,
        email: data.user.email,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('[Supabase Sign-up] Error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'An error occurred during sign-up',
      },
      { status: 500 },
    )
  }
}
