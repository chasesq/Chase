# Full Payment Suite Implementation Guide

## Overview

Your Chase app now includes a complete, production-ready payment suite with multiple checkout methods:

- **Express Checkout Element** - Apple Pay, Google Pay, PayPal, Amazon Pay, Link
- **Payment Element** - All payment methods with smart fallbacks
- **Embedded Checkout** - Traditional Stripe checkout flow
- **Advanced Stripe Dashboard** - Balance, payments, transactions, and refunds management

## Components

### 1. EnhancedPaymentDrawer (NEW - Main Component)
**Location:** `components/enhanced-payment-drawer.tsx`

The primary payment component that handles all payment methods:

```tsx
import { EnhancedPaymentDrawer } from '@/components/enhanced-payment-drawer'

export function Dashboard() {
  const [open, setOpen] = useState(false)
  
  return (
    <>
      <button onClick={() => setOpen(true)}>Add Funds</button>
      <EnhancedPaymentDrawer open={open} onOpenChange={setOpen} />
    </>
  )
}
```

**Features:**
- Multi-step payment flow (select amount → choose method → confirm → success)
- Three payment method options for users
- Real-time balance and transaction updates
- Comprehensive error handling with decline messages
- Loading states and accessibility

### 2. ExpressCheckoutElement (NEW)
**Location:** `components/express-checkout-element.tsx`

Handles express payment methods (Apple Pay, Google Pay, PayPal, Amazon Pay, Link):

```tsx
import { ExpressCheckoutElement } from '@/components/express-checkout-element'

// Used inside EnhancedPaymentDrawer with Elements context
<ExpressCheckoutElement
  stripe={stripe}
  elements={elements}
  clientSecret={clientSecret}
  onSuccess={handleSuccess}
  onError={handleError}
/>
```

**Payment Types:**
- Apple Pay (iOS, macOS, Safari)
- Google Pay (Android, Chrome)
- PayPal
- Amazon Pay
- Stripe Link (saved cards/new payment methods)

### 3. PaymentElement (NEW)
**Location:** `components/payment-element.tsx`

Advanced payment form supporting all payment methods:

```tsx
import { PaymentElement as PaymentForm } from '@/components/payment-element'

// Used inside EnhancedPaymentDrawer with Elements context
<PaymentForm
  stripe={stripe}
  elements={elements}
  clientSecret={clientSecret}
  onSuccess={handleSuccess}
  onError={handleError}
/>
```

**Features:**
- Smart payment method detection
- Automatic payment method selection based on location
- Built-in 3D Secure / 2FA handling
- Bi-directional payment method indicator
- Fallback payment options

### 4. AddFundsDrawer (UPDATED)
**Location:** `components/add-funds-drawer.tsx`

Now a wrapper that delegates to EnhancedPaymentDrawer for backward compatibility:

```tsx
import { AddFundsDrawer } from '@/components/add-funds-drawer'

// Still works as before, but now uses the full payment suite
<AddFundsDrawer open={open} onOpenChange={setOpen} />
```

### 5. StripeDashboardDrawer (EXISTING)
**Location:** `components/stripe-dashboard-drawer.tsx`

Enhanced with payment method information:

```tsx
import { StripeDashboardDrawer } from '@/components/stripe-dashboard-drawer'

<StripeDashboardDrawer open={open} onOpenChange={setOpen} />
```

**Features:**
- View balance (available and pending)
- List recent payments with payment method info
- View balance transactions and payouts
- Process refunds with confirmation dialog
- Refresh data in real-time

## Server Actions

### Updated: `app/actions/stripe.ts`

#### New Functions

```typescript
// Create payment intent for direct payment confirmation
export async function createPaymentIntent(
  productId: string,
  accountId?: string,
  paymentMethod: 'card' | 'express' | 'all' = 'all'
)
// Returns: { clientSecret, paymentIntentId }

// Get payment intent details
export async function getPaymentIntentDetails(paymentIntentId: string)
// Returns: payment info with payment method types and charge details

// Enhanced startCheckoutSession
export async function startCheckoutSession(
  productId: string,
  accountId?: string,
  paymentMethod: 'card' | 'express' | 'all' = 'all'
)
// Now supports multiple payment method configurations
```

#### Payment Method Types

When calling `startCheckoutSession` or `createPaymentIntent`:
- `'card'` - Card payments only
- `'express'` - Express methods only (Apple Pay, Google Pay, PayPal, Amazon Pay)
- `'all'` - All available methods (default)

## Usage Example

### Basic Implementation

```tsx
'use client'

import { useState } from 'react'
import { EnhancedPaymentDrawer } from '@/components/enhanced-payment-drawer'
import { Button } from '@/components/ui/button'

export function MyComponent() {
  const [paymentOpen, setPaymentOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setPaymentOpen(true)}>
        Add Funds
      </Button>
      <EnhancedPaymentDrawer open={paymentOpen} onOpenChange={setPaymentOpen} />
    </>
  )
}
```

### Advanced: Custom Payment Form

If you want to build a custom payment experience:

