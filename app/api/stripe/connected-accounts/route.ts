import { NextRequest, NextResponse } from 'next/server'
import {
  createConnectedAccount,
  getExpressOnboardingLink,
  updateConnectedAccount,
  getConnectedAccount,
  listUserConnectedAccounts,
  deactivateConnectedAccount,
  getPlatformFees,
  transferFundsToConnectedAccount,
} from '@/lib/stripe/connected-accounts'

// GET /api/stripe/connected-accounts - List connected accounts
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const accountId = request.nextUrl.searchParams.get('accountId')

    if (accountId) {
      // Get specific account details
      const account = await getConnectedAccount(accountId)
      return NextResponse.json(account)
    }

    // List all accounts for user
    const accounts = await listUserConnectedAccounts(userId)
    return NextResponse.json({ accounts })
  } catch (error: any) {
    console.error('[v0] Connected accounts fetch error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// POST /api/stripe/connected-accounts - Create or manage account
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      action,
      accountId,
      email,
      accountType,
      platformFeePercent,
      refreshUrl,
      returnUrl,
      updates,
      amountCents,
      description,
    } = body

    switch (action) {
      case 'create':
        const newAccount = await createConnectedAccount(
          userId,
          email,
          accountType || 'express',
          platformFeePercent || 0
        )
        return NextResponse.json({ success: true, data: newAccount })

      case 'onboarding-link':
        const link = await getExpressOnboardingLink(
          accountId,
          refreshUrl,
          returnUrl
        )
        return NextResponse.json({ success: true, data: link })

      case 'update':
        const updated = await updateConnectedAccount(accountId, updates)
        return NextResponse.json({ success: true, data: updated })

      case 'get-fees':
        const fees = await getPlatformFees(accountId)
        return NextResponse.json({ success: true, data: fees })

      case 'transfer':
        const transfer = await transferFundsToConnectedAccount(
          accountId,
          amountCents,
          description
        )
        return NextResponse.json({ success: true, data: transfer })

      case 'deactivate':
        const deactivated = await deactivateConnectedAccount(accountId)
        return NextResponse.json({ success: true, data: deactivated })

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        )
    }
  } catch (error: any) {
    console.error('[v0] Connected accounts error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
