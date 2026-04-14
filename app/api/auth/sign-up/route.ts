import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      // Basic fields from simple sign-up form
      name,
      email,
      password,
      phone_number,
      // Extended fields from multi-step sign-up form
      firstName,
      lastName,
      phone,
      street,
      city,
      state,
      zipCode,
      dateOfBirth,
      governmentIdType,
      accountType,
      currency,
      language,
      emailNotifications,
      smsNotifications,
      inAppNotifications,
      twoFactorEnabled,
    } = body

    // Determine which form was used and extract full name
    const fullName = name || (firstName && lastName ? `${firstName} ${lastName}` : '')
    const userPhone = phone_number || phone || ''
    const userEmail = email

    // Validate required fields (minimal for simple form)
    if (!userEmail || !password) {
      console.error('[v0] Missing required fields: email or password')
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 },
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(userEmail)) {
      console.error('[v0] Invalid email format:', userEmail)
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 },
      )
    }

    // Password validation - at least 8 chars with uppercase and number
    if (password.length < 8) {
      console.error('[v0] Password too short')
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 },
      )
    }

    // Use service client to create user with auto-confirm
    const supabase = createServiceClient()

    // Create user with admin API - this auto-confirms the email
    const { data, error } = await supabase.auth.admin.createUser({
      email: userEmail,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: fullName,
        phone: userPhone,
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

    // Build address if provided
    const address = street && city && state && zipCode 
      ? `${street}, ${city}, ${state} ${zipCode}` 
      : null

    // Create user profile in public.users table
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: data.user.id,
        email: userEmail,
        full_name: fullName || null,
        phone: userPhone || null,
        address,
        date_of_birth: dateOfBirth || null,
        government_id_type: governmentIdType || null,
        account_type_preference: accountType || null,
        currency_preference: currency || 'USD',
        language_preference: language || 'en',
        email_notifications: emailNotifications ?? true,
        sms_notifications: smsNotifications ?? false,
        inapp_notifications: inAppNotifications ?? true,
        two_factor_enabled: twoFactorEnabled ?? false,
        role: 'user', // Default role for new sign-ups
      })

    if (profileError) {
      console.error('[Supabase Sign-up] Profile creation error:', profileError.message)
      // Continue even if profile creation fails - user auth was successful
    }

    // Return user data for auto-login
    const userProfile = {
      id: data.user.id,
      email: data.user.email,
      full_name: fullName,
      phone: userPhone,
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully!',
        user: userProfile,
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
