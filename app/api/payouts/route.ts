import { NextRequest, NextResponse } from 'next/server'
import { createOutboundTransfer, listUserPayouts } from '@/lib/stripe/payouts'
import { getFinancialAccountFromDb } from '@/lib/stripe/financial-accounts'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userId,
      financialAccountId,
      recipientTokenId,
      amount,
      currency = 'usd',
      description,
    } = body

    if (!userId || !financialAccountId || !recipientTokenId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Missing or invalid required fields' },
        { status: 400 }
      )
    }

    // Get financial account details
    const accountResult = await getFinancialAccountFromDb(financialAccountId)
    if (!accountResult.success) {
      return NextResponse.json(
        { error: 'Financial account not found' },
        { status: 404 }
      )
    }

    const stripeAccountId = accountResult.account.stripe_account_id

    // Create outbound transfer
    const result = await createOutboundTransfer(
      financialAccountId,
      stripeAccountId,
      recipientTokenId,
      amount,
      currency,
      description
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, code: result.code },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      payoutId: result.payoutId,
      transferId: result.transferId,
      status: result.status,
      estimatedArrival: result.estimatedArrival,
    })
  } catch (error) {
    const err = error as { message?: string }
    console.error('[v0] Payout creation error:', err)
    return NextResponse.json(
      { error: err.message || 'Failed to create payout' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '10')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const result = await listUserPayouts(userId, limit)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      payouts: result.payouts,
    })
  } catch (error) {
    const err = error as { message?: string }
    return NextResponse.json(
      { error: err.message || 'Failed to retrieve payouts' },
      { status: 500 }
    )
  }
}
