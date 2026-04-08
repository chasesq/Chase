'use server'

import {
  createFinancialAccount,
  saveFinancialAccountToDb,
  getUserFinancialAccounts,
  getFinancialAccountFromDb,
  addTestCredit,
} from '@/lib/stripe/financial-accounts'
import {
  createPayoutRecipient,
  listPayoutRecipients,
  createOutboundTransfer,
  listUserPayouts,
  deletePayoutRecipient,
} from '@/lib/stripe/payouts'
import { createServiceClient } from '@/lib/supabase/server'

/**
 * Create a new financial account
 */
export async function initializeFinancialAccount(
  accountName: string,
  userId: string | null = null,
  currency: string = 'usd'
) {
  try {
    // Create in Stripe
    const stripeResult = await createFinancialAccount(accountName, currency)

    if (!stripeResult.success) {
      return { success: false, error: stripeResult.error }
    }

    // Save to database
    const dbResult = await saveFinancialAccountToDb(
      userId,
      stripeResult.accountId,
      accountName,
      currency
    )

    if (!dbResult.success) {
      return { success: false, error: dbResult.error }
    }

    return {
      success: true,
      accountId: dbResult.id,
      stripeAccountId: stripeResult.accountId,
      name: accountName,
    }
  } catch (error) {
    const err = error as { message?: string }
    return { success: false, error: err.message || 'Failed to create financial account' }
  }
}

/**
 * Add test credit to financial account
 */
export async function addFundsToAccount(
  financialAccountId: string,
  stripeFinancialAccountId: string,
  amount: number,
  description?: string
) {
  try {
    const result = await addTestCredit(
      stripeFinancialAccountId,
      amount,
      'usd',
      description || `Deposit of $${amount.toFixed(2)}`
    )

    if (!result.success) {
      return { success: false, error: result.error }
    }

    return {
      success: true,
      creditId: result.creditId,
      amount: result.amount,
    }
  } catch (error) {
    const err = error as { message?: string }
    return { success: false, error: err.message || 'Failed to add funds' }
  }
}

/**
 * Get user's financial accounts
 */
export async function fetchUserFinancialAccounts(userId: string) {
  try {
    const result = await getUserFinancialAccounts(userId)

    if (!result.success) {
      return { success: false, error: result.error }
    }

    return {
      success: true,
      accounts: result.accounts,
    }
  } catch (error) {
    const err = error as { message?: string }
    return { success: false, error: err.message || 'Failed to fetch accounts' }
  }
}

/**
 * Add a payout recipient (bank account)
 */
export async function registerPayoutRecipient(
  userId: string,
  recipientName: string,
  accountHolderName: string,
  routingNumber: string,
  accountNumber: string,
  accountType: 'individual' | 'business' = 'individual'
) {
  try {
    const result = await createPayoutRecipient(
      userId,
      recipientName,
      accountHolderName,
      routingNumber,
      accountNumber,
      accountType
    )

    if (!result.success) {
      return { success: false, error: result.error }
    }

    return {
      success: true,
      recipientId: result.recipientId,
      accountNumberMasked: result.accountNumberMasked,
    }
  } catch (error) {
    const err = error as { message?: string }
    return { success: false, error: err.message || 'Failed to register recipient' }
  }
}

/**
 * Get user's payout recipients
 */
export async function fetchPayoutRecipients(userId: string) {
  try {
    const result = await listPayoutRecipients(userId)

    if (!result.success) {
      return { success: false, error: result.error }
    }

    return {
      success: true,
      recipients: result.recipients,
    }
  } catch (error) {
    const err = error as { message?: string }
    return { success: false, error: err.message || 'Failed to fetch recipients' }
  }
}

/**
 * Process a payout
 */
export async function processPayout(
  userId: string,
  financialAccountId: string,
  recipientTokenId: string,
  amount: number,
  description?: string
) {
  try {
    // Get financial account
    const accountResult = await getFinancialAccountFromDb(financialAccountId)
    if (!accountResult.success) {
      return { success: false, error: 'Financial account not found' }
    }

    const stripeAccountId = accountResult.account.stripe_account_id

    // Create transfer
    const result = await createOutboundTransfer(
      financialAccountId,
      stripeAccountId,
      recipientTokenId,
      amount,
      'usd',
      description || `Payout of $${amount.toFixed(2)}`
    )

    if (!result.success) {
      return { success: false, error: result.error }
    }

    // Update in database with user_id and recipient_id
    const supabase = createServiceClient()
    await supabase
      .from('stripe_payouts')
      .update({ user_id: userId })
      .eq('id', result.payoutId)

    return {
      success: true,
      payoutId: result.payoutId,
      status: result.status,
    }
  } catch (error) {
    const err = error as { message?: string }
    return { success: false, error: err.message || 'Failed to process payout' }
  }
}

/**
 * Get user's payout history
 */
export async function fetchPayoutHistory(userId: string, limit: number = 10) {
  try {
    const result = await listUserPayouts(userId, limit)

    if (!result.success) {
      return { success: false, error: result.error }
    }

    return {
      success: true,
      payouts: result.payouts,
    }
  } catch (error) {
    const err = error as { message?: string }
    return { success: false, error: err.message || 'Failed to fetch payout history' }
  }
}

/**
 * Remove a payout recipient
 */
export async function removePayoutRecipient(recipientId: string) {
  try {
    const result = await deletePayoutRecipient(recipientId)

    if (!result.success) {
      return { success: false, error: result.error }
    }

    return { success: true }
  } catch (error) {
    const err = error as { message?: string }
    return { success: false, error: err.message || 'Failed to remove recipient' }
  }
}
