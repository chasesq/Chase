'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, ArrowRightLeft, DollarSign, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AccountCard } from '@/components/account-card'
import { AddFundsModal } from '@/components/add-funds-modal'

interface Account {
  id: string
  name: string
  account_type: string
  account_number: string
  balance: number
  currency?: string
  created_at?: string
}

export default function AccountsPage() {
  const router = useRouter()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalBalance, setTotalBalance] = useState(0)
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [showAddFunds, setShowAddFunds] = useState(false)

  useEffect(() => {
    const checkAuth = () => {
      const isLoggedIn = localStorage.getItem('chase_logged_in') === 'true'
      if (!isLoggedIn) {
        router.push('/auth/login')
        return
      }

      loadAccounts()
    }

    checkAuth()
  }, [router])

  const loadAccounts = async () => {
    try {
      const userId = localStorage.getItem('userId')
      if (!userId) {
        router.push('/auth/login')
        return
      }

      // Simulated account loading - in production, fetch from API
      // For now, we'll create a mock account from localStorage
      const userName = localStorage.getItem('userName') || 'User'
      const userEmail = localStorage.getItem('userEmail') || ''

      // Mock accounts data
      const randomSuffix = crypto.randomUUID().replace(/-/g, '').slice(0, 9).toUpperCase()

      const mockAccounts: Account[] = [
        {
          id: 'checking-' + userId,
          name: 'Chase Checking',
          account_type: 'checking',
          account_number: 'ACC' + randomSuffix,
          balance: 0,
          currency: 'USD',
          created_at: new Date().toISOString(),
        },
      ]

      setAccounts(mockAccounts)
      const total = mockAccounts.reduce((sum, acc) => sum + acc.balance, 0)
      setTotalBalance(total)

      if (mockAccounts.length > 0) {
        setSelectedAccount(mockAccounts[0])
      }
    } catch (error) {
      console.error('[v0] Error loading accounts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block p-3 rounded-full bg-blue-500/20 mb-4">
            <div className="h-8 w-8 border-2 border-blue-500 border-t-blue-400 rounded-full animate-spin" />
          </div>
          <p className="text-slate-300">Loading your accounts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-800/50 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Your Accounts</h1>
              <p className="text-slate-400 mt-1">Manage and monitor your banking accounts</p>
            </div>
            <Button
              onClick={() => alert('Create account feature coming soon')}
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Account
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Total Balance Card */}
        <div className="mb-8 bg-gradient-to-br from-emerald-600 to-emerald-500 rounded-lg p-8 text-white shadow-lg">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-emerald-100 text-sm font-medium mb-2">Total Balance</p>
              <h2 className="text-5xl font-bold tracking-tight">${totalBalance.toFixed(2)}</h2>
            </div>
            <div className="p-3 rounded-lg bg-white/20">
              <DollarSign className="h-8 w-8 text-white" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-emerald-400/30">
            <div>
              <p className="text-emerald-100 text-xs font-medium mb-1">Accounts</p>
              <p className="text-2xl font-bold text-white">{accounts.length}</p>
            </div>
            <div>
              <p className="text-emerald-100 text-xs font-medium mb-1">Average Balance</p>
              <p className="text-2xl font-bold text-white">${(totalBalance / accounts.length).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-emerald-100 text-xs font-medium mb-1">Account Health</p>
              <p className="text-2xl font-bold text-white">
                {totalBalance === 0 ? '⚠️ Empty' : '✓ Good'}
              </p>
            </div>
          </div>
        </div>

        {/* Accounts Grid */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Checking Account</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {accounts.map(account => (
              <AccountCard
                key={account.id}
                id={account.id}
                name={account.name}
                type={account.account_type as 'checking' | 'savings' | 'money_market'}
                accountNumber={account.account_number}
                balance={account.balance}
                currency={account.currency}
                onSelect={() => setSelectedAccount(account)}
                onAddFunds={() => {
                  setSelectedAccount(account)
                  setShowAddFunds(true)
                }}
                onTransfer={() => {
                  alert('Transfer feature coming soon')
                }}
              />
            ))}
          </div>
        </div>

        {/* Empty State */}
        {accounts.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No accounts yet</h3>
            <p className="text-slate-400 mb-6">Create your first account to get started</p>
            <Button
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white"
              onClick={() => alert('Create account feature coming soon')}
            >
              Create Account
            </Button>
          </div>
        )}

        {/* Recent Activity Section */}
        {accounts.length > 0 && (
          <div className="mt-8 p-6 rounded-lg border border-slate-700 bg-slate-800/30 backdrop-blur">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={() => setShowAddFunds(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white h-12 justify-start gap-3 text-base"
              >
                <Plus className="h-5 w-5" />
                Add Funds to {selectedAccount?.name}
              </Button>
              <Button
                onClick={() => alert('Transfer feature coming soon')}
                className="bg-purple-600 hover:bg-purple-500 text-white h-12 justify-start gap-3 text-base"
              >
                <ArrowRightLeft className="h-5 w-5" />
                Transfer Funds
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Add Funds Modal */}
      <AddFundsModal
        isOpen={showAddFunds}
        onClose={() => setShowAddFunds(false)}
        accountId={selectedAccount?.id}
        accountName={selectedAccount?.name}
        onSuccess={loadAccounts}
      />
    </div>
  )
}
