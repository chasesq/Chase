import 'server-only'

import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

/**
 * Stripe Event Types we handle
 */
export type StripeEventType =
  | 'payment_intent.succeeded'
  | 'payment_intent.payment_failed'
  | 'charge.refunded'
  | 'charge.dispute.created'
  | 'account.updated'
  | 'customer.subscription.updated'
  | 'customer.subscription.deleted'

/**
 * Process incoming webhook event from Stripe
 */
export async function processStripeWebhookEvent(
  event: Stripe.Event
): Promise<{
  success: boolean
  eventId: string
  processed: boolean
  error?: string
}> {
  const supabase = createServiceClient()

  try {
    console.log('[v0] Processing Stripe event:', event.id, event.type)

    // Check if event already processed (idempotency)
    const { data: existingEvent } = await supabase
      .from('stripe_events')
      .select('id, processed')
      .eq('event_id', event.id)
      .single()

    if (existingEvent?.processed) {
      console.log('[v0] Event already processed:', event.id)
      return {
        success: true,
        eventId: event.id,
        processed: true,
      }
    }

    // Store the event first
    const { data: storedEvent, error: storeError } = await supabase
      .from('stripe_events')
      .insert({
        event_id: event.id,
        event_type: event.type,
        event_timestamp: new Date(event.created * 1000).toISOString(),
        stripe_object: event.data.object,
        processed: false,
      })
      .select()
      .single()

    if (storeError) {
      console.error('[v0] Error storing event:', storeError)
      return {
        success: false,
        eventId: event.id,
        processed: false,
        error: storeError.message,
      }
    }

    // Route to appropriate handler
    let handlerResult: any
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          handlerResult = await handlePaymentIntentSucceeded(
            event.data.object as Stripe.PaymentIntent,
            storedEvent.id
          )
          break

        case 'payment_intent.payment_failed':
          handlerResult = await handlePaymentIntentFailed(
            event.data.object as Stripe.PaymentIntent,
            storedEvent.id
          )
          break

        case 'charge.refunded':
          handlerResult = await handleChargeRefunded(
            event.data.object as Stripe.Charge,
            storedEvent.id
          )
          break

        case 'charge.dispute.created':
          handlerResult = await handleDisputeCreated(
            event.data.object as Stripe.Dispute,
            storedEvent.id
          )
          break

        case 'account.updated':
          handlerResult = await handleAccountUpdated(
            event.data.object as Stripe.Account,
            storedEvent.id
          )
          break

        default:
          console.log('[v0] Unhandled event type:', event.type)
          handlerResult = { success: true }
      }
    } catch (handlerError: any) {
      console.error('[v0] Event handler error:', handlerError)
      // Update event with error
      await supabase
        .from('stripe_events')
        .update({
          error_message: handlerError.message,
          retry_count: existingEvent?.processed ? 0 : 1,
        })
        .eq('id', storedEvent.id)

      return {
        success: false,
        eventId: event.id,
        processed: false,
        error: handlerError.message,
      }
    }

    // Mark event as processed
    await supabase
      .from('stripe_events')
      .update({
        processed: true,
        processed_at: new Date().toISOString(),
        error_message: null,
      })
      .eq('id', storedEvent.id)

    return {
      success: true,
      eventId: event.id,
      processed: true,
    }
  } catch (error: any) {
    console.error('[v0] Webhook processing error:', error)
    return {
      success: false,
      eventId: event.id,
      processed: false,
      error: error.message,
    }
  }
}

/**
 * Handle payment_intent.succeeded event
 */
