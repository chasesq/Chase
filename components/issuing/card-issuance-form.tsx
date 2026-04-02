'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

export interface CardIssuanceFormProps {
  onSuccess?: (cardId: string) => void
  onError?: (error: string) => void
}

export function CardIssuanceForm({ onSuccess, onError }: CardIssuanceFormProps) {
  const [cardholders, setCardholders] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingCardholders, setLoadingCardholders] = useState(true)
  const [submitted, setSubmitted] = useState(false)

  const [formData, setFormData] = useState({
    cardholderId: '',
    cardType: 'virtual' as 'virtual' | 'physical',
    spendingLimitAmount: '',
    spendingLimitInterval: 'monthly' as any,
    shippingAddress: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'US',
    },
  })

  // Load cardholders on mount
  useEffect(() => {
    const loadCardholders = async () => {
      try {
        const response = await fetch('/api/issuing/cardholders?limit=100')
        const data = await response.json()
        if (data.success) {
          setCardholders(data.cardholders || [])
        }
      } catch (error) {
        console.error('Failed to load cardholders:', error)
      } finally {
        setLoadingCardholders(false)
      }
    }

    loadCardholders()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    if (name.startsWith('shipping_')) {
      const field = name.replace('shipping_', '')
      setFormData(prev => ({
        ...prev,
        shippingAddress: { ...prev.shippingAddress, [field]: value },
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
      const response = await fetch('/api/issuing/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardholderId: formData.cardholderId,
          cardType: formData.cardType,
          spendingLimitAmount: formData.spendingLimitAmount ? parseFloat(formData.spendingLimitAmount) : undefined,
          spendingLimitInterval: formData.spendingLimitInterval,
          shippingAddress: formData.cardType === 'physical' ? formData.shippingAddress : undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        onError?.(data.error || 'Failed to issue card')
        return
      }

      setSubmitted(true)
      onSuccess?.(data.cardId)

      // Reset form
      setFormData({
        cardholderId: '',
        cardType: 'virtual',
        spendingLimitAmount: '',
        spendingLimitInterval: 'monthly',
        shippingAddress: {
          line1: '',
          line2: '',
          city: '',
          state: '',
          postalCode: '',
          country: 'US',
        },
      })
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Issue Card</h2>

      {submitted && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-medium">Card issued successfully!</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cardholder Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cardholder *
          </label>
          {loadingCardholders ? (
            <div className="px-3 py-2 text-gray-500">Loading cardholders...</div>
          ) : (
            <select
              name="cardholderId"
              value={formData.cardholderId}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a cardholder</option>
              {cardholders.map((ch: any) => (
                <option key={ch.id} value={ch.id}>
                  {ch.name || ch.email}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Card Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Card Type *
          </label>
          <div className="flex gap-6">
            <label className="flex items-center">
              <input
                type="radio"
                name="cardType"
                value="virtual"
                checked={formData.cardType === 'virtual'}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600"
              />
              <span className="ml-2 text-gray-700">Virtual Card</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="cardType"
                value="physical"
                checked={formData.cardType === 'physical'}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600"
              />
              <span className="ml-2 text-gray-700">Physical Card</span>
            </label>
          </div>
        </div>

        {/* Spending Limit */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Spending Limit Amount
            </label>
            <input
              type="number"
              name="spendingLimitAmount"
              value={formData.spendingLimitAmount}
              onChange={handleInputChange}
              placeholder="e.g., 5000"
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Spending Interval
            </label>
            <select
              name="spendingLimitInterval"
              value={formData.spendingLimitInterval}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="per_transaction">Per Transaction</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
              <option value="all_time">All Time</option>
            </select>
          </div>
        </div>

        {/* Shipping Address (for physical cards) */}
        {formData.cardType === 'physical' && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900">Shipping Address</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Street Address Line 1 *
              </label>
              <input
                type="text"
                name="shipping_line1"
                value={formData.shippingAddress.line1}
                onChange={handleInputChange}
                required={formData.cardType === 'physical'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Street Address Line 2
              </label>
              <input
                type="text"
                name="shipping_line2"
                value={formData.shippingAddress.line2}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  name="shipping_city"
                  value={formData.shippingAddress.city}
                  onChange={handleInputChange}
                  required={formData.cardType === 'physical'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State *
                </label>
                <input
                  type="text"
                  name="shipping_state"
                  value={formData.shippingAddress.state}
                  onChange={handleInputChange}
                  required={formData.cardType === 'physical'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Postal Code *
                </label>
                <input
                  type="text"
                  name="shipping_postalCode"
                  value={formData.shippingAddress.postalCode}
                  onChange={handleInputChange}
                  required={formData.cardType === 'physical'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <select
                  name="shipping_country"
                  value={formData.shippingAddress.country}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="MX">Mexico</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition"
          >
            {loading ? 'Issuing...' : 'Issue Card'}
          </Button>
        </div>
      </form>
    </div>
  )
}
