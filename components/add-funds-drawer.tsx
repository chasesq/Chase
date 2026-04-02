'use client'

/**
 * DEPRECATED: Use EnhancedPaymentDrawer instead
 * This component is maintained for backward compatibility
 * Please import EnhancedPaymentDrawer for the full payment suite with:
 * - Express Checkout (Apple Pay, Google Pay, PayPal, Amazon Pay)
 * - Payment Element
 * - Traditional Embedded Checkout
 */

import { EnhancedPaymentDrawer } from './enhanced-payment-drawer'

interface AddFundsDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddFundsDrawer({ open, onOpenChange }: AddFundsDrawerProps) {
  return <EnhancedPaymentDrawer open={open} onOpenChange={onOpenChange} />
}
