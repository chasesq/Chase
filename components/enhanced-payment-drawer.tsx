'use client'

import { useState, useCallback, useEffect } from 'react'
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { useBanking } from '@/lib/banking-context'
import {
  CreditCard,
  CheckCircle2,
  ArrowLeft,
  DollarSign,
  Loader2,
  AlertCircle,
  XCircle,
  RefreshCw,
  Smartphone,
} from 'lucide-react'
import { PRODUCTS, formatPrice } from '@/lib/products'
import { startCheckoutSession, getDeclineMessage, createPaymentIntent } from '@/app/actions/stripe'
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '@stripe/react-stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { PaymentElement } from './payment-element'
import { ExpressCheckoutElement } from './express-checkout-element'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface EnhancedPaymentDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type PaymentStep = 'select' | 'checkout' | 'method-select' | 'payment' | 'success' | 'error'
type PaymentMethod = 'embedded' | 'payment-element' | 'express'

export function EnhancedPaymentDrawer({ open, onOpenChange }: EnhancedPaymentDrawerProps) {
  const [step, setStep] = useState<PaymentStep>('select')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('embedded')
  const [selectedProduct, setSelectedProduct] = useState<string>('')
  const [selectedAccount, setSelectedAccount] = useState<string>('')
  const [paymentError, setPaymentError] = useState<{ message: string; code?: string } | null>(null)
  const [stripe, setStripe] = useState<Stripe | null>(null)
  const [elements, setElements] = useState<StripeElements | null>(null)
  const [clientSecret, setClientSecret] = useState<string>('')
  const { toast } = useToast()
  const { accounts, updateBalance, addTransaction, addNotification, addActivity } = useBanking()

  const checkingAccounts = accounts.filter((a) => a.type === 'Checking' || a.type === 'checking')

  useEffect(() => {
    const initStripe = async () => {
      const stripeInstance = await stripePromise
      setStripe(stripeInstance)
    }
    initStripe()
  }, [])

  const handleSelectAmount = (productId: string) => {
    setSelectedProduct(productId)
  }

  const handleProceedToPaymentMethod = () => {
    if (!selectedProduct || !selectedAccount) {
      toast({
        title: 'Selection Required',
        description: 'Please select an amount and account',
        variant: 'destructive',
      })
      return
    }
    setStep('method-select')
  }

  const handlePaymentMethodSelect = async (method: PaymentMethod) => {
    setPaymentMethod(method)

    try {
      if (method === 'embedded') {
        // Use traditional embedded checkout
        const secret = await startCheckoutSession(selectedProduct, selectedAccount, 'all')
        setClientSecret(secret)
        setStep('checkout')
      } else {
        // Use Payment Element or Express Checkout
        const { clientSecret: secret, paymentIntentId } = await createPaymentIntent(
          selectedProduct,
          selectedAccount,
          method === 'express' ? 'express' : 'all'
        )
        setClientSecret(secret)

        if (stripe) {
          const elementsInstance = stripe.elements({ clientSecret: secret })
          setElements(elementsInstance)
        }

        setStep('payment')
      }
    } catch (error: any) {
      console.error('[v0] Error initiating payment:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to initiate payment',
        variant: 'destructive',
      })
    }
  }

  const fetchClientSecret = useCallback(() => {
    return startCheckoutSession(selectedProduct, selectedAccount, 'all')
  }, [selectedProduct, selectedAccount])

  const handleCheckoutComplete = () => {
    completePayment()
  }

  const completePayment = () => {
    const product = PRODUCTS.find((p) => p.id === selectedProduct)
    const account = accounts.find((a) => a.id === selectedAccount)

    if (product && account) {
      const amountInDollars = product.priceInCents / 100

      updateBalance(selectedAccount, amountInDollars)

      addTransaction({
        description: `Funds Added via Card - ${product.name}`,
        amount: amountInDollars,
        type: 'credit',
        category: 'Deposits',
        status: 'completed',
        accountId: selectedAccount,
        accountFrom: 'External Card',
        reference: `STRIPE-${Date.now()}`,
      })

      addNotification({
        title: 'Funds Added',
        message: `${formatPrice(product.priceInCents)} has been added to your ${account.name}`,
        type: 'success',
        category: 'Deposits',
      })

      addActivity({
        action: `Added ${formatPrice(product.priceInCents)} to ${account.name} via card`,
        device: navigator.userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop Browser',
        location: 'Current Session',
      })
    }

    setStep('success')

    toast({
      title: 'Funds Added Successfully!',
      description: `${formatPrice(product?.priceInCents || 0)} has been added to your account`,
    })
  }

  const resetDrawer = () => {
    setStep('select')
    setSelectedProduct('')
    setSelectedAccount(checkingAccounts[0]?.id || '')
    setPaymentError(null)
    setClientSecret('')
  }

  const handlePaymentSuccess = () => {
    completePayment()
  }

  const handlePaymentError = async (error: { decline_code?: string; code?: string; message?: string }) => {
    const declineCode = error.decline_code || error.code
    const errorMessage = await getDeclineMessage(declineCode)

    setPaymentError({
      message: errorMessage,
      code: declineCode || undefined,
    })
    setStep('error')

    toast({
      title: 'Payment Failed',
      description: errorMessage,
      variant: 'destructive',
    })
  }

  const handleRetryPayment = () => {
    setPaymentError(null)
    setStep('payment')
  }

  const handleTryDifferentCard = () => {
    setPaymentError(null)
    setStep('method-select')
  }

  const selectedProductData = PRODUCTS.find((p) => p.id === selectedProduct)

  return (
    <Drawer
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) resetDrawer()
        onOpenChange(isOpen)
      }}
    >
      <DrawerContent className="h-[90vh]">
        <DrawerHeader className="bg-[#0a4fa6] text-white rounded-t-lg">
          <DrawerTitle className="text-white flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Add Funds
          </DrawerTitle>
          <div className="flex items-center gap-2 mt-2">
            {['select', 'method-select', 'payment', 'success'].map((s) => {
              const stepOrder = ['select', 'method-select', 'payment', 'success']
              const currentStep = step === 'error' ? 'payment' : step
              return (
                <div
                  key={s}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    stepOrder.indexOf(currentStep) >= stepOrder.indexOf(s)
                      ? step === 'error'
                        ? 'bg-red-300'
                        : 'bg-white'
                      : 'bg-white/30'
                  }`}
                />
              )
            })}
          </div>
        </DrawerHeader>

        <div className="px-4 py-4 overflow-y-auto flex-1">
          {step === 'select' && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-[#0a4fa6] mb-1">Add Money to Your Account</h3>
                <p className="text-sm text-muted-foreground">
                  Instantly fund your Chase account using a debit or credit card. Funds are available immediately.
                </p>
              </div>

              <div>
                <Label className="mb-2 block">Select Account to Fund</Label>
                <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an account" />
                  </SelectTrigger>
                  <SelectContent>
                    {checkingAccounts.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id}>
                        {acc.name} (${(acc.balance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="mb-3 block">Select Amount to Add</Label>
                <div className="grid grid-cols-2 gap-3">
                  {PRODUCTS.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleSelectAmount(product.id)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        selectedProduct === product.id
                          ? 'border-[#0a4fa6] bg-blue-50'
                          : 'border-border hover:border-[#0a4fa6]/50 hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <DollarSign
                          className={`h-4 w-4 ${selectedProduct === product.id ? 'text-[#0a4fa6]' : 'text-muted-foreground'}`}
                        />
                        <span
                          className={`font-semibold ${selectedProduct === product.id ? 'text-[#0a4fa6]' : ''}`}
                        >
                          {formatPrice(product.priceInCents)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{product.description}</p>
                      {selectedProduct === product.id && (
                        <CheckCircle2 className="h-4 w-4 text-[#0a4fa6] mt-2" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-muted/50 p-3 rounded-lg text-sm">
                <p className="text-muted-foreground">
                  <strong>Secure Payment:</strong> Your payment is processed securely by Stripe. We never store your card
                  details.
                </p>
              </div>
            </div>
          )}

          {step === 'method-select' && (
            <div className="space-y-4">
              <Button variant="ghost" size="sm" onClick={() => setStep('select')} className="mb-2">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>

              <div className="bg-muted/50 p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Adding to account</p>
                    <p className="font-medium">{accounts.find((a) => a.id === selectedAccount)?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="font-semibold text-[#0a4fa6] text-lg">
                      {selectedProductData ? formatPrice(selectedProductData.priceInCents) : '$0.00'}
                    </p>
                  </div>
                </div>
              </div>

              <h3 className="font-semibold">Choose Payment Method</h3>

              <div className="space-y-3">
                <button
                  onClick={() => handlePaymentMethodSelect('express')}
                  className="w-full p-4 rounded-lg border-2 border-border hover:border-[#0a4fa6] transition-all text-left hover:bg-muted/50"
                >
                  <div className="flex items-start gap-3">
                    <Smartphone className="h-5 w-5 text-[#0a4fa6] mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Express Checkout</p>
                      <p className="text-sm text-muted-foreground">
                        Apple Pay, Google Pay, PayPal, Amazon Pay - Fast & Secure
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handlePaymentMethodSelect('payment-element')}
                  className="w-full p-4 rounded-lg border-2 border-border hover:border-[#0a4fa6] transition-all text-left hover:bg-muted/50"
                >
                  <div className="flex items-start gap-3">
                    <CreditCard className="h-5 w-5 text-[#0a4fa6] mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Payment Element</p>
                      <p className="text-sm text-muted-foreground">All payment methods with smart fallbacks</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handlePaymentMethodSelect('embedded')}
                  className="w-full p-4 rounded-lg border-2 border-border hover:border-[#0a4fa6] transition-all text-left hover:bg-muted/50"
                >
                  <div className="flex items-start gap-3">
                    <CreditCard className="h-5 w-5 text-[#0a4fa6] mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Embedded Checkout</p>
                      <p className="text-sm text-muted-foreground">Traditional checkout flow (recommended)</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {step === 'checkout' && (
            <div className="space-y-4">
              <Button variant="ghost" size="sm" onClick={() => setStep('method-select')} className="mb-2">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>

              <div className="bg-muted/50 p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Adding to account</p>
                    <p className="font-medium">{accounts.find((a) => a.id === selectedAccount)?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="font-semibold text-[#0a4fa6] text-lg">
                      {selectedProductData ? formatPrice(selectedProductData.priceInCents) : '$0.00'}
                    </p>
                  </div>
                </div>
              </div>

              <div id="checkout" className="min-h-[400px]">
                <EmbeddedCheckoutProvider
                  stripe={stripePromise}
                  options={{
                    clientSecret: fetchClientSecret,
                    onComplete: handleCheckoutComplete,
                  }}
                >
                  <EmbeddedCheckout />
                </EmbeddedCheckoutProvider>
              </div>
            </div>
          )}

          {step === 'payment' && stripe && elements && (
            <div className="space-y-4">
              <Button variant="ghost" size="sm" onClick={() => setStep('method-select')} className="mb-2">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>

              <div className="bg-muted/50 p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Adding to account</p>
                    <p className="font-medium">{accounts.find((a) => a.id === selectedAccount)?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="font-semibold text-[#0a4fa6] text-lg">
                      {selectedProductData ? formatPrice(selectedProductData.priceInCents) : '$0.00'}
                    </p>
                  </div>
                </div>
              </div>

              <Tabs defaultValue={paymentMethod} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="express">Express</TabsTrigger>
                  <TabsTrigger value="payment-element">Payment</TabsTrigger>
                </TabsList>

                <TabsContent value="express" className="mt-4">
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <ExpressCheckoutElement
                      stripe={stripe}
                      elements={elements}
                      clientSecret={clientSecret}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                    />
                  </Elements>
                </TabsContent>

                <TabsContent value="payment-element" className="mt-4">
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <PaymentElement
                      stripe={stripe}
                      elements={elements}
                      clientSecret={clientSecret}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                    />
                  </Elements>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {step === 'error' && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <XCircle className="h-10 w-10 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-red-600 mb-2">Payment Failed</h3>

              <Alert variant="destructive" className="mb-6 mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Transaction Declined</AlertTitle>
                <AlertDescription>
                  {paymentError?.message || 'Your payment could not be processed. Please try again.'}
                </AlertDescription>
              </Alert>

              {paymentError?.code && <p className="text-xs text-muted-foreground mb-4">Error code: {paymentError.code}</p>}

              <div className="bg-muted/50 p-4 rounded-lg mb-6 w-full">
                <h4 className="font-medium mb-2">What you can do:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Check your card details are correct</li>
                  <li>• Ensure sufficient funds are available</li>
                  <li>• Try a different payment method</li>
                  <li>• Contact your bank if the issue persists</li>
                </ul>
              </div>

              <div className="flex gap-3 w-full">
                <Button variant="outline" className="flex-1" onClick={handleTryDifferentCard}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Try Different Method
                </Button>
                <Button className="flex-1 bg-[#0a4fa6]" onClick={handleRetryPayment}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry Payment
                </Button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-green-600 mb-2">Funds Added!</h3>
              <p className="text-muted-foreground text-center mb-2">
                {selectedProductData ? formatPrice(selectedProductData.priceInCents) : '$0.00'} has been added to your account
              </p>
              <p className="text-sm text-muted-foreground text-center">
                Your new balance is available immediately
              </p>

              <Button
                className="mt-8 bg-[#0a4fa6]"
                onClick={() => {
                  resetDrawer()
                  onOpenChange(false)
                }}
              >
                Done
              </Button>
            </div>
          )}
        </div>

        {step === 'select' && (
          <DrawerFooter>
            <Button
              className="h-12 bg-[#0a4fa6]"
              onClick={handleProceedToPaymentMethod}
              disabled={!selectedProduct || !selectedAccount}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Continue to Payment
            </Button>
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  )
}