```tsx
'use client'

import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { createPaymentIntent } from '@/app/actions/stripe'
import { PaymentElement } from '@/components/payment-element'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export function CustomCheckout() {
  const [clientSecret, setClientSecret] = useState('')
  const [stripe, setStripe] = useState(null)
  const [elements, setElements] = useState(null)

  useEffect(() => {
    const init = async () => {
      const stripeInstance = await stripePromise
      const { clientSecret } = await createPaymentIntent('product-id')
      const elementsInstance = stripeInstance.elements({ clientSecret })
      
      setStripe(stripeInstance)
      setElements(elementsInstance)
      setClientSecret(clientSecret)
    }
    init()
  }, [])

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <PaymentElement
        stripe={stripe}
        elements={elements}
        clientSecret={clientSecret}
        onSuccess={() => console.log('Payment succeeded')}
        onError={(error) => console.log('Payment error:', error)}
      />
    </Elements>
  )
}
```

## Payment Flow

### Express Checkout Flow
```
User selects amount → Choose "Express Checkout" 
→ Select payment method (Apple Pay, Google Pay, etc)
→ Express UI handles payment
→ Success/Error handling
→ Account balance updated
```

### Payment Element Flow
```
User selects amount → Choose "Payment Element"
→ Smart payment form displays available methods
→ User enters/selects payment method
→ Click "Complete Payment"
→ Confirmation and 3DS if needed
→ Success/Error handling
```

### Embedded Checkout Flow
```
User selects amount → Choose "Embedded Checkout"
→ Traditional Stripe checkout form
→ User completes payment in modal
→ Success/Error handling
→ Account balance updated
```

## Error Handling

The system includes comprehensive decline message handling:

```typescript
import { getDeclineMessage } from '@/app/actions/stripe'

// Get user-friendly error message
const message = await getDeclineMessage('card_declined')
// Returns: "Your card was declined. Please try a different payment method."
```

**Supported Decline Codes:**
- `card_declined` - Card was declined
- `insufficient_funds` - Not enough funds
- `lost_card` - Card reported lost
- `stolen_card` - Card reported stolen
- `expired_card` - Card has expired
- `incorrect_cvc` - Wrong security code
- `authentication_required` - 3D Secure required
- `fraudulent` - Fraudulent transaction
- `apple_pay_error` - Apple Pay failure
- `google_pay_error` - Google Pay failure
- `paypal_error` - PayPal failure
- `amazon_pay_error` - Amazon Pay failure
- And many more...

## Environment Variables

Make sure these are set in your project:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
```

## Testing

### Test Cards

Stripe provides test cards for development:

**Successful Payment:**
- Number: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits

**Requires Authentication:**
- Number: `4000 0025 0000 3155`
- Expiry: Any future date
- CVC: Any 3 digits

**Card Declined:**
- Number: `4000 0000 0000 0002`
- Expiry: Any future date
- CVC: Any 3 digits

### Test Express Checkout

For testing Apple Pay or Google Pay in development:
1. Use `pk_test_` keys instead of `pk_live_`
2. Chrome DevTools can simulate Google Pay
3. Safari on macOS/iOS simulates Apple Pay

## Migration from Old Payment System

If you were using the old `AddFundsDrawer`:

**Before:**
```tsx
import { AddFundsDrawer } from '@/components/add-funds-drawer'
// This still works, but uses the new payment suite internally
```

**After (Recommended):**
```tsx
import { EnhancedPaymentDrawer } from '@/components/enhanced-payment-drawer'
// Use this directly for the full feature set
```

Both work identically - `AddFundsDrawer` is now a wrapper.

## Performance Considerations

- **Stripe.js** is loaded asynchronously
- **Payment Elements** are lazy-loaded only when needed
- **Error messages** are fetched server-side to avoid exposing decline codes to client
- **Balance updates** use optimistic updates with server verification

## Security Best Practices

✅ All sensitive payment data stays within Stripe
✅ No card details stored in your database
✅ Server-side payment confirmation
✅ CSRF protection via server actions
✅ Decline codes handled securely server-side
✅ User metadata only (no PII in client-side logs)

## Troubleshooting

### Express Checkout Not Showing

1. Check `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set
2. Ensure you're in a supported browser (Chrome for Google Pay, Safari for Apple Pay)
3. Verify payment method is available in your region

### Payment Element Not Displaying

1. Verify `clientSecret` is passed correctly
2. Check Elements is initialized with correct `clientSecret`
3. Ensure Stripe promise is loaded before rendering

### Decline Errors

Check the decline code returned:
- Server logs show the decline reason
- User sees friendly message via `getDeclineMessage()`
- Payment intents stored with full error details

## Need Help?

- **Stripe Docs:** https://stripe.com/docs/stripe-js
- **Payment Element:** https://stripe.com/docs/payments/payment-element
- **Express Checkout:** https://stripe.com/docs/payments/express-checkout-element
- **Testing Guide:** https://stripe.com/docs/testing

## Next Steps

1. ✅ Environment variables are set in your project settings
2. ✅ Test with Stripe test keys
3. ✅ Review user flow in the EnhancedPaymentDrawer
4. ✅ Customize styling to match your brand
5. ✅ Switch to live keys for production
