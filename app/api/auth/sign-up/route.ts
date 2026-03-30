import { NextRequest, NextResponse } from 'next/server'

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

    // Get Auth0 credentials from environment
    const auth0Domain = process.env.AUTH0_DOMAIN
    const auth0ClientId = process.env.AUTH0_CLIENT_ID
    const auth0ClientSecret = process.env.AUTH0_CLIENT_SECRET

    if (!auth0Domain || !auth0ClientId || !auth0ClientSecret) {
      console.error('[Auth0 Sign-up] Missing Auth0 environment variables')
      return NextResponse.json(
        { error: 'Auth0 configuration is incomplete' },
        { status: 500 },
      )
    }

    // Step 1: Get Auth0 Management API access token
    const tokenResponse = await fetch(`https://${auth0Domain}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: auth0ClientId,
        client_secret: auth0ClientSecret,
        audience: `https://${auth0Domain}/api/v2/`,
        grant_type: 'client_credentials',
      }),
    })

    if (!tokenResponse.ok) {
      console.error('[Auth0 Sign-up] Failed to get management token:', await tokenResponse.text())
      return NextResponse.json(
        { error: 'Failed to authenticate with Auth0' },
        { status: 500 },
      )
    }

    const { access_token } = await tokenResponse.json()

    // Step 2: Create user in Auth0
    const createUserResponse = await fetch(`https://${auth0Domain}/api/v2/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`,
      },
      body: JSON.stringify({
        email,
        password,
        connection: 'Username-Password-Authentication', // Default database connection
        user_metadata: {
          name,
          phone_number: phone_number || undefined,
        },
        email_verified: false,
      }),
    })

    if (!createUserResponse.ok) {
      const error = await createUserResponse.json()
      console.error('[Auth0 Sign-up] Failed to create user:', error)
      
      // Handle specific Auth0 errors
      if (error.statusCode === 409) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 409 },
        )
      }

      return NextResponse.json(
        { error: error.message || 'Failed to create user' },
        { status: createUserResponse.status },
      )
    }

    const newUser = await createUserResponse.json()

    console.log('[Auth0 Sign-up] User created successfully:', newUser.user_id)

    return NextResponse.json(
      {
        message: 'User created successfully',
        user_id: newUser.user_id,
        email: newUser.email,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('[Auth0 Sign-up] Error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'An error occurred during sign-up',
      },
      { status: 500 },
    )
  }
}

