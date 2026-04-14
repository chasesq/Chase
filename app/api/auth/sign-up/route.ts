import { NextRequest, NextResponse } from 'next/server'
import { createUser, getUserByEmail, createAccount } from '@/lib/db'
import { hashPassword, validatePassword, validateEmail, createUserSession } from '@/lib/auth'

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
    } = body

    // Determine which form was used and extract full name
    const fullName = name || (firstName && lastName ? `${firstName} ${lastName}` : '')
    const userPhone = phone_number || phone || ''
    const userEmail = email?.toLowerCase().trim()

    // Validate required fields
    if (!userEmail || !password) {
      console.error('[v0] Missing required fields: email or password')
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 },
      )
    }

    // Email validation
    if (!validateEmail(userEmail)) {
      console.error('[v0] Invalid email format:', userEmail)
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 },
      )
    }

    // Password validation
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      console.error('[v0] Password validation failed:', passwordValidation.errors)
      return NextResponse.json(
        { 
          error: 'Password requirements not met',
          details: passwordValidation.errors 
        },
        { status: 400 },
      )
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(userEmail)
    if (existingUser) {
      console.error('[v0] User already exists:', userEmail)
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 },
      )
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Build address if provided
    const address = street && city && state && zipCode 
      ? `${street}, ${city}, ${state} ${zipCode}` 
      : null

    // Create user in database
    const newUser = await createUser({
      email: userEmail,
      password_hash: passwordHash,
      full_name: fullName || null,
      phone: userPhone || null,
      address: address || null,
      date_of_birth: dateOfBirth || null,
      government_id_type: governmentIdType || null,
      account_type_preference: accountType || null,
      currency_preference: currency || 'USD',
      language_preference: language || 'en',
    })

    if (!newUser) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 },
      )
    }

    console.log('[Neon Sign-up] User created successfully:', newUser.id)

    // Create default checking account with zero balance
    const defaultAccount = await createAccount(newUser.id, {
      account_type: 'checking',
      account_number: newUser.account_number.slice(-4), // Last 4 digits for display
      balance: 0, // Zero balance for new users
      currency: currency || 'USD',
    })

    if (!defaultAccount) {
      console.warn('[v0] Warning: Failed to create default account for user:', newUser.id)
    }

    console.log('[Neon Sign-up] Default account created:', {
      accountId: defaultAccount?.id,
      accountNumber: newUser.account_number,
      balance: 0,
    })

    // Create session for auto-login
    try {
      await createUserSession(newUser.id)
    } catch (sessionError) {
      console.error('[v0] Error creating session:', sessionError)
      // Continue even if session creation fails - user was created successfully
    }

    // Return user data with account number and zero balances
    const userProfile = {
      id: newUser.id,
      email: newUser.email,
      full_name: newUser.full_name,
      phone: userPhone,
      accountNumber: newUser.account_number,
      totalBalance: newUser.total_balance,
      totalCheckingBalance: newUser.total_checking_balance,
      totalSavingsBalance: newUser.total_savings_balance,
      totalSavingsGoals: newUser.total_savings_goals,
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
    console.error('[Neon Sign-up] Error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'An error occurred during sign-up',
      },
      { status: 500 },
    )
  }
}
