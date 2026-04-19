import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

const PLAID_CLIENT_ID = process.env.NEXT_PUBLIC_PLAID_CLIENT_ID
const PLAID_SECRET = process.env.PLAID_SECRET
const PLAID_API_URL = process.env.PLAID_ENV === 'production'
  ? 'https://production.plaid.com'
  : process.env.PLAID_ENV === 'development'
    ? 'https://development.plaid.com'
    : 'https://sandbox.plaid.com'

/**
 * Generate Plaid Link Token
 * Called from frontend before opening Plaid Link
 */
export async function POST(request: NextRequest) {
  try {
    // Verify credentials
    if (!PLAID_CLIENT_ID || !PLAID_SECRET) {
      console.error('[v0] Missing Plaid credentials')
      return NextResponse.json(
        { error: 'Plaid is not configured' },
        { status: 400 }
      )
    }

    // Get user from Supabase session
    const supabase = createServiceClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user ID from Neon
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const userId = userData.id

    // Generate link token
    console.log('[v0] Generating Plaid link token...')
    const tokenResponse = await fetch(`${PLAID_API_URL}/link/token/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: PLAID_CLIENT_ID,
        secret: PLAID_SECRET,
        user: {
          client_user_id: userId,
        },
        client_name: 'MyBank',
        language: 'en',
        products: ['auth', 'transactions'],
        country_codes: ['US'],
        webhook: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/plaid/webhook`,
        account_subtypes: 'checking',
        account_filters: {
          depository: {
            account_subtypes: ['checking', 'savings'],
          },
        },
      }),
    })

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json()
      console.error('[v0] Plaid token generation error:', error)
      return NextResponse.json(
        { error: 'Failed to generate link token' },
        { status: 400 }
      )
    }

    const { link_token, expiration } = await tokenResponse.json()

    return NextResponse.json({
      link_token,
      expiration,
    })
  } catch (error) {
    console.error('[v0] Link token generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate link token' },
      { status: 500 }
    )
  }
}
