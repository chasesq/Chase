import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import * as issuingUtils from '@/lib/stripe/issuing'

/**
 * GET /api/issuing/transactions
 * List card transactions
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cardId = searchParams.get('cardId')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!cardId) {
      return NextResponse.json(
        { error: 'Missing cardId parameter' },
        { status: 400 }
      )
    }

    const result = await issuingUtils.listCardTransactions(cardId, limit)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    // Format transactions for display
    const transactions = (result.transactions || []).map((txn: any) => ({
      id: txn.id,
      amount: (txn.amount || 0) / 100,
      currency: txn.currency || 'USD',
      merchant: txn.merchant_name || 'Unknown Merchant',
      merchantCategory: txn.merchant_category_code,
      status: txn.status || 'completed',
      created: txn.created,
      authorization: txn.authorization,
      dispute: txn.dispute,
    }))

    return NextResponse.json({
      success: true,
      transactions,
      total: result.total,
    })
  } catch (error) {
    console.error('[v0] Error listing transactions:', error)
    return NextResponse.json(
      { error: 'Failed to list transactions' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/issuing/transactions
 * Simulate a card transaction (for testing)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = createServiceClient()

    if (!body.cardId || !body.amount || !body.merchantName) {
      return NextResponse.json(
        { error: 'Missing required fields: cardId, amount, merchantName' },
        { status: 400 }
      )
    }

    // This would normally be called via a test helper
    // For now, we'll just store it in the database
    const { data, error: dbError } = await supabase
      .from('stripe_card_transactions')
      .insert({
        card_id: body.cardId,
        cardholder_id: body.cardholderId,
        stripe_transaction_id: `txn_test_${Date.now()}`,
        amount: body.amount,
        currency: 'USD',
        merchant_name: body.merchantName,
        merchant_category_code: body.merchantCategoryCode || '5411',
        transaction_status: 'approved',
        metadata: { simulated: true, test: true },
      })
      .select()
      .single()

    if (dbError) {
      console.error('[v0] Database error:', dbError)
      return NextResponse.json(
        { error: 'Failed to create transaction' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      transactionId: data?.id,
      amount: body.amount,
      merchant: body.merchantName,
      status: 'approved',
    })
  } catch (error) {
    console.error('[v0] Error creating transaction:', error)
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    )
  }
}
