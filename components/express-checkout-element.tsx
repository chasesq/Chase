'use client'

import { useEffect, useRef, useState } from 'react'
import { Stripe, StripeElements } from '@stripe/stripe-js'
import { useToast } from '@/hooks/use-toast'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, Loader2 } from 'lucide-react'

interface ExpressCheckoutElementProps {
  stripe: Stripe | null
  elements: StripeElements | null
  clientSecret: string
  onSuccess: () => void
  onError: (error: { decline_code?: string; code?: string; message?: string }) => void
}

export function ExpressCheckoutElement({
  stripe,
  elements,
  clientSecret,
  onSuccess,
  onError,
}: ExpressCheckoutElementProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const elementRef = useRef<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (!stripe || !elements) return

    try {
      // Create express checkout element (Apple Pay, Google Pay, PayPal, etc.)
      const expressCheckoutElement = elements.create('expressCheckout')
      elementRef.current = expressCheckoutElement

      // Handle confirm event - triggered when user completes payment
      expressCheckoutElement.on('confirm', async (event: any) => {
        console.log('[v0] Express checkout confirm event:', event.expressPaymentType)
        setLoading(true)

        try {
          // Confirm the payment
          const { error: confirmError } = await event.actions.confirm()

          if (confirmError) {
            console.log('[v0] Express checkout confirm error:', confirmError)
            event.paymentFailed()
            setError(confirmError.message || 'Payment failed')
            onError({
              code: (confirmError as any).code,
              message: confirmError.message,
            })
          } else {
            console.log('[v0] Express checkout payment confirmed')
            onSuccess()
          }
        } catch (err: any) {
          console.error('[v0] Express checkout error:', err)
          event.paymentFailed()
          setError(err.message || 'Payment failed')
          onError({ message: err.message })
        } finally {
          setLoading(false)
        }
      })

      // Handle ready event - element is loaded and ready
      expressCheckoutElement.on('ready', () => {
        console.log('[v0] Express checkout element ready')
      })

      // Handle change event
      expressCheckoutElement.on('change', (event: any) => {
        console.log('[v0] Express checkout change:', event)
      })

      // Handle failure event
      expressCheckoutElement.on('shippingaddresschange', (event: any) => {
        console.log('[v0] Express checkout shipping address changed')
      })

      // Mount the element
      expressCheckoutElement.mount('#express-checkout-element')

      return () => {
        if (elementRef.current) {
          elementRef.current.unmount()
        }
      }
    } catch (err: any) {
      console.error('[v0] Failed to create express checkout element:', err)
      setError('Failed to load payment methods')
    }
  }, [stripe, elements, onSuccess, onError])

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Payment Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="bg-gradient-to-r from-blue-50 to-transparent p-4 rounded-lg border border-blue-200 mb-4">
        <p className="text-sm text-muted-foreground">
          <strong>Fast Checkout:</strong> Pay with Apple Pay, Google Pay, PayPal, Amazon Pay, or other saved methods.
        </p>
      </div>

      <div id="express-checkout-element" className="w-full min-h-[50px]" />

      {loading && (
        <div className="flex items-center justify-center py-4 bg-muted/30 rounded-lg">
          <Loader2 className="h-5 w-5 animate-spin text-[#0a4fa6] mr-2" />
          <span className="text-sm text-muted-foreground">Processing your payment...</span>
        </div>
      )}
    </div>
  )
}
