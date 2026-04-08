'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useACUL } from '@/lib/auth0/acul-context'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Loader2 } from 'lucide-react'

interface ACULSignupPasswordProps {
  onSuccess?: (response: any) => void
  onError?: (error: Error) => void
  className?: string
}

export function ACULSignupPassword({
  onSuccess,
  onError,
  className,
}: ACULSignupPasswordProps) {
  const { auth0Domain, auth0ClientId, isInitialized } = useACUL()
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isInitialized || !containerRef.current) {
      setIsLoading(false)
      setError('Auth0 configuration is missing')
      return
    }

    const initializeACUL = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Dynamically load and initialize ACUL SDK
        // This uses the auth0-acul-js library to render signup-password screen
        const script = document.createElement('script')
        script.src = `https://${auth0Domain}/acul/index.js`
        script.async = true

        script.onload = () => {
          // Initialize signup-password screen
          if (window.auth0 && window.auth0.acul) {
            const acul = new window.auth0.acul.SignupPassword({
              container: containerRef.current,
              clientId: auth0ClientId,
              domain: auth0Domain,
              onSignupSuccess: (response: any) => {
                console.log('[ACUL] Signup success:', response)
                onSuccess?.(response)
              },
              onError: (error: any) => {
                console.error('[ACUL] Error:', error)
                setError(error.message || 'An error occurred')
                onError?.(error)
              },
            })
          }
        }

        script.onerror = () => {
          setError('Failed to load Auth0 SDK')
          setIsLoading(false)
        }

        document.head.appendChild(script)
        setIsLoading(false)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to initialize signup'
        setError(message)
        onError?.(err instanceof Error ? err : new Error(message))
        setIsLoading(false)
      }
    }

    initializeACUL()
  }, [auth0Domain, auth0ClientId, isInitialized, onSuccess, onError])

  if (!isInitialized) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Auth0 is not configured. Please check your environment variables.</AlertDescription>
      </Alert>
    )
  }

  return (
    <Card className={className}>
      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}

      {error && !isLoading && (
        <Alert variant="destructive" className="m-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div ref={containerRef} className="w-full" />
    </Card>
  )
}

// Declare global window type for ACUL SDK
declare global {
  interface Window {
    auth0?: {
      acul?: {
        SignupPassword: new (config: any) => any
        LoginId: new (config: any) => any
      }
    }
  }
}
