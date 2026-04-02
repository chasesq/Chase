import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import * as issuingUtils from '@/lib/stripe/issuing'

/**
 * GET /api/issuing/cards
 * List all cards or filter by cardholder
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cardholderId = searchParams.get('cardholderId')
    const limit = parseInt(searchParams.get('limit') || '100')

    let result

    if (cardholderId) {
      result = await issuingUtils.listCardsForCardholder(cardholderId, limit)
    } else {
      // Get all cardholders and their cards
      const holders = await issuingUtils.listCardholders(100)
      const allCards: any[] = []

      for (const holder of holders.cardholders || []) {
        const cardsResult = await issuingUtils.listCardsForCardholder(holder.id, 50)
        if (cardsResult.success) {
          allCards.push(...cardsResult.cards)
        }
      }

      result = {
        success: true,
        cards: allCards,
        total: allCards.length,
      }
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      cards: result.cards,
      total: result.total,
    })
  } catch (error) {
    console.error('[v0] Error listing cards:', error)
    return NextResponse.json(
      { error: 'Failed to list cards' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/issuing/cards
 * Issue a new card
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = createServiceClient()

    if (!body.cardholderId || !body.cardType) {
      return NextResponse.json(
        { error: 'Missing required fields: cardholderId, cardType' },
        { status: 400 }
      )
    }

    const cardResult = await issuingUtils.issueCard({
      cardholderId: body.cardholderId,
      cardType: body.cardType,
      spendingLimitAmount: body.spendingLimitAmount,
      spendingLimitInterval: body.spendingLimitInterval,
      shippingAddress: body.shippingAddress,
    })

    if (!cardResult.success) {
      return NextResponse.json(
        { error: cardResult.error },
        { status: 400 }
      )
    }

    // Store in database
    const { error: dbError } = await supabase
      .from('stripe_issued_cards')
      .insert({
        cardholder_id: body.cardholderId,
        stripe_card_id: cardResult.stripeCardId,
        card_type: body.cardType,
        card_status: 'active',
        last4: cardResult.last4,
        exp_month: cardResult.expMonth,
        exp_year: cardResult.expYear,
        spending_limit: body.spendingLimitAmount,
        spending_limit_interval: body.spendingLimitInterval || 'monthly',
        metadata: { created_via: 'api' },
      })

    if (dbError) {
      console.error('[v0] Database error:', dbError)
    }

    return NextResponse.json({
      success: true,
      cardId: cardResult.stripeCardId,
      last4: cardResult.last4,
      message: `${body.cardType} card issued successfully`,
    })
  } catch (error) {
    console.error('[v0] Error issuing card:', error)
    return NextResponse.json(
      { error: 'Failed to issue card' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/issuing/cards
 * Update card status (activate/deactivate)
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = createServiceClient()

    if (!body.cardId || !body.action) {
      return NextResponse.json(
        { error: 'Missing required fields: cardId, action' },
        { status: 400 }
      )
    }

    let result

    if (body.action === 'activate') {
      result = await issuingUtils.activateCard(body.cardId)
    } else if (body.action === 'deactivate') {
      result = await issuingUtils.deactivateCard(body.cardId)
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Must be "activate" or "deactivate"' },
        { status: 400 }
      )
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    // Update in database
    const { error: dbError } = await supabase
      .from('stripe_issued_cards')
      .update({
        card_status: body.action === 'activate' ? 'active' : 'inactive',
      })
      .eq('stripe_card_id', body.cardId)

    if (dbError) {
      console.error('[v0] Database error:', dbError)
    }

    return NextResponse.json({
      success: true,
      cardId: body.cardId,
      message: `Card ${body.action}d successfully`,
    })
  } catch (error) {
    console.error('[v0] Error updating card:', error)
    return NextResponse.json(
      { error: 'Failed to update card' },
      { status: 500 }
    )
  }
}
