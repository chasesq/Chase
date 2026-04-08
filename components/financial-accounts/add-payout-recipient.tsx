'use client'

import { useState } from 'react'
import { registerPayoutRecipient, fetchPayoutRecipients } from '@/app/actions/financial-accounts'
import { Check, X, Loader2 } from 'lucide-react'

interface AddPayoutRecipientProps {
  userId: string
  onSuccess?: () => void
}

export function AddPayoutRecipient({ userId, onSuccess }: AddPayoutRecipientProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    recipientName: '',
    accountHolderName: '',
    routingNumber: '',
    accountNumber: '',
    accountType: 'individual' as const,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
    if (!formData.recipientName || !formData.accountHolderName || !formData.routingNumber || !formData.accountNumber) {
      setError('All fields are required')
      return
    }

    if (formData.routingNumber.length !== 9) {
      setError('Routing number must be 9 digits')
      return
    }

    if (formData.accountNumber.length < 8) {
      setError('Account number must be at least 8 digits')
      return
    }

    try {
      setIsLoading(true)
      const result = await registerPayoutRecipient(
        userId,
        formData.recipientName,
        formData.accountHolderName,
        formData.routingNumber,
        formData.accountNumber,
        formData.accountType
      )

      if (result.success) {
        setSuccess(`Recipient "${formData.recipientName}" added successfully`)
        setFormData({
          recipientName: '',
          accountHolderName: '',
          routingNumber: '',
          accountNumber: '',
          accountType: 'individual',
        })
        setTimeout(() => {
          setIsOpen(false)
          onSuccess?.()
        }, 2000)
      } else {
        setError(result.error || 'Failed to add recipient')
      }
    } catch (err) {
      setError('An error occurred while adding recipient')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors text-sm font-medium"
      >
        + Add Recipient
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Add Payout Recipient</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-950/30 border border-red-700/30 rounded text-sm text-red-400">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-950/30 border border-green-700/30 rounded text-sm text-green-400 flex items-center gap-2">
                <Check className="w-4 h-4" />
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Recipient Name
                </label>
                <input
                  type="text"
                  name="recipientName"
                  value={formData.recipientName}
                  onChange={handleChange}
                  placeholder="e.g., John Doe"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Account Holder Name
                </label>
                <input
                  type="text"
                  name="accountHolderName"
                  value={formData.accountHolderName}
                  onChange={handleChange}
                  placeholder="Name on bank account"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Routing Number
                  </label>
                  <input
                    type="text"
                    name="routingNumber"
                    value={formData.routingNumber}
                    onChange={handleChange}
                    placeholder="9 digits"
                    maxLength={9}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Account Type
                  </label>
                  <select
                    name="accountType"
                    value={formData.accountType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:border-emerald-500 focus:outline-none text-sm"
                  >
                    <option value="individual">Individual</option>
                    <option value="business">Business</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Account Number
                </label>
                <input
                  type="password"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleChange}
                  placeholder="Account number"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none text-sm"
                />
                <p className="text-xs text-gray-400 mt-1">Encrypted and stored securely</p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 text-white rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Recipient'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
