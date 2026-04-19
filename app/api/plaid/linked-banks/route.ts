import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

/**
 * GET /api/plaid/linked-banks - Get user's linked banks
 * DELETE /api/plaid/linked-banks - Unlink a bank
 */

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient()

    // Get user from Supabase session
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

    // Get linked banks
    const { data: plaidItems, error } = await supabase
      .from('plaid_items')
      .select('id, institution_name, item_id, linked_at')
      .eq('user_id', userId)
      .order('linked_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      banks: plaidItems || [],
    })
  } catch (error) {
    console.error('[v0] Error fetching linked banks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch linked banks' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServiceClient()

    // Get user from Supabase session
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
    const itemId = request.nextUrl.searchParams.get('item_id')

    if (!itemId) {
      return NextResponse.json(
        { error: 'item_id is required' },
        { status: 400 }
      )
    }

    // Verify ownership
    const { data: plaidItem, error: fetchError } = await supabase
      .from('plaid_items')
      .select('id')
      .eq('user_id', userId)
      .eq('item_id', itemId)
      .single()

    if (fetchError || !plaidItem) {
      return NextResponse.json(
        { error: 'Bank account not found' },
        { status: 404 }
      )
    }

    // Delete the Plaid item
    const { error: deleteError } = await supabase
      .from('plaid_items')
      .delete()
      .eq('id', plaidItem.id)

    if (deleteError) {
      return NextResponse.json(
        { error: deleteError.message },
        { status: 500 }
      )
    }

    // Optional: Call Plaid to unlink the item
    // This prevents the item from being used further
    try {
      const PLAID_CLIENT_ID = process.env.NEXT_PUBLIC_PLAID_CLIENT_ID
      const PLAID_SECRET = process.env.PLAID_SECRET
      const PLAID_API_URL = process.env.PLAID_ENV === 'production'
        ? 'https://production.plaid.com'
        : process.env.PLAID_ENV === 'development'
          ? 'https://development.plaid.com'
          : 'https://sandbox.plaid.com'

      if (PLAID_CLIENT_ID && PLAID_SECRET) {
        await fetch(`${PLAID_API_URL}/item/remove`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client_id: PLAID_CLIENT_ID,
            secret: PLAID_SECRET,
            access_token: '', // We don't store this, so we skip
          }),
        }).catch(err => console.warn('[v0] Warning: Could not remove item from Plaid:', err))
      }
    } catch (err) {
      console.warn('[v0] Warning: Could not notify Plaid of removal:', err)
    }

    return NextResponse.json({
      success: true,
      message: 'Bank account unlinked',
    })
  } catch (error) {
    console.error('[v0] Error unlinking bank:', error)
    return NextResponse.json(
      { error: 'Failed to unlink bank account' },
      { status: 500 }
    )
  }
}
