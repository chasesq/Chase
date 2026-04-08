'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export interface CreditPolicyFormProps {
  userId: string
  onSuccess?: (policyId: string) => void
  onError?: (error: string) => void
}

export function CreditPolicyForm({ userId, onSuccess, onError }: CreditPolicyFormProps) {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const [formData, setFormData] = useState({
    creditLimitAmount: '',
    currency: 'usd',
    paymentInterval: 'monthly' as any,
    paymentDaysDue: '30',
    prefundingEnabled: true,
    prefundingPercentage: '100',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement
      setFormData(prev => ({
        ...prev,
        [name]: target.checked,
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setSubmitted(false)

    try {
      const response = await fetch('/api/credit/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          creditLimitAmount: parseFloat(formData.creditLimitAmount),
          currency: formData.currency,
          paymentInterval: formData.paymentInterval,
          paymentDaysDue: parseInt(formData.paymentDaysDue),
          prefundingEnabled: formData.prefundingEnabled,
          prefundingPercentage: parseFloat(formData.prefundingPercentage),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        onError?.(data.error || 'Failed to create credit policy')
        return
      }

      setSubmitted(true)
      onSuccess?.(data.policyId)

      // Reset form
      setFormData({
        creditLimitAmount: '',
        currency: 'usd',
        paymentInterval: 'monthly',
        paymentDaysDue: '30',
        prefundingEnabled: true,
        prefundingPercentage: '100',
      })
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Credit Policy</h2>

      {submitted && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-medium">Credit policy created successfully!</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Credit Limit */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Credit Limit Amount *
            </label>
            <input
              type="number"
              name="creditLimitAmount"
              value={formData.creditLimitAmount}
              onChange={handleInputChange}
              required
              placeholder="50000"
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Currency
            </label>
            <select
              name="currency"
              value={formData.currency}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="usd">USD</option>
              <option value="eur">EUR</option>
              <option value="gbp">GBP</option>
            </select>
          </div>
        </div>

        {/* Payment Terms */}
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900">Payment Terms</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Interval
              </label>
              <select
                name="paymentInterval"
                value={formData.paymentInterval}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="weekly">Weekly</option>
                <option value="biweekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Days Due After Statement End
              </label>
              <input
                type="number"
                name="paymentDaysDue"
                value={formData.paymentDaysDue}
                onChange={handleInputChange}
                min="1"
                max="120"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Prefunding */}
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900">Prefunding Model</h3>
          <label className="flex items-center">
            <input
              type="checkbox"
              name="prefundingEnabled"
              checked={formData.prefundingEnabled}
              onChange={handleInputChange}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="ml-2 text-gray-700 font-medium">Enable Prefunding</span>
          </label>
          {formData.prefundingEnabled && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prefunding Percentage (%)
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="range"
                  name="prefundingPercentage"
                  value={formData.prefundingPercentage}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  step="5"
                  className="flex-1"
                />
                <span className="text-gray-700 font-medium w-12">
                  {formData.prefundingPercentage}%
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Platform prefunds {formData.prefundingPercentage}% of the credit limit
              </p>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-gray-900 mb-2">Policy Summary</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>
              <span className="font-medium">Credit Limit:</span> ${parseFloat(formData.creditLimitAmount || '0').toLocaleString()} {formData.currency.toUpperCase()}
            </li>
            <li>
              <span className="font-medium">Payment Cycle:</span> {formData.paymentInterval} with {formData.paymentDaysDue} days to pay
            </li>
            <li>
              <span className="font-medium">Prefunding:</span> {formData.prefundingEnabled ? `${formData.prefundingPercentage}% enabled` : 'Disabled'}
            </li>
          </ul>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition"
          >
            {loading ? 'Creating...' : 'Create Credit Policy'}
          </Button>
        </div>
      </form>
    </div>
  )
}
