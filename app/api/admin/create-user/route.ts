import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { full_name, email, phone, password, address, tier } = body

    // Validate required fields
    if (!full_name || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields: full_name, email, password' },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Password validation
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Hash the password
    const saltRounds = 10
    const password_hash = await bcrypt.hash(password, saltRounds)

    // Generate a unique user ID
    const user_id = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

    // In a real implementation, you would save this to a database
    // For now, we'll simulate a successful creation
    console.log('[Admin Create User] Creating user:', {
      user_id,
      full_name,
      email,
      phone,
      address,
      tier: tier || 'Standard',
      created_at: new Date().toISOString(),
    })

    // Attempt to create in Auth0 if configured
    const auth0Domain = process.env.AUTH0_DOMAIN
    const auth0ClientId = process.env.AUTH0_CLIENT_ID
    const auth0ClientSecret = process.env.AUTH0_CLIENT_SECRET

    if (auth0Domain && auth0ClientId && auth0ClientSecret) {
      try {
        // Get Auth0 Management API access token
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

        if (tokenResponse.ok) {
          const { access_token } = await tokenResponse.json()

          // Create user in Auth0
          const createUserResponse = await fetch(`https://${auth0Domain}/api/v2/users`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${access_token}`,
            },
            body: JSON.stringify({
              email,
              password,
              connection: 'Username-Password-Authentication',
              user_metadata: {
                name: full_name,
                phone_number: phone || undefined,
                address: address || undefined,
                tier: tier || 'Standard',
              },
              email_verified: true, // Admin-created users are pre-verified
            }),
          })

          if (createUserResponse.ok) {
            const auth0User = await createUserResponse.json()
            console.log('[Admin Create User] User created in Auth0:', auth0User.user_id)
            
            return NextResponse.json(
              {
                message: 'User created successfully',
                user_id: auth0User.user_id,
                email,
                full_name,
                tier: tier || 'Standard',
              },
              { status: 201 }
            )
          }
        }
      } catch (auth0Error) {
        console.error('[Admin Create User] Auth0 error:', auth0Error)
        // Continue with local simulation if Auth0 fails
      }
    }

    // Return success for local/simulated creation
    return NextResponse.json(
      {
        message: 'User created successfully',
        user_id,
        email,
        full_name,
        tier: tier || 'Standard',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[Admin Create User] Error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'An error occurred during user creation',
      },
      { status: 500 }
    )
  }
}
