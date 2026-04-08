'use server'

import { stripe } from '@/lib/stripe'
import { PRODUCTS } from '@/lib/products'

export async function startCheckoutSession(productId: string, accountId?: string) {
  const product = PRODUCTS.find((p) => p.id === productId)
  if (!product) {
    throw new Error(`Product with id "${productId}" not found`)
  }

  // Create Checkout Sessions from body params.
  const session = await stripe.checkout.sessions.create({
    ui_mode: 'embedded',
    redirect_on_completion: 'never',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name,
            description: product.description,
          },
          unit_amount: product.priceInCents,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    metadata: {
      productId: product.id,
      accountId: accountId || '',
      amountInCents: product.priceInCents.toString(),
    },
  })

  return session.client_secret
}

export async function getSessionStatus(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId)
  
  return {
    status: session.status,
    paymentStatus: session.payment_status,
    customerEmail: session.customer_details?.email,
    amountTotal: session.amount_total,
    metadata: session.metadata,
  }
}

// Decline error messages mapping
const DECLINE_MESSAGES: Record<string, string> = {
  'card_declined': 'Your card was declined. Please try a different payment method.',
  'insufficient_funds': 'Insufficient funds. Please try a different card or add funds to your account.',
  'lost_card': 'This card has been reported lost. Please use a different card.',
  'stolen_card': 'This card has been reported stolen. Please use a different card.',
  'expired_card': 'Your card has expired. Please use a different card.',
  'incorrect_cvc': 'Incorrect security code. Please check and try again.',
  'processing_error': 'A processing error occurred. Please try again.',
  'incorrect_number': 'Invalid card number. Please check and try again.',
  'generic_decline': 'Your card was declined. Please contact your bank or try a different card.',
  'fraudulent': 'This transaction was flagged. Please contact your bank.',
  'do_not_honor': 'Your bank declined this transaction. Please contact them for details.',
  'authentication_required': 'Additional authentication required. Please complete verification.',
}

export async function getDeclineMessage(declineCode: string | null | undefined): Promise<string> {
  if (!declineCode) return 'Payment failed. Please try again.'
  return DECLINE_MESSAGES[declineCode] || 'Your payment could not be processed. Please try a different payment method.'
}

// Fetch Stripe balance for reconciliation
export async function getStripeBalance() {
  const balance = await stripe.balance.retrieve()
  
  return {
    available: balance.available.map(b => ({
      amount: b.amount,
      currency: b.currency,
    })),
    pending: balance.pending.map(b => ({
      amount: b.amount,
      currency: b.currency,
    })),
  }
}

// List recent payments for reconciliation
export async function listPayments(limit: number = 25) {
  const payments = await stripe.paymentIntents.list({
    limit,
  })
  
  return payments.data.map(payment => ({
    id: payment.id,
    amount: payment.amount,
    currency: payment.currency,
    status: payment.status,
    created: payment.created,
    description: payment.description,
    metadata: payment.metadata,
    chargeId: typeof payment.latest_charge === 'string' ? payment.latest_charge : payment.latest_charge?.id,
  }))
}

// List balance transactions for payout reconciliation
export async function listBalanceTransactions(limit: number = 25) {
  const transactions = await stripe.balanceTransactions.list({
    limit,
  })
  
  return transactions.data.map(txn => ({
    id: txn.id,
    amount: txn.amount,
    currency: txn.currency,
    type: txn.type,
    status: txn.status,
    created: txn.created,
    description: txn.description,
    fee: txn.fee,
    net: txn.net,
    source: typeof txn.source === 'string' ? txn.source : null,
  }))
}

// Create a refund for a payment
export async function createRefund(paymentIntentId: string, amount?: number, reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer') {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount, // If undefined, refunds the full amount
      reason: reason || 'requested_by_customer',
    })
    
    return {
      success: true,
      refund: {
        id: refund.id,
        amount: refund.amount,
        currency: refund.currency,
        status: refund.status,
        created: refund.created,
      },
    }
  } catch (error) {
    const stripeError = error as { message?: string; code?: string }
    return {
      success: false,
      error: stripeError.message || 'Failed to process refund',
      code: stripeError.code,
    }
  }
}

// List refunds
export async function listRefunds(limit: number = 25) {
  const refunds = await stripe.refunds.list({
    limit,
  })
  
  return refunds.data.map(refund => ({
    id: refund.id,
    amount: refund.amount,
    currency: refund.currency,
    status: refund.status,
    created: refund.created,
    reason: refund.reason,
    paymentIntentId: typeof refund.payment_intent === 'string' ? refund.payment_intent : refund.payment_intent?.id,
  }))
}
