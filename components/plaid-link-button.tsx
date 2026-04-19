'use client'

import { useState, useCallback } from 'react'
import { AlertCircle, Loader2, Link2 } from 'lucide-react'

declare global {
  interface Window {
    Plaid?: any
  }
}

interface PlaidLinkButtonProps {
  onSuccess?: () => void
  onError?: (error: string) => void
  className?: string
}

export function PlaidLinkButton({
  onSuccess,
  onError,
  className = '',
}: PlaidLinkButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateLinkToken = useCallback(async () => {
    try {
      setError(null)
      setIsLoading(true)

      // Call backend to generate link token
      const response = await fetch('/api/plaid/link-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to generate link token')
      }

      const { link_token } = await response.json()

      // Load Plaid Link script if not already loaded
      if (!window.Plaid) {
        const script = document.createElement('script')
        script.src = 'https://cdn.plaid.com/link/v3/stable/link-initialize.js'
        script.async = true
        script.onload = () => {
          if (window.Plaid) {
            openPlaidLink(link_token)
          }
        }
        script.onerror = () => {
          setError('Failed to load Plaid Link')
          setIsLoading(false)
        }
        document.body.appendChild(script)
      } else {
        openPlaidLink(link_token)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      onError?.(message)
      setIsLoading(false)
    }
  }, [onError])

  const openPlaidLink = useCallback((linkToken: string) => {
    if (!window.Plaid) {
      setError('Plaid Link is not available')
      setIsLoading(false)
      return
    }

    try {
      const handler = window.Plaid.create({
        token: linkToken,
        onSuccess: async (publicToken: string, metadata: any) => {
          try {
            // Exchange public token for access token
            const response = await fetch('/api/plaid/exchange-token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                public_token: publicToken,
                institution: metadata.institution,
              }),
            })

            if (!response.ok) {
              const data = await response.json()
              throw new Error(data.error || 'Failed to link account')
            }

            setError(null)
            setIsLoading(false)
            onSuccess?.()
          } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error'
            setError(message)
            onError?.(message)
            setIsLoading(false)
          }
        },
        onExit: (err: any, metadata: any) => {
          setIsLoading(false)
          if (err) {
            const message = err.error_message || 'Failed to link account'
            setError(message)
            onError?.(message)
          }
        },
      })

      handler.open()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to open Plaid Link'
      setError(message)
      onError?.(message)
      setIsLoading(false)
    }
  }, [onSuccess, onError])

  return (
    <div>
      <button
        onClick={generateLinkToken}
        disabled={isLoading}
        className={`inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors ${className}`}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Link2 className="w-4 h-4" />
        )}
        {isLoading ? 'Connecting...' : 'Connect Bank Account'}
      </button>

      {error && (
        <div className="mt-3 flex items-gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
    </div>
  )
}
