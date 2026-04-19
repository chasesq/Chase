'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, CheckCircle, Loader2, Trash2 } from 'lucide-react'
import { PlaidLinkButton } from '@/components/plaid-link-button'

interface LinkedBank {
  id: number
  institution_name: string
  item_id: string
  linked_at: string
}

export default function ConnectBankPage() {
  const router = useRouter()
  const [linkedBanks, setLinkedBanks] = useState<LinkedBank[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Fetch linked banks
  const fetchLinkedBanks = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/plaid/linked-banks')

      if (!response.ok) {
        throw new Error('Failed to fetch linked banks')
      }

      const data = await response.json()
      setLinkedBanks(data.banks || [])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLinkedBanks()
  }, [])

  const handleSuccess = () => {
    setSuccess('Bank account linked successfully!')
    setError(null)
    // Refresh list
    fetchLinkedBanks()
    // Clear success message after 3 seconds
    setTimeout(() => setSuccess(null), 3000)
  }

  const handleError = (errorMessage: string) => {
    setError(errorMessage)
    setSuccess(null)
  }

  const handleUnlink = async (itemId: string) => {
    if (!confirm('Are you sure you want to unlink this bank account?')) {
      return
    }

    try {
      const response = await fetch(`/api/plaid/unlink?item_id=${itemId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to unlink account')
      }

      setSuccess('Bank account unlinked successfully')
      setError(null)
      fetchLinkedBanks()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Connect Your Bank</h1>
          <p className="mt-2 text-gray-600">
            Securely link your bank account to see transactions and balances in real time.
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-4 flex items-gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 flex items-gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Plaid Link Button */}
        <div className="mb-8">
          <PlaidLinkButton
            onSuccess={handleSuccess}
            onError={handleError}
            className="w-full justify-center"
          />
        </div>

        {/* Linked Banks Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Connected Accounts
          </h2>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">Loading...</span>
            </div>
          ) : linkedBanks.length === 0 ? (
            <div className="p-4 bg-gray-100 rounded-lg text-center">
              <p className="text-gray-600">No accounts linked yet</p>
              <p className="text-sm text-gray-500 mt-1">
                Connect a bank account to get started
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {linkedBanks.map((bank) => (
                <div
                  key={bank.id}
                  className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {bank.institution_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Linked {new Date(bank.linked_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleUnlink(bank.item_id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    aria-label="Unlink bank account"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Security Note */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <p className="text-xs text-gray-700">
            <strong>Security:</strong> Your bank credentials are secured by Plaid and never shared with us. We only access account information with your permission.
          </p>
        </div>
      </div>
    </div>
  )
}
