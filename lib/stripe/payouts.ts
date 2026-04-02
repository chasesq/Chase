'use server'

import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/server'

/**
 * Create a payout recipient (bank account)
 * Returns a stripe token for the bank account to be used in payouts
 */
export async function createPayoutRecipient(
  userId: string,
  recipientName: string,
  accountHolderName: string,
  routingNumber: string,
  accountNumber: string,
  accountType: 'individual' | 'business' = 'individual'
) {
  try {
    // Create a bank account token using Stripe API
    // Note: In production, use Stripe's tokenization to avoid PCI compliance issues
    const bankToken = await stripe.tokens.create({
      bank_account: {
        country: 'US',
        currency: 'usd',
        account_holder_name: accountHolderName,
        account_holder_type: accountType,
        routing_number: routingNumber,
        account_number: accountNumber,
      },
    })

    // Save to database
    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('stripe_payout_recipients')
      .insert({
        user_id: userId,
        recipient_name: recipientName,
        account_type: accountType,
        account_holder_name: accountHolderName,
        routing_number: routingNumber,
        account_number: accountNumber,
        account_number_masked: accountNumber.slice(-4),
        stripe_token_id: bankToken.id,
        verified: true, // In production, implement proper verification
        verification_status: 'verified',
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
      recipientId: data.id,
      tokenId: bankToken.id,
      accountNumberMasked: data.account_number_masked,
    }
  } catch (error) {
    const stripeError = error as { message?: string; code?: string }
    console.error('[v0] Payout recipient creation error:', stripeError)
    return {
      success: false,
      error: stripeError.message || 'Failed to create payout recipient',
      code: stripeError.code,
    }
  }
}

/**
 * Get payout recipient details
 */
export async function getPayoutRecipient(recipientId: string) {
  try {
    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('stripe_payout_recipients')
      .select('*')
      .eq('id', recipientId)
      .single()

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
      recipient: data,
    }
  } catch (error) {
    const err = error as { message?: string }
    return {
      success: false,
      error: err.message || 'Failed to retrieve recipient',
    }
  }
}

/**
 * List user's payout recipients
 */
export async function listPayoutRecipients(userId: string) {
  try {
    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('stripe_payout_recipients')
      .select('*')
      .eq('user_id', userId)
      .eq('verified', true)
      .order('created_at', { ascending: false })

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
      recipients: data || [],
    }
  } catch (error) {
    const err = error as { message?: string }
    return {
      success: false,
      error: err.message || 'Failed to list recipients',
    }
  }
}

/**
 * Delete a payout recipient
 */
export async function deletePayoutRecipient(recipientId: string) {
  try {
    const supabase = createServiceClient()

    const { error } = await supabase
      .from('stripe_payout_recipients')
      .delete()
      .eq('id', recipientId)

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
      error: err.message || 'Failed to delete recipient',
    }
  }
}

/**
 * Create an outbound transfer (payout) from a financial account
 */
export async function createOutboundTransfer(
  financialAccountId: string,
  stripeFinancialAccountId: string,
  recipientTokenId: string,
  amount: number,
  currency: string = 'usd',
  description?: string
) {
  try {
    // Create outbound transfer using Stripe Treasury API
    const outboundTransfer = await stripe.treasury.outboundTransfers.create({
      financial_account: stripeFinancialAccountId,
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      destination_payment_method: recipientTokenId,
      description: description || `Payout to recipient`,
    })

    // Save to database
    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('stripe_payouts')
      .insert({
        financial_account_id: financialAccountId,
        user_id: null, // Will be updated by trigger or later
        recipient_id: null, // Will be linked separately
        amount,
        currency: currency.toLowerCase(),
        status: 'processing',
        stripe_outbound_transfer_id: outboundTransfer.id,
        description: description,
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
      payoutId: data.id,
      transferId: outboundTransfer.id,
      status: outboundTransfer.status,
      estimatedArrival: outboundTransfer.expected_arrival_date,
    }
  } catch (error) {
    const stripeError = error as { message?: string; code?: string }
    console.error('[v0] Outbound transfer creation error:', stripeError)
    return {
      success: false,
      error: stripeError.message || 'Failed to create transfer',
      code: stripeError.code,
    }
  }
}

/**
 * Get outbound transfer details
 */
export async function getOutboundTransfer(
  financialAccountId: string,
  transferId: string
) {
  try {
    const transfer = await stripe.treasury.outboundTransfers.retrieve(
      transferId,
      {
        financial_account: financialAccountId,
      }
    )

    return {
      success: true,
      transfer: {
        id: transfer.id,
        amount: transfer.amount,
        currency: transfer.currency,
        status: transfer.status,
        expectedArrivalDate: transfer.expected_arrival_date,
        created: transfer.created,
      },
    }
  } catch (error) {
    const stripeError = error as { message?: string }
    return {
      success: false,
      error: stripeError.message || 'Failed to retrieve transfer',
    }
  }
}

/**
 * List outbound transfers for a financial account
 */
export async function listOutboundTransfers(
  financialAccountId: string,
  limit: number = 10
) {
  try {
    const transfers = await stripe.treasury.outboundTransfers.list({
      financial_account: financialAccountId,
      limit,
    })

    return {
      success: true,
      transfers: transfers.data.map(transfer => ({
        id: transfer.id,
        amount: transfer.amount,
        currency: transfer.currency,
        status: transfer.status,
        expectedArrivalDate: transfer.expected_arrival_date,
        created: transfer.created,
      })),
    }
  } catch (error) {
    const stripeError = error as { message?: string }
    return {
      success: false,
      error: stripeError.message || 'Failed to list transfers',
    }
  }
}

/**
 * Get payout details from database
 */
export async function getPayoutFromDb(payoutId: string) {
  try {
    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('stripe_payouts')
      .select(
        `
        *,
        recipient:stripe_payout_recipients(*),
        account:stripe_financial_accounts(*)
      `
      )
      .eq('id', payoutId)
      .single()

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
      payout: data,
    }
  } catch (error) {
    const err = error as { message?: string }
    return {
      success: false,
      error: err.message || 'Failed to retrieve payout',
    }
  }
}

/**
 * List payouts for a financial account
 */
export async function listPayoutsForAccount(
  financialAccountId: string,
  limit: number = 10
) {
  try {
    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('stripe_payouts')
      .select('*')
      .eq('financial_account_id', financialAccountId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
      payouts: data || [],
    }
  } catch (error) {
    const err = error as { message?: string }
    return {
      success: false,
      error: err.message || 'Failed to list payouts',
    }
  }
}

/**
 * List user's payouts
 */
export async function listUserPayouts(userId: string, limit: number = 10) {
  try {
    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('stripe_payouts')
      .select(
        `
        *,
        recipient:stripe_payout_recipients(*),
        account:stripe_financial_accounts(*)
      `
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
      payouts: data || [],
    }
  } catch (error) {
    const err = error as { message?: string }
    return {
      success: false,
      error: err.message || 'Failed to list payouts',
    }
  }
}

/**
 * Update payout status in database
 */
export async function updatePayoutStatus(
  payoutId: string,
  status: string,
  estimatedArrival?: Date
) {
  try {
    const supabase = createServiceClient()

    const { error } = await supabase
      .from('stripe_payouts')
      .update({
        status,
        estimated_arrival: estimatedArrival,
        updated_at: new Date(),
      })
      .eq('id', payoutId)

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
      error: err.message || 'Failed to update payout',
    }
  }
}
