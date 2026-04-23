'use client'

import { CreditCard, ArrowRightLeft, Plus, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface AccountCardProps {
  id: string
  name: string
  type: 'checking' | 'savings' | 'money_market'
  accountNumber: string
  balance: number
  currency?: string
  isLoading?: boolean
  onSelect?: () => void
  onTransfer?: () => void
  onAddFunds?: () => void
}

export function AccountCard({
  id,
  name,
  type,
  accountNumber,
  balance,
  currency = 'USD',
  isLoading = false,
  onSelect,
  onTransfer,
  onAddFunds,
}: AccountCardProps) {
  const accountColors = {
    checking: 'from-blue-600 to-blue-500',
    savings: 'from-emerald-600 to-emerald-500',
    money_market: 'from-purple-600 to-purple-500',
  }

  const accountIcons = {
    checking: '💳',
    savings: '🏦',
    money_market: '📈',
  }

  return (
    <div
      onClick={onSelect}
      className={cn(
        'group relative overflow-hidden rounded-lg border border-slate-700 bg-slate-800/50 transition-all duration-300 hover:border-slate-600 cursor-pointer',
        onSelect && 'hover:shadow-lg hover:shadow-blue-500/20'
      )}
    >
      {/* Card Background */}
      <div className={cn(
        'absolute inset-0 bg-gradient-to-br opacity-20',
        accountColors[type]
      )} />

      {/* Content */}
      <div className="relative p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="text-2xl">{accountIcons[type]}</div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white text-sm truncate">{name}</h3>
              <p className="text-xs text-slate-400 capitalize">{type.replace('_', ' ')} Account</p>
            </div>
          </div>
          <button className="p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-700/50 rounded-lg">
            <MoreVertical className="h-4 w-4 text-slate-400" />
          </button>
        </div>

        {/* Account Number */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-400">Account Number</p>
          <p className="text-sm font-mono text-slate-300">...{accountNumber.slice(-4)}</p>
        </div>

        {/* Balance */}
        <div className="pt-2 border-t border-slate-700/50">
          <p className="text-xs text-slate-400 mb-1">Balance</p>
          {isLoading ? (
            <div className="h-8 w-32 bg-slate-700/50 rounded animate-pulse" />
          ) : (
            <p className="text-2xl font-bold text-white">
              {currency === 'USD' ? '$' : currency + ' '}
              {balance.toFixed(2)}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onTransfer?.()
            }}
            className="bg-blue-600/80 hover:bg-blue-600 text-white text-xs h-8"
          >
            <ArrowRightLeft className="h-3.5 w-3.5 mr-1" />
            Transfer
          </Button>
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onAddFunds?.()
            }}
            className="bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs h-8"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Funds
          </Button>
        </div>
      </div>
    </div>
  )
}
