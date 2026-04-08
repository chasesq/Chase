'use client'

import { useState, useEffect } from 'react'
import { fetchUserFinancialAccounts, addFundsToAccount, initializeFinancialAccount } from '@/app/actions/financial-accounts'
import { Plus, DollarSign, TrendingUp, Loader2, Check, AlertCircle } from 'lucide-react'

interface FinancialAccount {
  id: string
  stripe_account_id: string
  account_name: string
  balance: number
  currency: string
  status: string
}

interface FinancialAccountsDashboardProps {
  adminId: string
}

export function FinancialAccountsDashboard({ adminId }: FinancialAccountsDashboardProps) {
  const [accounts, setAccounts] = useState<FinancialAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showAddCredit, setShowAddCredit] = useState<string | null>(null)
  const [creditAmount, setCreditAmount] = useState('')

  useEffect(() => {
    loadAccounts()
  }, [])

  const loadAccounts = async () => {
    try {
      setIsLoading(true)
      const result = await fetchUserFinancialAccounts(adminId)
      if (result.success) {
        setAccounts(result.accounts)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('Failed to load accounts')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateAccount = async () => {
    const name = prompt('Enter account name:', 'Platform Account')
    if (!name) return

    try {
      setIsCreating(true)
      const result = await initializeFinancialAccount(name, adminId)
      if (result.success) {
        setSuccess(`Account "${name}" created successfully`)
        loadAccounts()
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('Failed to create account')
    } finally {
      setIsCreating(false)
    }
  }

  const handleAddCredit = async (accountId: string, stripeAccountId: string) => {
    if (!creditAmount || parseFloat(creditAmount) <= 0) {
      setError('Please enter a valid amount')
      return
    }

    try {
      const result = await addFundsToAccount(accountId, stripeAccountId, parseFloat(creditAmount), 'Admin test credit')
      if (result.success) {
        setSuccess(`Added $${creditAmount} test credit`)
        setCreditAmount('')
        setShowAddCredit(null)
        loadAccounts()
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('Failed to add credit')
    }
  }

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0)

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Balance</p>
              <p className="text-2xl font-bold text-white mt-2">${totalBalance.toFixed(2)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-emerald-500 opacity-20" />
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Accounts</p>
              <p className="text-2xl font-bold text-white mt-2">{accounts.length}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500 opacity-20" />
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <button
            onClick={handleCreateAccount}
            disabled={isCreating}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 text-white rounded-lg transition-colors font-medium"
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                New Account
              </>
            )}
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-4 bg-red-950/30 border border-red-700/30 rounded-lg text-sm text-red-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-950/30 border border-green-700/30 rounded-lg text-sm text-green-400 flex items-center gap-2">
          <Check className="w-4 h-4 flex-shrink-0" />
          {success}
        </div>
      )}

      {/* Accounts List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : accounts.length === 0 ? (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-12 text-center">
          <DollarSign className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-2">No financial accounts created yet</p>
          <p className="text-sm text-gray-500 mb-4">Create your first financial account to get started</p>
          <button
            onClick={handleCreateAccount}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            Create Account
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {accounts.map(account => (
            <div key={account.id} className="bg-gray-900 border border-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-white">{account.account_name}</h4>
                  <p className="text-xs text-gray-400 mt-1">{account.stripe_account_id}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-emerald-400">${account.balance.toFixed(2)}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    account.status === 'active'
                      ? 'bg-green-950/40 text-green-400'
                      : 'bg-gray-800 text-gray-400'
                  }`}>
                    {account.status}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                {showAddCredit === account.id ? (
                  <div className="flex-1 flex gap-2">
                    <input
                      type="number"
                      value={creditAmount}
                      onChange={(e) => setCreditAmount(e.target.value)}
                      placeholder="Amount"
                      min="0.01"
                      step="0.01"
                      className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none text-sm"
                    />
                    <button
                      onClick={() => handleAddCredit(account.id, account.stripe_account_id)}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-sm font-medium transition-colors"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => {
                        setShowAddCredit(null)
                        setCreditAmount('')
                      }}
                      className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-sm font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAddCredit(account.id)}
                    className="flex-1 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Test Credit
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
