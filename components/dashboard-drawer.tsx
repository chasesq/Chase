"use client"

import { useState, useEffect, useCallback } from "react"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  ArrowLeft, 
  RefreshCw, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ArrowDownLeft,
  ArrowUpRight,
  Loader2,
  AlertCircle,
  Undo2
} from "lucide-react"
import { getStripeBalance, listPayments, listBalanceTransactions, listRefunds, createRefund } from "@/app/actions/stripe"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface DashboardDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface Balance {
  available: { amount: number; currency: string }[]
  pending: { amount: number; currency: string }[]
}

interface Payment {
  id: string
  amount: number
  currency: string
  status: string
  created: number
  description: string | null
  metadata: Record<string, string>
  chargeId?: string | null
}

interface BalanceTransaction {
  id: string
  amount: number
  currency: string
  type: string
  status: string
  created: number
  description: string | null
  fee: number
  net: number
  source: string | null
}

interface Refund {
  id: string
  amount: number
  currency: string
  status: string
  created: number
  reason: string | null
  paymentIntentId?: string | null
}

export function DashboardDrawer({ open, onOpenChange }: DashboardDrawerProps) {
  const [balance, setBalance] = useState<Balance | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [transactions, setTransactions] = useState<BalanceTransaction[]>([])
  const [refunds, setRefunds] = useState<Refund[]>([])
  const [loading, setLoading] = useState(false)
  const [refundingId, setRefundingId] = useState<string | null>(null)
  const [refundConfirmOpen, setRefundConfirmOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const { toast } = useToast()

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [balanceData, paymentsData, txnData, refundsData] = await Promise.all([
        getStripeBalance(),
        listPayments(25),
        listBalanceTransactions(25),
        listRefunds(25),
      ])
      setBalance(balanceData)
      setPayments(paymentsData)
      setTransactions(txnData)
      setRefunds(refundsData)
    } catch (error) {
      console.error("Failed to fetch Stripe data:", error)
      toast({
        title: "Error",
        description: "Failed to load Stripe data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    if (open) {
      fetchData()
    }
  }, [open, fetchData])

  const handleRefundClick = (payment: Payment) => {
    setSelectedPayment(payment)
    setRefundConfirmOpen(true)
  }

  const handleRefundConfirm = async () => {
    if (!selectedPayment) return
    
    setRefundingId(selectedPayment.id)
    setRefundConfirmOpen(false)
    
    try {
      const result = await createRefund(selectedPayment.id)
      
      if (result.success) {
        toast({
          title: "Refund Processed",
          description: `Successfully refunded ${formatCurrency(selectedPayment.amount, selectedPayment.currency)}`,
        })
        fetchData() // Refresh data
      } else {
        toast({
          title: "Refund Failed",
          description: result.error || "Unable to process refund",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setRefundingId(null)
      setSelectedPayment(null)
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100)
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'succeeded':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100"><CheckCircle2 className="h-3 w-3 mr-1" /> Succeeded</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>
      case 'failed':
      case 'canceled':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100"><XCircle className="h-3 w-3 mr-1" /> {status}</Badge>
      case 'requires_payment_method':
        return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100"><AlertCircle className="h-3 w-3 mr-1" /> Needs Payment</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'charge':
      case 'payment':
        return <ArrowDownLeft className="h-4 w-4 text-green-600" />
      case 'refund':
        return <ArrowUpRight className="h-4 w-4 text-red-600" />
      case 'payout':
        return <ArrowUpRight className="h-4 w-4 text-blue-600" />
      default:
        return <DollarSign className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="h-[95vh] max-h-[95vh]">
          <div className="flex flex-col h-full">
            <DrawerHeader className="border-b px-4 py-3 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="h-8 w-8">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <DrawerTitle className="text-lg font-semibold">Dashboard</DrawerTitle>
                </div>
                <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </DrawerHeader>

            <ScrollArea className="flex-1 px-4">
              <div className="py-4 space-y-4">
                {/* Full page loading state - wait for all data before showing */}
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-16 space-y-4">
                    <div className="space-y-3 w-full max-w-sm">
                      {/* Balance cards skeleton */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-muted rounded-lg h-24 animate-pulse" />
                        <div className="bg-muted rounded-lg h-24 animate-pulse" />
                      </div>
                      {/* Tabs skeleton */}
                      <div className="bg-muted rounded-lg h-10 animate-pulse" />
                      {/* Content skeleton */}
                      <div className="space-y-2">
                        <div className="bg-muted rounded-lg h-20 animate-pulse" />
                        <div className="bg-muted rounded-lg h-20 animate-pulse" />
                        <div className="bg-muted rounded-lg h-20 animate-pulse" />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">Loading dashboard...</p>
                  </div>
                ) : (
                  <>
                    {/* Balance Cards */}
                    <div className="grid grid-cols-2 gap-3">
                      <Card>
                        <CardHeader className="pb-2 pt-4 px-4">
                          <CardTitle className="text-sm font-medium text-muted-foreground">Available</CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 pb-4">
                          <div className="text-2xl font-bold text-green-600">
                            {loading ? (
                              <Loader2 className="h-6 w-6 animate-spin" />
                            ) : (
                              formatCurrency(balance?.available[0]?.amount || 0, 'usd')
                            )}
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2 pt-4 px-4">
                          <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 pb-4">
                          <div className="text-2xl font-bold text-yellow-600">
                            {loading ? (
                              <Loader2 className="h-6 w-6 animate-spin" />
                            ) : (
                              formatCurrency(balance?.pending[0]?.amount || 0, 'usd')
                            )}
                          </div>
                        </CardContent>
                      </Card>
                        </div>

                    {/* Tabs for different views */}
                    <Tabs defaultValue="payments" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="payments">Payments</TabsTrigger>
                        <TabsTrigger value="transactions">Transactions</TabsTrigger>
                        <TabsTrigger value="refunds">Refunds</TabsTrigger>
                      </TabsList>

                      {/* Payments Tab */}
                      <TabsContent value="payments" className="mt-4 space-y-3">
                        {loading ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                          </div>
                        ) : payments.length === 0 ? (
                          <Card>
                            <CardContent className="py-8 text-center text-muted-foreground">
                              No payments found
                            </CardContent>
                          </Card>
                        ) : (
                          payments.map((payment) => (
                            <Card key={payment.id} className="overflow-hidden">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-semibold">
                                        {formatCurrency(payment.amount, payment.currency)}
                                      </span>
                                      {getStatusBadge(payment.status)}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      {payment.metadata?.productId || payment.description || 'Payment'}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {formatDate(payment.created)}
                                    </p>
                                  </div>
                                  {payment.status === 'succeeded' && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleRefundClick(payment)}
                                      disabled={refundingId === payment.id}
                                      className="flex-shrink-0"
                                    >
                                      {refundingId === payment.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <>
                                          <Undo2 className="h-4 w-4 mr-1" />
                                          Refund
                                        </>
                                      )}
                                    </Button>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))
                        )}
                      </TabsContent>

                      {/* Transactions Tab (Payout Reconciliation) */}
                      <TabsContent value="transactions" className="mt-4 space-y-3">
                        {loading ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                          </div>
                        ) : transactions.length === 0 ? (
                          <Card>
                            <CardContent className="py-8 text-center text-muted-foreground">
                              No transactions found
                            </CardContent>
                          </Card>
                        ) : (
                          transactions.map((txn) => (
                            <Card key={txn.id} className="overflow-hidden">
                              <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                  <div className="mt-1">
                                    {getTransactionIcon(txn.type)}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium capitalize">{txn.type}</span>
                                      <span className={`font-semibold ${txn.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {txn.amount >= 0 ? '+' : ''}{formatCurrency(txn.amount, txn.currency)}
                                      </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      {txn.description || `${txn.type} transaction`}
                                    </p>
                                    <div className="flex items-center justify-between mt-1">
                                      <p className="text-xs text-muted-foreground">
                                        {formatDate(txn.created)}
                                      </p>
                                      {txn.fee > 0 && (
                                        <span className="text-xs text-muted-foreground">
                                          Fee: {formatCurrency(txn.fee, txn.currency)}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))
                        )}
                      </TabsContent>

                      {/* Refunds Tab */}
                      <TabsContent value="refunds" className="mt-4 space-y-3">
                        {loading ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                          </div>
                        ) : refunds.length === 0 ? (
                          <Card>
                            <CardContent className="py-8 text-center text-muted-foreground">
                              No refunds found
                            </CardContent>
                          </Card>
                        ) : (
                          refunds.map((refund) => (
                            <Card key={refund.id} className="overflow-hidden">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <ArrowUpRight className="h-4 w-4 text-red-600" />
                                      <span className="font-semibold text-red-600">
                                        -{formatCurrency(refund.amount, refund.currency)}
                                      </span>
                                      {getStatusBadge(refund.status)}
                                    </div>
                                    <p className="text-sm text-muted-foreground capitalize">
                                      {refund.reason?.replace(/_/g, ' ') || 'Customer requested'}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {formatDate(refund.created)}
                                    </p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))
                        )}
                      </TabsContent>
                    </Tabs>
                  </>
                )}
              </div>
            </ScrollArea>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Refund Confirmation Dialog */}
      <AlertDialog open={refundConfirmOpen} onOpenChange={setRefundConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Refund</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to refund {selectedPayment ? formatCurrency(selectedPayment.amount, selectedPayment.currency) : ''}? 
              This action cannot be undone and the funds will be returned to the customer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRefundConfirm} className="bg-red-600 hover:bg-red-700">
              Process Refund
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
