import 'server-only'

import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

/**
 * Create a connected account for express onboarding
 */
export async function createConnectedAccount(
  userId: string,
  email: string,
  accountType: 'express' | 'standard' | 'custom' = 'express',
  platformFeePercent: number = 0
) {
  const supabase = createServiceClient()

  try {
    console.log('[v0] Creating Stripe connected account for user:', userId)

    // Create Stripe connected account
    const account = await stripe.accounts.create({
      type: accountType,
      email: email,
      country: 'US',
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      metadata: {
        user_id: userId,
      },
    })

    console.log('[v0] Stripe account created:', account.id)

    // Store in database
    const { data: connectedAccount, error } = await supabase
      .from('stripe_connected_accounts')
      .insert({
        user_id: userId,
        stripe_account_id: account.id,
        account_type: accountType,
        account_email: email,
        platform_fee_percent: platformFeePercent,
        verification_status: 'unverified',
        stripe_response: account,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to store connected account: ${error.message}`)
    }

    return {
      connectedAccountId: connectedAccount.id,
      stripeAccountId: account.id,
      status: 'created',
    }
  } catch (error: any) {
    console.error('[v0] Error creating connected account:', error)
    throw error
  }
}

/**
 * Get express onboarding link
 */
export async function getExpressOnboardingLink(
  connectedAccountId: string,
  refreshUrl: string,
  returnUrl: string
) {
  const supabase = createServiceClient()

  try {
    // Get the connected account
    const { data: connectedAccount } = await supabase
      .from('stripe_connected_accounts')
      .select('*')
      .eq('id', connectedAccountId)
      .single()

    if (!connectedAccount) {
      throw new Error('Connected account not found')
    }

    // Create onboarding link
    const link = await stripe.accountLinks.create({
      account: connectedAccount.stripe_account_id,
      type: 'account_onboarding',
      refresh_url: refreshUrl,
      return_url: returnUrl,
    })

    console.log('[v0] Express onboarding link created:', link.url)

    return {
      url: link.url,
      expiresAt: new Date((link.expires_at || 0) * 1000).toISOString(),
    }
  } catch (error: any) {
    console.error('[v0] Error creating onboarding link:', error)
    throw error
  }
}

/**
 * Update connected account settings
 */
export async function updateConnectedAccount(
  connectedAccountId: string,
  updates: {
    platformFeePercent?: number
    platformFeeFixed?: number
    payoutSchedule?: string
    businessName?: string
    supportEmail?: string
    supportPhone?: string
  }
) {
  const supabase = createServiceClient()

  try {
    // Get the connected account
    const { data: connectedAccount } = await supabase
      .from('stripe_connected_accounts')
      .select('*')
      .eq('id', connectedAccountId)
      .single()

    if (!connectedAccount) {
      throw new Error('Connected account not found')
    }

    // Update Stripe account settings
    const updateData: any = {}

    if (updates.businessName) {
      updateData.business_profile = {
        name: updates.businessName,
      }
    }

    if (updates.supportEmail || updates.supportPhone) {
      updateData.support = {
        ...(updates.supportEmail && { email: updates.supportEmail }),
        ...(updates.supportPhone && { phone: updates.supportPhone }),
      }
    }

    if (Object.keys(updateData).length > 0) {
      await stripe.accounts.update(connectedAccount.stripe_account_id, updateData)
    }

    // Update database
    const { data: updated, error } = await supabase
      .from('stripe_connected_accounts')
      .update({
        ...(updates.platformFeePercent !== undefined && {
          platform_fee_percent: updates.platformFeePercent,
        }),
        ...(updates.platformFeeFixed !== undefined && {
          platform_fee_fixed_cents: updates.platformFeeFixed,
        }),
        ...(updates.payoutSchedule && {
          payout_schedule: updates.payoutSchedule,
        }),
        ...(updates.businessName && {
          business_name: updates.businessName,
        }),
        ...(updates.supportEmail && {
          support_email: updates.supportEmail,
        }),
        ...(updates.supportPhone && {
          support_phone: updates.supportPhone,
        }),
      })
      .eq('id', connectedAccountId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update connected account: ${error.message}`)
    }

    return updated
  } catch (error: any) {
    console.error('[v0] Error updating connected account:', error)
    throw error
  }
}

/**
 * Get connected account details
 */
