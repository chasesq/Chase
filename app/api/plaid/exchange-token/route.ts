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
 * Exchange Plaid public token for access token and item ID
 * Called from frontend after successful Plaid Link flow
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
    const { public_token, institution } = await request.json()

    if (!public_token) {
      return NextResponse.json(
        { error: 'public_token is required' },
        { status: 400 }
      )
    }

    // Exchange public token for access token
    console.log('[v0] Exchanging Plaid public token...')
    const exchangeResponse = await fetch(`${PLAID_API_URL}/item/public_token/exchange`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: PLAID_CLIENT_ID,
        secret: PLAID_SECRET,
        public_token,
      }),
    })

    if (!exchangeResponse.ok) {
      const error = await exchangeResponse.json()
      console.error('[v0] Plaid exchange error:', error)
      return NextResponse.json(
        { error: 'Failed to exchange Plaid token' },
        { status: 400 }
      )
    }

    const exchangeData = await exchangeResponse.json()
    const { access_token, item_id } = exchangeData

    // Get institution details from Plaid
    let institutionName = institution?.name || 'Unknown Bank'
    let institutionId = institution?.institution_id || null

    if (!institutionId && item_id) {
      try {
        const itemResponse = await fetch(`${PLAID_API_URL}/item/get`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            client_id: PLAID_CLIENT_ID,
            secret: PLAID_SECRET,
            access_token,
          }),
        })

        if (itemResponse.ok) {
          const itemData = await itemResponse.json()
          institutionId = itemData.item.institution_id
        }
      } catch (err) {
        console.error('[v0] Error fetching institution details:', err)
      }
    }

    // Store plaid_items mapping in Neon
    console.log('[v0] Storing Plaid item mapping...')
    const { data: existingItem } = await supabase
      .from('plaid_items')
      .select('id')
      .eq('user_id', userId)
      .single()

    let plaidItemRecord

    if (existingItem) {
      // Update existing item
      const { data, error } = await supabase
        .from('plaid_items')
        .update({
          item_id,
          access_token,
          institution_id: institutionId,
          institution_name: institutionName,
          linked_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        console.error('[v0] Error updating Plaid item:', error)
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        )
      }

      plaidItemRecord = data
    } else {
      // Create new item
      const { data, error } = await supabase
        .from('plaid_items')
        .insert([{
          user_id: userId,
          item_id,
          access_token,
          institution_id: institutionId,
          institution_name: institutionName,
          linked_at: new Date().toISOString(),
        }])
        .select()
        .single()

      if (error) {
        console.error('[v0] Error creating Plaid item:', error)
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        )
      }

      plaidItemRecord = data
    }

    // Create notification for user
    await supabase
      .from('notifications')
      .insert([{
        user_id: userId,
        type: 'bank_linked',
        message: `Successfully linked ${institutionName}. Transactions will sync automatically.`,
        data: {
          institution_name: institutionName,
          linked_at: new Date().toISOString(),
        },
      }])
      .catch(err => console.error('[v0] Error creating notification:', err))

    return NextResponse.json({
      success: true,
      message: 'Bank account linked successfully',
      item: {
        item_id,
        institution_name: institutionName,
        linked_at: plaidItemRecord.linked_at,
      },
    })
  } catch (error) {
    console.error('[v0] Plaid exchange error:', error)
    return NextResponse.json(
      { error: 'Failed to link bank account' },
      { status: 500 }
    )
  }
}
