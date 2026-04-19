/**
 * Customer Transfer Page
 * Allows customers to transfer funds between their own accounts
 * Only accessible to authenticated customers
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, AlertCircle } from 'lucide-react'

interface Account {
  id: string
  name: string
  balance: number
  type: string
  account_number?: string
}

export default function TransferPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading, profile } = useAuth()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [selectedFrom, setSelectedFrom] = useState('')
  const [selectedTo, setSelectedTo] = useState('')
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }

    // Fetch user accounts
    const fetchAccounts = async () => {
      try {
        const response = await fetch('/api/accounts', {
          method: 'GET',
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error('Failed to fetch accounts')
        }

        const data = await response.json()
        setAccounts(data.accounts || [])
        
        if (data.accounts && data.accounts.length > 0) {
          setSelectedFrom(data.accounts[0].id)
          if (data.accounts.length > 1) {
            setSelectedTo(data.accounts[1].id)
          }
        }
      } catch (err) {
        console.error('Error fetching accounts:', err)
        setError('Failed to load accounts')
      } finally {
        setLoading(false)
      }
    }

    fetchAccounts()
  }, [isAuthenticated, isLoading, router])

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedFrom || !selectedTo || !amount) {
      setError('Please fill in all fields')
      return
    }

    if (selectedFrom === selectedTo) {
      setError('Source and destination accounts must be different')
      return
    }

    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Amount must be greater than 0')
      return
    }

    const fromAccount = accounts.find(a => a.id === selectedFrom)
    if (!fromAccount || fromAccount.balance < numAmount) {
      setError('Insufficient funds in source account')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/transfers', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from_account_id: selectedFrom,
          to_account_id: selectedTo,
          amount: numAmount,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Transfer failed')
      }

      // Reset form
      setAmount('')
      alert('Transfer completed successfully!')
      
      // Refresh accounts
      const accountsResponse = await fetch('/api/accounts', {
        credentials: 'include',
      })
      const accountsData = await accountsResponse.json()
      setAccounts(accountsData.accounts || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transfer failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="space-y-4 text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Transfer Funds</h1>
          <p className="text-muted-foreground">Transfer money between your accounts</p>
        </div>

        {accounts.length === 0 ? (
          <Card className="p-6">
            <p className="text-muted-foreground">No accounts available. Please create an account first.</p>
          </Card>
        ) : accounts.length === 1 ? (
          <Card className="p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-muted-foreground">You need at least two accounts to make transfers.</p>
            </div>
          </Card>
        ) : (
          <Card className="p-6">
            <form onSubmit={handleTransfer} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* From Account */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">From Account</label>
                <select
                  value={selectedFrom}
                  onChange={(e) => setSelectedFrom(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                  disabled={submitting}
                >
                  <option value="">Select account</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name} - Balance: ${account.balance.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Arrow */}
              <div className="flex justify-center">
                <ArrowRight className="h-6 w-6 text-muted-foreground" />
              </div>

              {/* To Account */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">To Account</label>
                <select
                  value={selectedTo}
                  onChange={(e) => setSelectedTo(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                  disabled={submitting}
                >
                  <option value="">Select account</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name} - Balance: ${account.balance.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground"
                  disabled={submitting}
                />
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full"
                disabled={submitting}
              >
                {submitting ? 'Processing...' : 'Transfer'}
              </Button>
            </form>
          </Card>
        )}

        {/* Recent Transfers */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-foreground mb-4">Your Transfers</h2>
          <Card className="p-6">
            <p className="text-muted-foreground text-center py-8">
              No transfers yet. Make your first transfer above.
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