export async function getConnectedAccount(connectedAccountId: string) {
  const supabase = createServiceClient()

  try {
    const { data: connectedAccount } = await supabase
      .from('stripe_connected_accounts')
      .select('*')
      .eq('id', connectedAccountId)
      .single()

    if (!connectedAccount) {
      throw new Error('Connected account not found')
    }

    // Fetch latest details from Stripe
    const stripeAccount = await stripe.accounts.retrieve(
      connectedAccount.stripe_account_id
    )

    // Update verification status
    const verificationStatus = stripeAccount.requirements?.currently_due?.length
      ? 'pending'
      : 'verified'

    if (verificationStatus !== connectedAccount.verification_status) {
      await supabase
        .from('stripe_connected_accounts')
        .update({
          verification_status: verificationStatus,
          charges_enabled: stripeAccount.charges_enabled,
          payouts_enabled: stripeAccount.payouts_enabled,
          capabilities: stripeAccount.capabilities,
        })
        .eq('id', connectedAccountId)
    }

    return {
      ...connectedAccount,
      stripeDetails: {
        chargesEnabled: stripeAccount.charges_enabled,
        payoutsEnabled: stripeAccount.payouts_enabled,
        requirementsCurrentlyDue: stripeAccount.requirements?.currently_due || [],
        requirementsEventuallyDue: stripeAccount.requirements?.eventually_due || [],
        capabilities: stripeAccount.capabilities,
      },
    }
  } catch (error: any) {
    console.error('[v0] Error getting connected account:', error)
    throw error
  }
}

/**
 * List all connected accounts for a user
 */
export async function listUserConnectedAccounts(userId: string) {
  const supabase = createServiceClient()

  try {
    const { data: accounts, error } = await supabase
      .from('stripe_connected_accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('active', true)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch connected accounts: ${error.message}`)
    }

    return accounts || []
  } catch (error: any) {
    console.error('[v0] Error listing connected accounts:', error)
    throw error
  }
}

/**
 * Deactivate a connected account
 */
export async function deactivateConnectedAccount(connectedAccountId: string) {
  const supabase = createServiceClient()

  try {
    const { data, error } = await supabase
      .from('stripe_connected_accounts')
      .update({
        active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', connectedAccountId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to deactivate connected account: ${error.message}`)
    }

    return data
  } catch (error: any) {
    console.error('[v0] Error deactivating connected account:', error)
    throw error
  }
}

/**
 * Get platform fees for a connected account
 */
export async function getPlatformFees(connectedAccountId: string, days: number = 30) {
  const supabase = createServiceClient()

  try {
    // Get connected account
    const { data: connectedAccount } = await supabase
      .from('stripe_connected_accounts')
      .select('*')
      .eq('id', connectedAccountId)
      .single()

    if (!connectedAccount) {
      throw new Error('Connected account not found')
    }

    // Get payments for this account from the past N days
    const { data: payments } = await supabase
      .from('stripe_payment_records')
      .select('*')
      .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .filter('metadata', 'ilike', `%${connectedAccount.stripe_account_id}%`)

    // Calculate fees
    const totalAmount = (payments || []).reduce((sum, p) => sum + p.amount_cents, 0)
    const percentFee = Math.round(totalAmount * (connectedAccount.platform_fee_percent / 100))
    const fixedFee = (payments || []).length * connectedAccount.platform_fee_fixed_cents

    return {
      totalAmount: totalAmount / 100,
      percentFee: percentFee / 100,
      fixedFee: fixedFee / 100,
      totalFees: (percentFee + fixedFee) / 100,
      paymentCount: payments?.length || 0,
      period: `Last ${days} days`,
    }
  } catch (error: any) {
    console.error('[v0] Error calculating platform fees:', error)
    throw error
  }
}

/**
 * Transfer funds to a connected account with platform fees
 */
export async function transferFundsToConnectedAccount(
  connectedAccountId: string,
  amountCents: number,
  description?: string
) {
  const supabase = createServiceClient()

  try {
    // Get connected account
    const { data: connectedAccount } = await supabase
      .from('stripe_connected_accounts')
      .select('*')
      .eq('id', connectedAccountId)
      .single()

    if (!connectedAccount) {
      throw new Error('Connected account not found')
    }

    if (!connectedAccount.payouts_enabled) {
      throw new Error('Payouts are not enabled for this account')
    }

    // Calculate platform fees
    const platformFeeCents = Math.round(
      amountCents * (connectedAccount.platform_fee_percent / 100)
    ) + connectedAccount.platform_fee_fixed_cents

    const transferAmount = amountCents - platformFeeCents

    // Create transfer
    const transfer = await stripe.transfers.create({
      amount: transferAmount,
      currency: 'usd',
      destination: connectedAccount.stripe_account_id,
      description: description || `Platform transfer with ${connectedAccount.platform_fee_percent}% fee`,
      metadata: {
        platform_fee_cents: platformFeeCents,
        original_amount_cents: amountCents,
      },
    })

    console.log('[v0] Transfer created:', transfer.id)

    return {
      transferId: transfer.id,
      originalAmount: amountCents / 100,
      platformFee: platformFeeCents / 100,
      transferAmount: transferAmount / 100,
      status: transfer.status,
    }
  } catch (error: any) {
    console.error('[v0] Error transferring funds:', error)
    throw error
  }
}