async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent,
  eventId: string
): Promise<any> {
  const supabase = createServiceClient()

  console.log('[v0] Payment succeeded:', paymentIntent.id)

  // Get the charge details
  const chargeId = paymentIntent.latest_charge
  if (!chargeId) {
    throw new Error('No charge found for payment intent')
  }

  // Retrieve charge for payment method details
  const charge = await stripe.charges.retrieve(chargeId as string)

  // Extract user and account from metadata
  const userId = paymentIntent.metadata?.accountId || paymentIntent.metadata?.user_id
  const accountId = paymentIntent.metadata?.accountId
  if (!userId) {
    console.warn('[v0] No user ID in payment intent metadata')
  }

  // Store payment record
  const { data: paymentRecord, error: insertError } = await supabase
    .from('stripe_payment_records')
    .insert({
      user_id: userId,
      account_id: accountId,
      payment_intent_id: paymentIntent.id,
      stripe_charge_id: charge.id,
      amount_cents: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: 'succeeded',
      payment_method: charge.payment_method_details?.type || 'unknown',
      payment_method_details: charge.payment_method_details || {},
      customer_email: charge.receipt_email,
      stripe_event_id: eventId,
      reconciliation_status: 'pending',
      stripe_response: {
        payment_intent: paymentIntent,
        charge: charge,
      },
    })
    .select()
    .single()

  if (insertError) {
    throw new Error(`Failed to store payment record: ${insertError.message}`)
  }

  // Trigger notification
  if (accountId) {
    await triggerPaymentNotification(paymentRecord.id, 'payment_succeeded', {
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency.toUpperCase(),
      paymentMethod: charge.payment_method_details?.type,
    })
  }

  return { success: true, paymentRecordId: paymentRecord.id }
}

/**
 * Handle payment_intent.payment_failed event
 */
async function handlePaymentIntentFailed(
  paymentIntent: Stripe.PaymentIntent,
  eventId: string
): Promise<any> {
  const supabase = createServiceClient()

  console.log('[v0] Payment failed:', paymentIntent.id)

  const userId = paymentIntent.metadata?.accountId || paymentIntent.metadata?.user_id
  const accountId = paymentIntent.metadata?.accountId

  // Store failed payment record
  const { data: paymentRecord, error: insertError } = await supabase
    .from('stripe_payment_records')
    .insert({
      user_id: userId,
      account_id: accountId,
      payment_intent_id: paymentIntent.id,
      amount_cents: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: 'failed',
      payment_method: 'unknown',
      failure_code: paymentIntent.last_payment_error?.code,
      failure_message: paymentIntent.last_payment_error?.message,
      stripe_event_id: eventId,
      reconciliation_status: 'pending',
    })
    .select()
    .single()

  if (insertError) {
    throw new Error(`Failed to store payment record: ${insertError.message}`)
  }

  // Trigger failure notification
  if (accountId) {
    await triggerPaymentNotification(paymentRecord.id, 'payment_failed', {
      failureCode: paymentIntent.last_payment_error?.code,
      failureMessage: paymentIntent.last_payment_error?.message,
    })
  }

  return { success: true, paymentRecordId: paymentRecord.id }
}

/**
 * Handle charge.refunded event
 */
async function handleChargeRefunded(
  charge: Stripe.Charge,
  eventId: string
): Promise<any> {
  const supabase = createServiceClient()

  console.log('[v0] Charge refunded:', charge.id)

  // Find the payment record
  const { data: paymentRecord } = await supabase
    .from('stripe_payment_records')
    .select('*')
    .eq('stripe_charge_id', charge.id)
    .single()

  if (!paymentRecord) {
    console.warn('[v0] No payment record found for refunded charge:', charge.id)
    return { success: false, error: 'Payment record not found' }
  }

  // Update payment record with refund info
  const { error: updateError } = await supabase
    .from('stripe_payment_records')
    .update({
      status: 'refunded',
      refund_amount_cents: charge.refunded,
      refund_status: charge.refunded === charge.amount ? 'full' : 'partial',
      reconciliation_status: 'pending',
    })
    .eq('id', paymentRecord.id)

  if (updateError) {
    throw new Error(`Failed to update payment record: ${updateError.message}`)
  }

  // Trigger refund notification
  await triggerPaymentNotification(paymentRecord.id, 'payment_refunded', {
    refundAmount: charge.refunded / 100,
    originalAmount: charge.amount / 100,
    currency: charge.currency.toUpperCase(),
  })

  return { success: true, paymentRecordId: paymentRecord.id }
}

/**
 * Handle charge.dispute.created event
 */
