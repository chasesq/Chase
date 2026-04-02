'use client'

import { useState, useEffect } from 'react'
import { processPayout, fetchPayoutRecipients } from '@/app/actions/financial-accounts'
import { Send, Loader2, AlertCircle, Check } from 'lucide-react'

interface PayoutFormProps {
  userId: string
  financialAccountId: string
  accountBalance: number
  onSuccess?: () => void
}

interface Recipient {
  id: string
  recipient_name: string
  account_number_masked: string
}

export function PayoutForm({ userId, financialAccountId, accountBalance, onSuccess }: PayoutFormProps) {
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    recipientId: '',
    amount: '',
    description: '',
  })

  useEffect(() => {
    const loadRecipients = async () => {
      try {
        setIsLoading(true)
        const result = await fetchPayoutRecipients(userId)
        if (result.success) {
          setRecipients(result.recipients)
        } else {
          setError(result.error || 'Failed to load recipients')
        }
      } catch (err) {
        setError('Failed to load recipients')
      } finally {
        setIsLoading(false)
      }
    }

    loadRecipients()
  }, [userId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    // Validate
    if (!formData.recipientId || !formData.amount) {
      setError('Recipient and amount are required')
      return
    }

    const amount = parseFloat(formData.amount)
    if (isNaN(amount) || amount <= 0) {
      setError('Amount must be greater than 0')
      return
    }

    if (amount > accountBalance) {
      setError(`Insufficient balance. Available: $${accountBalance.toFixed(2)}`)
      return
    }

    try {
      setIsSubmitting(true)
      const selectedRecipient = recipients.find(r => r.id === formData.recipientId)

      const result = await processPayout(
        userId,
        financialAccountId,
        selectedRecipient?.id || '',
        amount,
        formData.description
      )

      if (result.success) {
        setSuccess(`Payout of $${amount.toFixed(2)} initiated successfully`)
        setFormData({
          recipientId: '',
          amount: '',
          description: '',
        })
        setTimeout(() => {
          onSuccess?.()
        }, 2000)
      } else {
        setError(result.error || 'Failed to process payout')
      }
    } catch (err) {
      setError('An error occurred while processing payout')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
          <span className="text-gray-400">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-6">Initiate Payout</h3>

      {error && (
        <div className="mb-4 p-3 bg-red-950/30 border border-red-700/30 rounded text-sm text-red-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-950/30 border border-green-700/30 rounded text-sm text-green-400 flex items-center gap-2">
          <Check className="w-4 h-4 flex-shrink-0" />
          {success}
        </div>
      )}

      {recipients.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400">No payout recipients configured</p>
          <p className="text-sm text-gray-500 mt-2">Add a recipient first to initiate payouts</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Recipient
            </label>
            <select
              name="recipientId"
              value={formData.recipientId}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:border-emerald-500 focus:outline-none text-sm"
            >
              <option value="">Select a recipient...</option>
              {recipients.map(recipient => (
                <option key={recipient.id} value={recipient.id}>
                  {recipient.recipient_name} (***{recipient.account_number_masked})
                </option>
              ))}
            </select>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded p-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Available Balance:</span>
              <span className="text-emerald-400 font-semibold">${accountBalance.toFixed(2)}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Amount (USD)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-400">$</span>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                min="0.01"
                step="0.01"
                max={accountBalance}
                className="w-full pl-6 pr-3 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description (Optional)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add a note for this payout..."
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none text-sm resize-none"
              rows={3}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !formData.recipientId || !formData.amount}
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 text-white rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Payout
              </>
            )}
          </button>
        </form>
      )}
    </div>
  )
}
