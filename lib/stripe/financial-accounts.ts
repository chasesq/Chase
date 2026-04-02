'use server'

import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/server'

/**
 * Create a new Stripe Financial Account for the platform
 * Used to hold money and manage payouts to connected accounts
 */
export async function createFinancialAccount(
  accountName: string,
  currency: string = 'usd',
  metadata?: Record<string, string>
) {
  try {
    const financialAccount = await stripe.treasury.financialAccounts.create({
      supported_currencies: [currency.toLowerCase()],
      features: {
        card_issuing: { requested: false },
        deposit_insurance: { requested: true },
        financial_addresses: {
          ach: { requested: true },
          us_domestic_wire: { requested: true },
        },
        inbound_transfers: { requested: true },
        outbound_payments: { requested: true },
        outbound_transfers: { requested: true },
      },
    })

    return {
      success: true,
      accountId: financialAccount.id,
      status: financialAccount.status,
      currency: currency.toLowerCase(),
      features: financialAccount.features,
    }
  } catch (error) {
    const stripeError = error as { message?: string; code?: string }
    return {
      success: false,
      error: stripeError.message || 'Failed to create financial account',
      code: stripeError.code,
    }
  }
}

/**
 * Get financial account details and balance
 */
export async function getFinancialAccount(accountId: string) {
  try {
    const account = await stripe.treasury.financialAccounts.retrieve(accountId)

    return {
      success: true,
      account: {
        id: account.id,
        status: account.status,
        balance: account.balance,
        features: account.features,
        supportedCurrencies: account.supported_currencies,
        created: account.created,
      },
    }
  } catch (error) {
    const stripeError = error as { message?: string }
    return {
      success: false,
      error: stripeError.message || 'Failed to retrieve financial account',
    }
  }
}

/**
 * List all financial accounts
 */
export async function listFinancialAccounts(limit: number = 10) {
  try {
    const accounts = await stripe.treasury.financialAccounts.list({ limit })

    return {
      success: true,
      accounts: accounts.data.map(account => ({
        id: account.id,
        status: account.status,
        balance: account.balance,
        supportedCurrencies: account.supported_currencies,
        created: account.created,
      })),
    }
  } catch (error) {
    const stripeError = error as { message?: string }
    return {
      success: false,
      error: stripeError.message || 'Failed to list financial accounts',
    }
  }
}

/**
 * Add funds to a financial account using ReceivedCredit (test mode)
 * In production, money comes from wire transfers, ACH, or other sources
 */
export async function addTestCredit(
  financialAccountId: string,
  amount: number,
  currency: string = 'usd',
  description?: string
) {
  try {
    // In test mode, use the test helper to create a received credit
    const receivedCredit = await (stripe.treasury.receivedCredits.create as any)(
      {
        financial_account: financialAccountId,
        amount,
        currency: currency.toLowerCase(),
        description: description || 'Test credit',
        initiating_payment_method: 'manual', // Test mode payment method
      },
      {
        apiKey: process.env.STRIPE_SECRET_KEY,
        stripeAccount: undefined,
      }
    )

    return {
      success: true,
      creditId: receivedCredit.id,
      amount: receivedCredit.amount,
      status: receivedCredit.status,
      created: receivedCredit.created,
    }
  } catch (error) {
    const stripeError = error as { message?: string; code?: string }
    console.error('[v0] Test credit creation error:', stripeError)
    return {
      success: false,
      error: stripeError.message || 'Failed to add test credit',
      code: stripeError.code,
    }
  }
}

/**
 * Retrieve received credit details
 */
export async function getReceivedCredit(
  financialAccountId: string,
  creditId: string
) {
  try {
    const credit = await stripe.treasury.receivedCredits.retrieve(creditId, {
      financial_account: financialAccountId,
    })

    return {
      success: true,
      credit: {
        id: credit.id,
        amount: credit.amount,
        currency: credit.currency,
        status: credit.status,
        created: credit.created,
      },
    }
  } catch (error) {
    const stripeError = error as { message?: string }
    return {
      success: false,
      error: stripeError.message || 'Failed to retrieve credit',
    }
  }
}

/**
 * List received credits for a financial account
 */
export async function listReceivedCredits(
  financialAccountId: string,
  limit: number = 10
) {
  try {
    const credits = await stripe.treasury.receivedCredits.list({
      financial_account: financialAccountId,
      limit,
    })

    return {
      success: true,
      credits: credits.data.map(credit => ({
        id: credit.id,
        amount: credit.amount,
        currency: credit.currency,
        status: credit.status,
        sourceFlowType: credit.source?.flow_type,
        created: credit.created,
      })),
    }
  } catch (error) {
    const stripeError = error as { message?: string }
    return {
      success: false,
      error: stripeError.message || 'Failed to list received credits',
    }
  }
}

/**
 * Store financial account in database
 */
export async function saveFinancialAccountToDb(
  userId: string | null,
  stripeAccountId: string,
  accountName: string,
  currency: string = 'usd'
) {
  try {
    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('stripe_financial_accounts')
      .insert({
        user_id: userId,
        stripe_account_id: stripeAccountId,
        account_name: accountName,
        currency: currency.toLowerCase(),
        balance: 0,
        status: 'active',
      })
      .select()
      .single()

    if (error) {
      console.error('[v0] Database error:', error)
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
      id: data.id,
    }
  } catch (error) {
    const err = error as { message?: string }
    return {
      success: false,
      error: err.message || 'Failed to save financial account',
    }
  }
}

/**
 * Get financial account from database
 */
export async function getFinancialAccountFromDb(accountId: string) {
  try {
    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('stripe_financial_accounts')
      .select('*')
      .eq('id', accountId)
      .single()

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
      account: data,
    }
  } catch (error) {
    const err = error as { message?: string }
    return {
      success: false,
      error: err.message || 'Failed to retrieve financial account',
    }
  }
}

/**
 * List user's financial accounts from database
 */
export async function getUserFinancialAccounts(userId: string) {
  try {
    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('stripe_financial_accounts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
      accounts: data || [],
    }
  } catch (error) {
    const err = error as { message?: string }
    return {
      success: false,
      error: err.message || 'Failed to list financial accounts',
    }
  }
}

/**
 * Update financial account balance in database
 */
export async function updateFinancialAccountBalance(
  accountId: string,
  newBalance: number
) {
  try {
    const supabase = createServiceClient()

    const { error } = await supabase
      .from('stripe_financial_accounts')
      .update({
        balance: newBalance,
        updated_at: new Date(),
      })
      .eq('id', accountId)

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
    }
  } catch (error) {
    const err = error as { message?: string }
    return {
      success: false,
      error: err.message || 'Failed to update balance',
    }
  }
}
