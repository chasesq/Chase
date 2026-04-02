'use client'

import { useEffect, useRef, useState } from 'react'
import { Stripe, StripeElements } from '@stripe/stripe-js'
import { useToast } from '@/hooks/use-toast'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, Loader2 } from 'lucide-react'

interface PaymentElementProps {
  stripe: Stripe | null
  elements: StripeElements | null
  clientSecret: string
  onSuccess: () => void
  onError: (error: { decline_code?: string; code?: string; message?: string }) => void
}

export function PaymentElement({ stripe, elements, clientSecret, onSuccess, onError }: PaymentElementProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (!stripe || !elements) return

    // Handle payment element events
    elements.on('loaderstart', () => {
      console.log('[v0] Payment element loader started')
    })

    elements.on('loaderend', () => {
      console.log('[v0] Payment element loader ended')
    })

    elements.on('change', (event) => {
      if (event.error) {
        console.log('[v0] Payment element error:', event.error.message)
        setError(event.error.message)
      } else {
        setError(null)
      }
    })

    return () => {
      elements.off('loaderstart')
      elements.off('loaderend')
      elements.off('change')
    }
  }, [stripe, elements])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!stripe || !elements) {
      console.error('[v0] Stripe or elements not loaded')
      toast({
        title: 'Error',
        description: 'Payment system not ready. Please try again.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log('[v0] Confirming payment with clientSecret:', clientSecret)

      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        redirect: 'if_required',
      })

      if (confirmError) {
        console.log('[v0] Payment confirmation error:', confirmError)
        setError(confirmError.message || 'Payment failed')
        onError({
          decline_code: (confirmError as any).decline_code,
          code: confirmError.code,
          message: confirmError.message,
        })
      } else if (paymentIntent?.status === 'succeeded') {
        console.log('[v0] Payment succeeded:', paymentIntent.id)
        onSuccess()
      } else if (paymentIntent?.status === 'requires_action') {
        console.log('[v0] Payment requires additional action')
        setError('Please complete the additional verification step')
      } else {
        console.log('[v0] Unexpected payment status:', paymentIntent?.status)
        setError('Unexpected payment status')
      }
    } catch (err: any) {
      console.error('[v0] Payment error:', err)
      setError(err.message || 'An unexpected error occurred')
      onError({ message: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Payment Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div id="payment-element" className="p-4 border rounded-lg bg-muted/30" />

      <button
        type="submit"
        disabled={loading}
        className="w-full h-12 bg-[#0a4fa6] text-white rounded-lg font-medium hover:bg-[#0a3d7a] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          'Complete Payment'
        )}
      </button>
    </form>
  )
}
