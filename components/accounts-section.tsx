"use client"

import { ChevronRight, Eye, EyeOff, TrendingUp, TrendingDown, Clock, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useBanking } from "@/lib/banking-context"
import { useState, useEffect, useRef } from "react"
import { formatAccountNumberDisplay, cn } from "@/lib/utils"

interface AccountsSectionProps {
  onViewAccount: () => void
  onLinkExternal: () => void
  onSeeAllTransactions: () => void
  onReceiptOpen: (transactionId: string) => void
}

// Loading skeleton for accounts
function AccountsSkeleton() {
  return (
    <section className="space-y-4" aria-busy="true" aria-label="Loading accounts">
      <div className="flex items-center justify-between px-1">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-8 w-16" />
      </div>
      <Card className="chase-card-shadow border-0 overflow-hidden">
        <div className="bg-gradient-to-r from-[#0a4fa6] to-[#117aca] px-4 py-3">
          <Skeleton className="h-4 w-20 bg-white/20 mb-2" />
          <Skeleton className="h-8 w-32 bg-white/20" />
        </div>
      </Card>
      <Card className="chase-card-shadow border-0 overflow-hidden">
        <div className="bg-[#0a4fa6] px-4 py-2">
          <Skeleton className="h-4 w-28 bg-white/20" />
        </div>
        <CardContent className="p-0">
          {[1, 2].map((i) => (
            <div key={i} className="p-4 border-b last:border-0">
              <Skeleton className="h-3 w-24 mb-2" />
              <div className="flex justify-between">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  )
}

export function AccountsSection({
  onViewAccount,
  onLinkExternal,
  onSeeAllTransactions,
  onReceiptOpen,
}: AccountsSectionProps) {
  const { accounts, transactions, isLoaded } = useBanking()
  const [showBalances, setShowBalances] = useState(true)
  const [animatedBalance, setAnimatedBalance] = useState<number | null>(null)
  const prevBalanceRef = useRef<number | null>(null)
  
  // Calculate total balance across all accounts, defaulting to 0 for new accounts
  const totalBalance = accounts && accounts.length > 0 
    ? accounts.reduce((acc, curr) => acc + ((curr.balance ?? 0) || 0), 0)
    : 0

  // Animate balance changes
  useEffect(() => {
    if (prevBalanceRef.current !== null && prevBalanceRef.current !== totalBalance) {
      setAnimatedBalance(totalBalance)
      const timer = setTimeout(() => setAnimatedBalance(null), 1000)
      return () => clearTimeout(timer)
    }
    prevBalanceRef.current = totalBalance
  }, [totalBalance])

  // Get transactions that are not tied to a specific account (or show all)
  const hasTransactions = transactions && transactions.length > 0

  // Get recent transactions for display (sorted by date)
  const recentTransactions = hasTransactions
    ? [...transactions]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5)
    : []

  const pendingCount = hasTransactions ? transactions.filter((tx) => tx.status === "pending").length : 0

  const formatBalance = (balance?: number) => {
    if (!showBalances) return "••••••"
    const safeBalance = balance ?? 0
    return safeBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700"
      case "pending":
        return "bg-yellow-100 text-yellow-700"
      case "failed":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getRelativeTime = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return "Yesterday"
    return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  // Show skeleton while loading
  if (!isLoaded) {
    return <AccountsSkeleton />
  }

  return (
    <section 
      className="space-y-4" 
      role="region" 
      aria-label="Account balances and transactions"
    >
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg font-bold text-[#0a4fa6]">Accounts</h2>
        <Button
          variant="ghost"
          size="sm"
          className="text-[#0a4fa6] gap-1 min-h-[44px] focus-visible:ring-2 focus-visible:ring-[#0a4fa6] focus-visible:ring-offset-2"
          onClick={() => setShowBalances(!showBalances)}
          aria-pressed={showBalances}
          aria-label={showBalances ? "Hide account balances" : "Show account balances"}
        >
          {showBalances ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
          {showBalances ? "Hide" : "Show"}
        </Button>
      </div>

      <Card className="chase-card-shadow border-0 overflow-hidden">
        <div className="bg-gradient-to-r from-[#0a4fa6] to-[#117aca] px-4 py-3">
          <p className="text-white/80 text-sm">Total Balance</p>
          <p 
            className={cn(
              "text-white text-3xl font-bold transition-all duration-300",
              animatedBalance !== null && "scale-105"
            )}
            aria-live="polite"
            aria-atomic="true"
          >
            ${formatBalance(totalBalance)}
          </p>
          {pendingCount > 0 && (
            <div className="flex items-center gap-1 mt-1" role="status">
              <Clock className="h-3 w-3 text-yellow-300" aria-hidden="true" />
              <span className="text-yellow-200 text-xs">
                {pendingCount} pending transaction{pendingCount > 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      </Card>

      <Card className="chase-card-shadow border-0 overflow-hidden">
        <div className="bg-[#0a4fa6] px-4 py-2">
          <h3 className="text-white font-medium text-sm">Bank Accounts ({accounts.length})</h3>
        </div>
        <CardContent className="p-0 divide-y divide-border">
          {accounts.length > 0 ? (
            accounts.map((account) => (
              <button
                key={account.id}
                className="w-full text-left p-4 hover:bg-muted/50 transition-all duration-150 active:bg-muted/70 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0a4fa6]"
                onClick={onViewAccount}
                aria-label={`${account.name || account.account_type || 'Account'}, available balance ${showBalances ? `$${formatBalance(account.availableBalance ?? account.balance)}` : 'hidden'}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {account.name || account.account_type || 'Account'}
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {account.account_number ? formatAccountNumberDisplay(account.account_number) : 'Account'}
                  </span>
                  <div className="text-right">
                    <span className="text-xl font-bold">
                      ${formatBalance(account.availableBalance ?? account.balance)}
                    </span>
                    <p className="text-xs text-muted-foreground">Available balance</p>
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="p-6 text-center">
              <Wallet className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" aria-hidden="true" />
              <p className="text-sm font-medium text-muted-foreground">No accounts yet</p>
              <p className="text-xs text-muted-foreground mt-1">Add an account to get started</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="chase-card-shadow border-0">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[#0a4fa6]">Recent Transactions</h3>
            <Button
              variant="ghost"
              size="sm"
              className="text-[#0a4fa6] text-xs h-auto p-2 hover:underline focus-visible:ring-2 focus-visible:ring-[#0a4fa6] focus-visible:ring-offset-2"
              onClick={onSeeAllTransactions}
              aria-label="See all transactions"
            >
              See All
            </Button>
          </div>
          <ul className="space-y-1" role="list" aria-label="Recent transactions">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((tx) => (
                <li key={tx.id}>
                  <button
                    className="w-full flex items-center justify-between py-3 border-b last:border-0 hover:bg-muted/50 rounded-lg px-2 transition-all duration-150 text-left active:bg-muted/70 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0a4fa6] focus-visible:ring-offset-2"
                    onClick={() => onReceiptOpen(tx.id)}
                    aria-label={`${tx.description}, ${tx.type === 'credit' ? 'received' : 'spent'} $${tx.amount.toFixed(2)}, ${tx.status}, ${getRelativeTime(tx.date)}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-9 w-9 rounded-full flex items-center justify-center ${
                          tx.type === "credit" ? "bg-green-100" : "bg-red-50"
                        }`}
                        aria-hidden="true"
                      >
                        {tx.type === "credit" ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium truncate max-w-[180px]">{tx.description}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-muted-foreground">{getRelativeTime(tx.date)}</p>
                          <span className={`text-xs px-1.5 py-0.5 rounded ${getStatusColor(tx.status)}`}>
                            {tx.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${tx.type === "credit" ? "text-green-600" : "text-foreground"}`}>
                        {tx.type === "credit" ? "+" : "-"}$
                        {tx.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    </div>
                  </button>
                </li>
              ))
            ) : (
              <li className="text-center py-6">
                <p className="text-sm text-muted-foreground">No recent transactions</p>
                <p className="text-xs text-muted-foreground mt-1">Transactions will appear here when you make payments or receive deposits</p>
              </li>
            )}
          </ul>
        </CardContent>
      </Card>

      {/* Link External Accounts */}
      <Button
        variant="outline"
        className="w-full justify-between bg-card hover:bg-muted/50 border-0 chase-card-shadow h-14 rounded-xl transition-all duration-150 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#0a4fa6] focus-visible:ring-offset-2"
        onClick={onLinkExternal}
        aria-label="Link external bank accounts"
      >
        <span className="font-medium">Link external accounts</span>
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </Button>
    </section>
  )
}
