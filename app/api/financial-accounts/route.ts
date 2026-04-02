import { NextRequest, NextResponse } from 'next/server'
import { createFinancialAccount, saveFinancialAccountToDb, getUserFinancialAccounts } from '@/lib/stripe/financial-accounts'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { accountName, currency = 'usd', userId } = body

    if (!accountName) {
      return NextResponse.json(
        { error: 'Account name is required' },
        { status: 400 }
      )
    }

    // Create financial account in Stripe
    const result = await createFinancialAccount(accountName, currency)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    // Save to database
    const dbResult = await saveFinancialAccountToDb(
      userId || null,
      result.accountId,
      accountName,
      currency
    )

    if (!dbResult.success) {
      return NextResponse.json(
        { error: dbResult.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      accountId: dbResult.id,
      stripeAccountId: result.accountId,
      name: accountName,
      currency: currency,
      status: result.status,
    })
  } catch (error) {
    const err = error as { message?: string }
    return NextResponse.json(
      { error: err.message || 'Failed to create financial account' },
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

    const result = await getUserFinancialAccounts(userId)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      accounts: result.accounts,
    })
  } catch (error) {
    const err = error as { message?: string }
    return NextResponse.json(
      { error: err.message || 'Failed to retrieve financial accounts' },
      { status: 500 }
    )
  }
}
