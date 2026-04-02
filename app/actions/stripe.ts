'use server'

import { stripe } from '@/lib/stripe'
import { PRODUCTS } from '@/lib/products'

/**
 * Start a checkout session with support for multiple payment methods
 * @param productId - The product ID to checkout
 * @param accountId - Optional account ID for metadata
 * @param paymentMethod - Type of payment method to use (default: all)
 */
export async function startCheckoutSession(
  productId: string,
  accountId?: string,
  paymentMethod: 'card' | 'express' | 'all' = 'all'
) {
  const product = PRODUCTS.find((p) => p.id === productId)
  if (!product) {
    throw new Error(`Product with id "${productId}" not found`)
  }

  // Configure allowed payment methods based on request
  const paymentMethodTypes = getPaymentMethodTypes(paymentMethod)

  // Create Checkout Sessions with enhanced payment method support
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
    payment_method_types: paymentMethodTypes,
    metadata: {
      productId: product.id,
      accountId: accountId || '',
      amountInCents: product.priceInCents.toString(),
    },
    // Enable all express checkout methods (Apple Pay, Google Pay, PayPal, Amazon Pay, Link)
    automatic_payment_methods: {
      enabled: true,
      allow_redirects: 'always',
    },
  })

  return session.client_secret
}

/**
 * Get payment method types based on request
 */
function getPaymentMethodTypes(paymentMethod: string): string[] {
  switch (paymentMethod) {
    case 'card':
      return ['card']
    case 'express':
      return ['apple_pay', 'google_pay', 'paypal', 'amazon_pay']
    case 'all':
    default:
      return ['card', 'apple_pay', 'google_pay', 'paypal', 'amazon_pay', 'link']
  }
}

/**
 * Create a payment intent for direct payment confirmation
 * Used for Payment Element or Express Checkout Element
 */
export async function createPaymentIntent(
  productId: string,
  accountId?: string,
  paymentMethod: 'card' | 'express' | 'all' = 'all'
) {
  const product = PRODUCTS.find((p) => p.id === productId)
  if (!product) {
    throw new Error(`Product with id "${productId}" not found`)
  }

  const paymentMethodTypes = getPaymentMethodTypes(paymentMethod)

  const paymentIntent = await stripe.paymentIntents.create({
    amount: product.priceInCents,
    currency: 'usd',
    automatic_payment_methods: {
      enabled: true,
      allow_redirects: 'always',
    },
    payment_method_types: paymentMethodTypes,
    metadata: {
      productId: product.id,
      accountId: accountId || '',
      amountInCents: product.priceInCents.toString(),
    },
  })

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  }
}

export async function getSessionStatus(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId)
  
  return {
    status: session.status,
    paymentStatus: session.payment_status,
    customerEmail: session.customer_details?.email,
    amountTotal: session.amount_total,
    metadata: session.metadata,
    paymentMethodTypes: session.payment_method_types,
  }
}

// Decline error messages mapping with express payment method info
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
  'apple_pay_error': 'Apple Pay payment failed. Please try a different payment method.',
  'google_pay_error': 'Google Pay payment failed. Please try a different payment method.',
  'paypal_error': 'PayPal payment failed. Please check your PayPal account or try another method.',
  'amazon_pay_error': 'Amazon Pay payment failed. Please check your Amazon account or try another method.',
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
    paymentMethod: payment.payment_method_types?.[0] || 'unknown',
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

/**
 * Retrieve payment intent details including payment method
 */
export async function getPaymentIntentDetails(paymentIntentId: string) {
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

  return {
    id: paymentIntent.id,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    status: paymentIntent.status,
    paymentMethodTypes: paymentIntent.payment_method_types,
    charges: paymentIntent.charges.data.map(charge => ({
      id: charge.id,
      amount: charge.amount,
      status: charge.status,
      paymentMethod: charge.payment_method_details,
      receiptEmail: charge.receipt_email,
    })),
    metadata: paymentIntent.metadata,
  }
}

