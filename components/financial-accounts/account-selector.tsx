'use client'

import { useState, useEffect } from 'react'
import { fetchUserFinancialAccounts } from '@/app/actions/financial-accounts'
import { ChevronDown, DollarSign, Loader2 } from 'lucide-react'

interface Account {
  id: string
  stripe_account_id: string
  account_name: string
  balance: number
  currency: string
  status: string
}

interface AccountSelectorProps {
  userId: string
  onSelect: (account: Account) => void
  selectedId?: string
}

export function FinancialAccountSelector({ userId, onSelect, selectedId }: AccountSelectorProps) {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        setIsLoading(true)
        const result = await fetchUserFinancialAccounts(userId)
        if (result.success) {
          setAccounts(result.accounts)
          if (result.accounts.length > 0 && !selectedId) {
            onSelect(result.accounts[0])
          }
        } else {
          setError(result.error || 'Failed to load accounts')
        }
      } catch (err) {
        setError('Failed to load accounts')
      } finally {
        setIsLoading(false)
      }
    }

    loadAccounts()
  }, [userId])

  const selected = accounts.find(a => a.id === selectedId) || accounts[0]

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 border border-gray-700 rounded-lg bg-gray-900">
        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
        <span className="text-sm text-gray-400">Loading accounts...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-3 py-2 border border-red-700/30 rounded-lg bg-red-950/20">
        <span className="text-sm text-red-400">{error}</span>
      </div>
    )
  }

  if (accounts.length === 0) {
    return (
      <div className="px-3 py-2 border border-gray-700 rounded-lg bg-gray-900">
        <span className="text-sm text-gray-400">No financial accounts available</span>
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 border border-gray-700 rounded-lg bg-gray-900 hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-emerald-500" />
          <div className="text-left">
            <div className="text-sm font-medium text-white">{selected?.account_name}</div>
            <div className="text-xs text-gray-400">${(selected?.balance || 0).toFixed(2)}</div>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 border border-gray-700 rounded-lg bg-gray-900 z-50">
          {accounts.map(account => (
            <button
              key={account.id}
              onClick={() => {
                onSelect(account)
                setIsOpen(false)
              }}
              className={`w-full text-left px-3 py-2 border-b border-gray-800 last:border-0 hover:bg-gray-800 transition-colors ${
                selected?.id === account.id ? 'bg-emerald-950/30' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-white">{account.account_name}</div>
                  <div className="text-xs text-gray-400">{account.stripe_account_id.slice(0, 8)}...</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-emerald-400">${account.balance.toFixed(2)}</div>
                  <div className={`text-xs ${account.status === 'active' ? 'text-green-400' : 'text-gray-400'}`}>
                    {account.status}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