async function handleDisputeCreated(
  dispute: Stripe.Dispute,
  eventId: string
): Promise<any> {
  const supabase = createServiceClient()

  console.log('[v0] Dispute created:', dispute.id)

  // Find the payment record
  const { data: paymentRecord } = await supabase
    .from('stripe_payment_records')
    .select('*')
    .eq('stripe_charge_id', dispute.charge)
    .single()

  if (!paymentRecord) {
    console.warn('[v0] No payment record found for disputed charge')
    return { success: false, error: 'Payment record not found' }
  }

  // Update payment record with dispute info
  const { error: updateError } = await supabase
    .from('stripe_payment_records')
    .update({
      status: 'disputed',
      metadata: {
        dispute_id: dispute.id,
        dispute_reason: dispute.reason,
        dispute_evidence_due_by: dispute.evidence_due_by,
      },
    })
    .eq('id', paymentRecord.id)

  if (updateError) {
    throw new Error(`Failed to update payment record: ${updateError.message}`)
  }

  // Trigger dispute notification
  await triggerPaymentNotification(paymentRecord.id, 'payment_disputed', {
    disputeId: dispute.id,
    reason: dispute.reason,
  })

  return { success: true, paymentRecordId: paymentRecord.id }
}

/**
 * Handle account.updated event (for connected accounts)
 */
async function handleAccountUpdated(
  account: Stripe.Account,
  eventId: string
): Promise<any> {
  const supabase = createServiceClient()

  console.log('[v0] Stripe account updated:', account.id)

  // Find the connected account record
  const { data: connectedAccount } = await supabase
    .from('stripe_connected_accounts')
    .select('*')
    .eq('stripe_account_id', account.id)
    .single()

  if (!connectedAccount) {
    console.warn('[v0] No connected account found:', account.id)
    return { success: false, error: 'Connected account not found' }
  }

  // Update connected account status
  const { error: updateError } = await supabase
    .from('stripe_connected_accounts')
    .update({
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      capabilities: account.capabilities,
      restrictions: account.requirements?.pending_verification || [],
      verification_status: account.requirements?.currently_due?.length
        ? 'pending'
        : 'verified',
      updated_at: new Date().toISOString(),
    })
    .eq('id', connectedAccount.id)

  if (updateError) {
    throw new Error(`Failed to update connected account: ${updateError.message}`)
  }

  // Trigger account notification
  if (connectedAccount.user_id) {
    await triggerAccountNotification(connectedAccount.user_id, 'account_updated', {
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
    })
  }

  return { success: true, connectedAccountId: connectedAccount.id }
}

/**
 * Trigger payment notification
 */
async function triggerPaymentNotification(
  paymentRecordId: string,
  notificationType: string,
  details: any
): Promise<void> {
  const supabase = createServiceClient()

  // Get payment record with user info
  const { data: paymentRecord } = await supabase
    .from('stripe_payment_records')
    .select('user_id, account_id, amount_cents, currency')
    .eq('id', paymentRecordId)
    .single()

  if (!paymentRecord?.user_id) return

  // Create notification message
  let title = ''
  let message = ''

  if (notificationType === 'payment_succeeded') {
    title = 'Payment Successful'
    message = `${details.amount.toFixed(2)} ${details.currency} has been added to your account`
  } else if (notificationType === 'payment_failed') {
    title = 'Payment Failed'
    message = details.failureMessage || 'Your payment could not be processed'
  } else if (notificationType === 'payment_refunded') {
    title = 'Refund Processed'
    message = `${details.refundAmount.toFixed(2)} ${details.currency} has been refunded`
  } else if (notificationType === 'payment_disputed') {
    title = 'Payment Disputed'
    message = `A dispute has been filed for your payment (ID: ${details.disputeId})`
  }

  // Store notification in notifications table
  await supabase.from('notifications').insert({
    user_id: paymentRecord.user_id,
    title,
    message,
    type: notificationType,
    category: 'payments',
  })
}

/**
 * Trigger account notification for connected accounts
 */
async function triggerAccountNotification(
  userId: string,
  notificationType: string,
  details: any
): Promise<void> {
  const supabase = createServiceClient()

  let title = 'Account Updated'
  let message = 'Your Stripe account status has been updated'

  if (!details.chargesEnabled || !details.payoutsEnabled) {
    title = 'Account Status Alert'
    message = 'Your account capabilities have changed'
  }

  await supabase.from('notifications').insert({
    user_id: userId,
    title,
    message,
    type: notificationType,
    category: 'account',
  })
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  body: string,
  signature: string,
  endpointSecret: string
): Stripe.Event | null {
  try {
    const event = stripe.webhooks.constructEvent(body, signature, endpointSecret)
    return event
  } catch (error: any) {
    console.error('[v0] Webhook signature verification failed:', error.message)
    return null
  }
}
