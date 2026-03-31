"use client"

import { useState, useCallback } from "react"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useBanking } from "@/lib/banking-context"
import { CreditCard, CheckCircle2, ArrowLeft, DollarSign, Loader2 } from "lucide-react"
import { PRODUCTS, formatPrice } from "@/lib/products"
import { loadStripe } from "@stripe/stripe-js"
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js"
import { startCheckoutSession } from "@/app/actions/stripe"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface AddFundsDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddFundsDrawer({ open, onOpenChange }: AddFundsDrawerProps) {
  const [step, setStep] = useState<"select" | "checkout" | "success">("select")
  const [selectedProduct, setSelectedProduct] = useState<string>("")
  const [selectedAccount, setSelectedAccount] = useState<string>("")
  const { toast } = useToast()
  const { accounts, updateBalance, addTransaction, addNotification, addActivity } = useBanking()

  const checkingAccounts = accounts.filter((a) => a.type === "Checking" || a.type === "checking")

  const handleSelectAmount = (productId: string) => {
    setSelectedProduct(productId)
  }

  const handleProceedToCheckout = () => {
    if (!selectedProduct) {
      toast({
        title: "Select an amount",
        description: "Please select how much you want to add",
        variant: "destructive",
      })
      return
    }
    if (!selectedAccount) {
      toast({
        title: "Select an account",
        description: "Please select which account to fund",
        variant: "destructive",
      })
      return
    }
    setStep("checkout")
  }

  const fetchClientSecret = useCallback(() => {
    return startCheckoutSession(selectedProduct, selectedAccount)
  }, [selectedProduct, selectedAccount])

  const handleCheckoutComplete = () => {
    const product = PRODUCTS.find((p) => p.id === selectedProduct)
    const account = accounts.find((a) => a.id === selectedAccount)
    
    if (product && account) {
      const amountInDollars = product.priceInCents / 100
      
      // Update account balance
      updateBalance(selectedAccount, amountInDollars)
      
      // Add transaction record
      addTransaction({
        description: `Funds Added via Card - ${product.name}`,
        amount: amountInDollars,
        type: "credit",
        category: "Deposits",
        status: "completed",
        accountId: selectedAccount,
        accountFrom: "External Card",
        reference: `STRIPE-${Date.now()}`,
      })
      
      // Add notification
      addNotification({
        title: "Funds Added",
        message: `${formatPrice(product.priceInCents)} has been added to your ${account.name}`,
        type: "success",
        category: "Deposits",
      })
      
      // Add activity
      addActivity({
        action: `Added ${formatPrice(product.priceInCents)} to ${account.name} via card`,
        device: navigator.userAgent.includes("Mobile") ? "Mobile Device" : "Desktop Browser",
        location: "Current Session",
      })
    }
    
    setStep("success")
    
    toast({
      title: "Funds Added Successfully!",
      description: `${formatPrice(product?.priceInCents || 0)} has been added to your account`,
    })
  }

  const resetDrawer = () => {
    setStep("select")
    setSelectedProduct("")
    setSelectedAccount(checkingAccounts[0]?.id || "")
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
            {["select", "checkout", "success"].map((s, i) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  ["select", "checkout", "success"].indexOf(step) >= i ? "bg-white" : "bg-white/30"
                }`}
              />
            ))}
          </div>
        </DrawerHeader>

        <div className="px-4 py-4 overflow-y-auto flex-1">
          {step === "select" && (
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
                        {acc.name} (${(acc.balance ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })})
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
                          ? "border-[#0a4fa6] bg-blue-50"
                          : "border-border hover:border-[#0a4fa6]/50 hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <DollarSign className={`h-4 w-4 ${selectedProduct === product.id ? "text-[#0a4fa6]" : "text-muted-foreground"}`} />
                        <span className={`font-semibold ${selectedProduct === product.id ? "text-[#0a4fa6]" : ""}`}>
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
                  <strong>Secure Payment:</strong> Your payment is processed securely by Stripe. 
                  We never store your card details.
                </p>
              </div>
            </div>
          )}

          {step === "checkout" && (
            <div className="space-y-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep("select")}
                className="mb-2"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>

              <div className="bg-muted/50 p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Adding to account</p>
                    <p className="font-medium">{accounts.find(a => a.id === selectedAccount)?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="font-semibold text-[#0a4fa6] text-lg">
                      {selectedProductData ? formatPrice(selectedProductData.priceInCents) : "$0.00"}
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

          {step === "success" && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-green-600 mb-2">Funds Added!</h3>
              <p className="text-muted-foreground text-center mb-2">
                {selectedProductData ? formatPrice(selectedProductData.priceInCents) : "$0.00"} has been added to your account
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

        {step === "select" && (
          <DrawerFooter>
            <Button
              className="h-12 bg-[#0a4fa6]"
              onClick={handleProceedToCheckout}
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
