/**
 * Customer Transactions Page
 * Shows transaction history for authenticated customers
 * Only accessible to customers, not admins
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Card } from '@/components/ui/card'
import { ArrowUpRight, ArrowDownLeft, ArrowRightLeft } from 'lucide-react'

interface Transaction {
  id: string
  description: string
  amount: number
  type: 'credit' | 'debit' | 'transfer'
  status: 'completed' | 'pending' | 'failed'
  created_at: string
  category?: string
}

interface Account {
  id: string
  name: string
  balance: number
  type: string
}

export default function TransactionsPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading, profile } = useAuth()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [selectedAccount, setSelectedAccount] = useState('')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }

    const fetchData = async () => {
      try {
        // Fetch accounts
        const accountsResponse = await fetch('/api/accounts', {
          credentials: 'include',
        })
        const accountsData = await accountsResponse.json()
        const accts = accountsData.accounts || []
        setAccounts(accts)

        if (accts.length > 0) {
          const accountId = accts[0].id
          setSelectedAccount(accountId)

          // Fetch transactions for this account
          const txResponse = await fetch(`/api/transactions?account_id=${accountId}`, {
            credentials: 'include',
          })
          const txData = await txResponse.json()
          setTransactions(txData.transactions || [])
        }
      } catch (err) {
        console.error('Error fetching data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [isAuthenticated, isLoading, router])

  const handleAccountChange = async (accountId: string) => {
    setSelectedAccount(accountId)
    try {
      const response = await fetch(`/api/transactions?account_id=${accountId}`, {
        credentials: 'include',
      })
      const data = await response.json()
      setTransactions(data.transactions || [])
    } catch (err) {
      console.error('Error fetching transactions:', err)
    }
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'credit':
        return <ArrowDownLeft className="h-5 w-5 text-green-600" />
      case 'debit':
        return <ArrowUpRight className="h-5 w-5 text-red-600" />
      case 'transfer':
        return <ArrowRightLeft className="h-5 w-5 text-blue-600" />
      default:
        return null
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'credit':
        return 'text-green-700'
      case 'debit':
        return 'text-red-700'
      case 'transfer':
        return 'text-blue-700'
      default:
        return 'text-foreground'
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    } catch {
      return dateString
    }
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="space-y-4 text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading transactions...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Transactions</h1>
          <p className="text-muted-foreground">View your transaction history</p>
        </div>

        {/* Account Selector */}
        {accounts.length > 0 && (
          <Card className="p-4 mb-6">
            <label className="text-sm font-medium text-foreground mb-2 block">Select Account</label>
            <select
              value={selectedAccount}
              onChange={(e) => handleAccountChange(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
            >
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name} - ${account.balance.toFixed(2)}
                </option>
              ))}
            </select>
          </Card>
        )}

        {/* Transactions List */}
        <Card>
          {transactions.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">No transactions yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="p-4 flex items-center justify-between hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex-shrink-0">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">
                        {transaction.description}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(transaction.created_at)}
                      </p>
                      {transaction.category && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {transaction.category}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                      {transaction.type === 'credit' ? '+' : '-'}${transaction.amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 capitalize">
                      {transaction.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
