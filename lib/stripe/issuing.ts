import Stripe from 'stripe'

let stripeInstance: Stripe | null = null

function getStripe(): Stripe {
  if (!stripeInstance) {
    const apiKey = process.env.STRIPE_SECRET_KEY
    if (!apiKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set')
    }
    stripeInstance = new Stripe(apiKey, {
      apiVersion: '2024-12-18',
    })
  }
  return stripeInstance
}

const stripe = new Proxy({} as Stripe, {
  get: (target, prop) => {
    return (getStripe() as any)[prop]
  },
})

/**
 * Stripe Issuing Utilities
 * Create and manage cardholders, issue virtual and physical cards, and handle lifecycle controls
 */

export interface CreateCardholder {
  type: 'individual' | 'company'
  firstName?: string
  lastName?: string
  companyName?: string
  email: string
  phone?: string
  dateOfBirth?: {
    day: number
    month: number
    year: number
  }
  address: {
    line1: string
    line2?: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  taxId?: string
}

export interface CardholderResponse {
  success: boolean
  cardholderId?: string
  stripeCardholderId?: string
  error?: string
}

export interface IssueCardParams {
  cardholderId: string
  cardType: 'virtual' | 'physical'
  spendingLimitAmount?: number
  spendingLimitInterval?: 'per_transaction' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all_time'
  requireActivation?: boolean
  shippingAddress?: {
    line1: string
    line2?: string
    city: string
    state: string
    postalCode: string
    country: string
  }
}

export interface CardResponse {
  success: boolean
  cardId?: string
  stripeCardId?: string
  last4?: string
  expMonth?: number
  expYear?: number
  error?: string
}

/**
 * Create a cardholder for issuing cards
 * Supports both individual and company types
 */
export async function createCardholder(
  params: CreateCardholder
): Promise<CardholderResponse> {
  try {
    console.log('[v0] Creating cardholder:', {
      type: params.type,
      email: params.email,
    })

    const cardholder =
      params.type === 'individual'
        ? await stripe.issuing.cardholders.create({
            type: 'individual',
            name: `${params.firstName} ${params.lastName}`.trim(),
            email: params.email,
            phone_number: params.phone,
            individual: {
              first_name: params.firstName,
              last_name: params.lastName,
              dob: params.dateOfBirth
                ? {
                    day: params.dateOfBirth.day,
                    month: params.dateOfBirth.month,
                    year: params.dateOfBirth.year,
                  }
                : undefined,
              address: {
                line1: params.address.line1,
                line2: params.address.line2,
                city: params.address.city,
                state: params.address.state,
                postal_code: params.address.postalCode,
                country: params.address.country,
              },
            },
          })
        : await stripe.issuing.cardholders.create({
            type: 'company',
            name: params.companyName!,
            email: params.email,
            phone_number: params.phone,
            company: {
              name: params.companyName,
              tax_id: params.taxId,
              address: {
                line1: params.address.line1,
                line2: params.address.line2,
                city: params.address.city,
                state: params.address.state,
                postal_code: params.address.postalCode,
                country: params.address.country,
              },
            },
          })

    console.log('[v0] Cardholder created:', cardholder.id)

    return {
      success: true,
      cardholderId: cardholder.id,
      stripeCardholderId: cardholder.id,
    }
  } catch (error) {
    console.error('[v0] Error creating cardholder:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create cardholder',
    }
  }
}

/**
 * Issue a virtual or physical card to a cardholder
 */
export async function issueCard(params: IssueCardParams): Promise<CardResponse> {
  try {
    console.log('[v0] Issuing card:', {
      cardholderId: params.cardholderId,
      cardType: params.cardType,
    })

    const card = await stripe.issuing.cards.create({
      cardholder: params.cardholderId,
      type: params.cardType === 'virtual' ? 'virtual' : 'physical',
      currency: 'usd',
      spending_controls: params.spendingLimitAmount
        ? {
            spending_limits: [
              {
                amount: Math.round(params.spendingLimitAmount * 100),
                interval: params.spendingLimitInterval || 'monthly',
              },
            ],
          }
        : undefined,
      replacement_requested: false,
      shipping: params.cardType === 'physical' && params.shippingAddress
        ? {
            address: {
              line1: params.shippingAddress.line1,
              line2: params.shippingAddress.line2,
              city: params.shippingAddress.city,
              state: params.shippingAddress.state,
              postal_code: params.shippingAddress.postalCode,
              country: params.shippingAddress.country,
            },
            service: 'express',
            type: 'address',
          }
        : undefined,
      pin: params.cardType === 'physical'
        ? {
            status: 'active',
          }
        : undefined,
    })

    console.log('[v0] Card issued:', card.id)

    return {
      success: true,
      cardId: card.id,
      stripeCardId: card.id,
      last4: card.last4,
      expMonth: card.exp_month,
      expYear: card.exp_year,
    }
  } catch (error) {
    console.error('[v0] Error issuing card:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to issue card',
    }
  }
}

/**
 * Activate an issued card
 */
export async function activateCard(cardId: string): Promise<CardResponse> {
  try {
    console.log('[v0] Activating card:', cardId)

    const card = await stripe.issuing.cards.update(cardId, {
      status: 'active',
    })

    console.log('[v0] Card activated:', card.id)

    return {
      success: true,
      cardId: card.id,
      stripeCardId: card.id,
    }
  } catch (error) {
    console.error('[v0] Error activating card:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to activate card',
    }
  }
}

/**
 * Deactivate an issued card
 */
export async function deactivateCard(cardId: string): Promise<CardResponse> {
  try {
    console.log('[v0] Deactivating card:', cardId)

    const card = await stripe.issuing.cards.update(cardId, {
      status: 'inactive',
    })

    console.log('[v0] Card deactivated:', card.id)

    return {
      success: true,
      cardId: card.id,
      stripeCardId: card.id,
    }
  } catch (error) {
    console.error('[v0] Error deactivating card:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to deactivate card',
    }
  }
}

/**
 * Update cardholder information
 */
export async function updateCardholder(
  cardholderId: string,
  updates: {
    email?: string
    phone?: string
    metadata?: Record<string, string>
  }
): Promise<CardholderResponse> {
  try {
    console.log('[v0] Updating cardholder:', cardholderId)

    const updated = await stripe.issuing.cardholders.update(cardholderId, {
      email: updates.email,
      phone_number: updates.phone,
      metadata: updates.metadata,
    })

    console.log('[v0] Cardholder updated:', updated.id)

    return {
      success: true,
      cardholderId: updated.id,
      stripeCardholderId: updated.id,
    }
  } catch (error) {
    console.error('[v0] Error updating cardholder:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update cardholder',
    }
  }
}

/**
 * Get cardholder details
 */
export async function getCardholder(cardholderId: string): Promise<any> {
  try {
    console.log('[v0] Retrieving cardholder:', cardholderId)

    const cardholder = await stripe.issuing.cardholders.retrieve(cardholderId)

    return {
      success: true,
      cardholder,
    }
  } catch (error) {
    console.error('[v0] Error retrieving cardholder:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve cardholder',
    }
  }
}

/**
 * List all cardholders
 */
export async function listCardholders(limit: number = 100): Promise<any> {
  try {
    console.log('[v0] Listing cardholders')

    const cardholders = await stripe.issuing.cardholders.list({
      limit,
    })

    return {
      success: true,
      cardholders: cardholders.data,
      total: cardholders.data.length,
    }
  } catch (error) {
    console.error('[v0] Error listing cardholders:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list cardholders',
    }
  }
}

/**
 * List cards for a cardholder
 */
export async function listCardsForCardholder(
  cardholderId: string,
  limit: number = 100
): Promise<any> {
  try {
    console.log('[v0] Listing cards for cardholder:', cardholderId)

    const cards = await stripe.issuing.cards.list({
      cardholder: cardholderId,
      limit,
    })

    return {
      success: true,
      cards: cards.data,
      total: cards.data.length,
    }
  } catch (error) {
    console.error('[v0] Error listing cards:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list cards',
    }
  }
}

/**
 * Get card details
 */
export async function getCard(cardId: string): Promise<any> {
  try {
    console.log('[v0] Retrieving card:', cardId)

    const card = await stripe.issuing.cards.retrieve(cardId)

    return {
      success: true,
      card,
    }
  } catch (error) {
    console.error('[v0] Error retrieving card:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve card',
    }
  }
}

/**
 * List transactions for a card
 */
export async function listCardTransactions(
  cardId: string,
  limit: number = 100
): Promise<any> {
  try {
    console.log('[v0] Listing transactions for card:', cardId)

    const transactions = await stripe.issuing.transactions.list({
      card: cardId,
      limit,
    })

    return {
      success: true,
      transactions: transactions.data,
      total: transactions.data.length,
    }
  } catch (error) {
    console.error('[v0] Error listing transactions:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list transactions',
    }
  }
}

export default {
  createCardholder,
  issueCard,
  activateCard,
  deactivateCard,
  updateCardholder,
  getCardholder,
  listCardholders,
  listCardsForCardholder,
  getCard,
  listCardTransactions,
}
