'use client'

import { useState } from 'react'
import { X, CreditCard, Landmark, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface AddFundsModalProps {
  isOpen: boolean
  onClose: () => void
  accountId?: string
  accountName?: string
  onSuccess?: () => void
}

type DepositMethod = 'bank_transfer' | 'card' | 'check'

export function AddFundsModal({
  isOpen,
  onClose,
  accountId,
  accountName = 'Checking Account',
  onSuccess,
}: AddFundsModalProps) {
  const [step, setStep] = useState<'method' | 'amount' | 'confirm'>('method')
  const [method, setMethod] = useState<DepositMethod | null>(null)
  const [amount, setAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [newBalance, setNewBalance] = useState<number | null>(null)

  if (!isOpen) return null

  const depositMethods = [
    {
      id: 'bank_transfer' as DepositMethod,
      title: 'Bank Transfer',
      description: 'Transfer from another bank account',
      icon: <Landmark className="h-6 w-6" />,
      details: ['1-3 business days', 'No fees'],
    },
    {
      id: 'card' as DepositMethod,
      title: 'Debit Card',
      description: 'Deposit with your debit card',
      icon: <CreditCard className="h-6 w-6" />,
      details: ['Instant', 'Processing fee may apply'],
    },
    {
      id: 'check' as DepositMethod,
      title: 'Mobile Check Deposit',
      description: 'Deposit a check via mobile app',
      icon: <CheckCircle2 className="h-6 w-6" />,
      details: ['24 hours processing', 'No fees'],
    },
  ]

  const handleAmountSubmit = async () => {
    setError(null)

    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount')
      return
    }

    if (numAmount > 1000000) {
      setError('Amount exceeds maximum limit')
      return
    }

    setStep('confirm')
  }

  const handleConfirmDeposit = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const userId = localStorage.getItem('userId')
      if (!userId || !accountId) {
        throw new Error('User or account information missing')
      }

      const numAmount = parseFloat(amount)

      const response = await fetch('/api/funds/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          accountId,
          amount: numAmount,
          method,
          description: `Deposit via ${method === 'bank_transfer' ? 'Bank Transfer' : method === 'card' ? 'Debit Card' : 'Mobile Check Deposit'}`,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process deposit')
      }

      setSuccess(true)
      setNewBalance(data.account?.balance || 0)

      // Refresh after 2 seconds
      setTimeout(() => {
        onSuccess?.()
        handleClose()
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setStep('method')
    setMethod(null)
    setAmount('')
    setError(null)
    setSuccess(false)
    setNewBalance(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-white">Add Funds</h2>
          <button
            onClick={handleClose}
            className="p-1 text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            // Success State
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Deposit Successful</h3>
                <p className="text-sm text-slate-400">
                  ${parseFloat(amount).toFixed(2)} has been added to your account
                </p>
              </div>
              {newBalance !== null && (
                <div className="p-3 rounded-lg bg-slate-700/50 border border-slate-600">
                  <p className="text-xs text-slate-400 mb-1">New Balance</p>
                  <p className="text-lg font-semibold text-emerald-400">${newBalance.toFixed(2)}</p>
                </div>
              )}
            </div>
          ) : step === 'method' ? (
            // Method Selection
            <div className="space-y-3">
              <p className="text-sm text-slate-300 mb-4">Choose your deposit method</p>
              {depositMethods.map((dm) => (
                <button
                  key={dm.id}
                  onClick={() => {
                    setMethod(dm.id)
                    setStep('amount')
                  }}
                  className={cn(
                    'w-full p-4 rounded-lg border transition-all text-left',
                    method === dm.id
                      ? 'bg-blue-500/20 border-blue-500/50'
                      : 'bg-slate-700/30 border-slate-600 hover:bg-slate-700/50'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-slate-700/50 text-slate-300 flex-shrink-0">
                      {dm.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{dm.title}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{dm.description}</p>
                      <div className="flex gap-2 mt-2">
                        {dm.details.map((detail, i) => (
                          <span key={i} className="text-xs text-slate-500 bg-slate-700/50 px-2 py-1 rounded">
                            {detail}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : step === 'amount' ? (
            // Amount Entry
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-300 mb-2">
                  Deposit to <span className="font-semibold">{accountName}</span>
                </p>
                <p className="text-xs text-slate-500">
                  Method: {depositMethods.find(dm => dm.id === method)?.title}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount" className="text-white text-sm">
                  Amount to Deposit
                </Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white font-semibold">$</span>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    max="1000000"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value)
                      setError(null)
                    }}
                    className="pl-8 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-blue-500/50 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {amount && parseFloat(amount) > 0 && (
                <div className="p-3 rounded-lg bg-slate-700/50 border border-slate-600">
                  <p className="text-xs text-slate-400">Deposit Amount</p>
                  <p className="text-lg font-semibold text-white">${parseFloat(amount).toFixed(2)}</p>
                </div>
              )}

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}
            </div>
          ) : (
            // Confirmation
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-300">Deposit Amount:</span>
                  <span className="font-semibold text-white">${parseFloat(amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-300">Method:</span>
                  <span className="font-semibold text-white">
                    {depositMethods.find(dm => dm.id === method)?.title}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm pt-3 border-t border-blue-500/30">
                  <span className="text-slate-300">Total:</span>
                  <span className="text-lg font-semibold text-emerald-400">${parseFloat(amount).toFixed(2)}</span>
                </div>
              </div>

              <p className="text-xs text-slate-400 text-center">
                {method === 'bank_transfer' && 'Funds will be available in 1-3 business days'}
                {method === 'card' && 'Funds will be available immediately'}
                {method === 'check' && 'Funds will be available after 24 hours'}
              </p>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-slate-700">
          {!success && (
            <>
              {step !== 'method' && (
                <Button
                  variant="outline"
                  onClick={() => setStep(step === 'amount' ? 'method' : 'amount')}
                  className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700/50"
                >
                  Back
                </Button>
              )}
              {step === 'method' && (
                <Button
                  onClick={handleClose}
                  className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700/50"
                  variant="outline"
                >
                  Cancel
                </Button>
              )}
              {step === 'amount' && (
                <Button
                  onClick={handleAmountSubmit}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-medium"
                >
                  Review
                </Button>
              )}
              {step === 'confirm' && (
                <Button
                  onClick={handleConfirmDeposit}
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-medium disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    'Confirm Deposit'
                  )}
                </Button>
              )}
            </>
          )}
          {success && (
            <Button
              onClick={handleClose}
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-medium"
            >
              Done
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
