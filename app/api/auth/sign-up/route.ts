import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
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

    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'password', 'street', 'city', 'state', 'zipCode', 'dateOfBirth', 'governmentIdType', 'accountType', 'currency', 'language']
    const missingFields = requiredFields.filter((field) => !body[field])
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
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

    // Password validation - must meet complexity requirements
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        {
          error: 'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character',
        },
        { status: 400 },
      )
    }

    // Age validation - must be 18+
    const birthDate = new Date(dateOfBirth)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const month = today.getMonth() - birthDate.getMonth()
    if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    if (age < 18) {
      return NextResponse.json(
        { error: 'You must be at least 18 years old to open an account' },
        { status: 400 },
      )
    }

    // Phone validation
    const phoneRegex = /^[+]?[0-9\s\-()]+$/
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 },
      )
    }

    // Use service client to create user with auto-confirm
    const supabase = createServiceClient()

    // Create user with admin API - this auto-confirms the email
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: `${firstName} ${lastName}`,
        phone,
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

    // Create comprehensive user profile in public.users table with all new fields
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: data.user.id,
        email,
        full_name: `${firstName} ${lastName}`,
        phone,
        address: `${street}, ${city}, ${state} ${zipCode}`,
        date_of_birth: dateOfBirth,
        government_id_type: governmentIdType,
        account_type_preference: accountType,
        currency_preference: currency,
        language_preference: language,
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
