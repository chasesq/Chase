import { NextRequest, NextResponse } from 'next/server'
import { createPayoutRecipient, listPayoutRecipients, deletePayoutRecipient } from '@/lib/stripe/payouts'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userId,
      recipientName,
      accountHolderName,
      routingNumber,
      accountNumber,
      accountType = 'individual',
    } = body

    // Validate required fields
    if (!userId || !recipientName || !accountHolderName || !routingNumber || !accountNumber) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, recipientName, accountHolderName, routingNumber, accountNumber' },
        { status: 400 }
      )
    }

    const result = await createPayoutRecipient(
      userId,
      recipientName,
      accountHolderName,
      routingNumber,
      accountNumber,
      accountType
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, code: result.code },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      recipientId: result.recipientId,
      tokenId: result.tokenId,
      accountNumberMasked: result.accountNumberMasked,
    })
  } catch (error) {
    const err = error as { message?: string }
    console.error('[v0] Payout recipient creation error:', err)
    return NextResponse.json(
      { error: err.message || 'Failed to create payout recipient' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const result = await listPayoutRecipients(userId)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      recipients: result.recipients,
    })
  } catch (error) {
    const err = error as { message?: string }
    return NextResponse.json(
      { error: err.message || 'Failed to retrieve payout recipients' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { recipientId } = body

    if (!recipientId) {
      return NextResponse.json(
        { error: 'Recipient ID is required' },
        { status: 400 }
      )
    }

    const result = await deletePayoutRecipient(recipientId)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Recipient deleted successfully',
    })
  } catch (error) {
    const err = error as { message?: string }
    return NextResponse.json(
      { error: err.message || 'Failed to delete recipient' },
      { status: 500 }
    )
  }
}
