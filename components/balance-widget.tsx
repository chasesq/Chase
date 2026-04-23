'use client'

import { useState, useEffect } from 'react'
import { Eye, EyeOff, TrendingUp, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface BalanceWidgetProps {
  balance: number
  accountName?: string
  accountType?: string
  isLoading?: boolean
  onAddFunds?: () => void
  onTransfer?: () => void
}

export function BalanceWidget({
  balance,
  accountName = 'Checking Account',
  accountType = 'checking',
  isLoading = false,
  onAddFunds,
  onTransfer,
}: BalanceWidgetProps) {
  const [isBalanceVisible, setIsBalanceVisible] = useState(true)
  const [displayBalance, setDisplayBalance] = useState(balance)

  useEffect(() => {
    if (!isLoading) {
      setDisplayBalance(balance)
    }
  }, [balance, isLoading])

  return (
    <div className="bg-gradient-to-br from-blue-600 to-blue-500 rounded-lg p-6 text-white shadow-lg overflow-hidden relative">
      {/* Decorative Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full -ml-16 -mb-16" />
      </div>

      {/* Content */}
      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-blue-100 text-sm font-medium mb-1">{accountName}</p>
            <p className="text-xs text-blue-200 capitalize">{accountType} Account</p>
          </div>
          <div className="p-2.5 rounded-lg bg-white/20 backdrop-blur">
            <Wallet className="h-5 w-5 text-white" />
          </div>
        </div>

        {/* Balance Display */}
        <div className="space-y-2">
          <p className="text-blue-100 text-sm">Current Balance</p>
          <div className="flex items-center gap-3">
            {isLoading ? (
              <div className="h-10 w-32 bg-white/20 rounded animate-pulse" />
            ) : (
              <p className={cn(
                'text-4xl font-bold tracking-tight',
                isBalanceVisible ? 'text-white' : 'text-blue-200'
              )}>
                {isBalanceVisible ? `$${displayBalance.toFixed(2)}` : '••••••'}
              </p>
            )}
            <button
              onClick={() => setIsBalanceVisible(!isBalanceVisible)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label={isBalanceVisible ? 'Hide balance' : 'Show balance'}
            >
              {isBalanceVisible ? (
                <Eye className="h-5 w-5 text-white" />
              ) : (
                <EyeOff className="h-5 w-5 text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Status Indicator */}
        {displayBalance === 0 && (
          <div className="p-3 rounded-lg bg-white/20 backdrop-blur border border-white/30">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-white" />
              <p className="text-sm text-white font-medium">Get started by adding funds</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button
            onClick={onAddFunds}
            className="bg-white text-blue-600 hover:bg-blue-50 font-semibold h-10"
          >
            Add Funds
          </Button>
          <Button
            onClick={onTransfer}
            variant="outline"
            className="border-white/30 text-white hover:bg-white/20 font-semibold h-10"
          >
            Transfer
          </Button>
        </div>
      </div>
    </div>
  )
}
