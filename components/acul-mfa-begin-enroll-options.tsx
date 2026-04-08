'use client'

import React from 'react'
import {
  useMfaBeginEnrollOptions,
  useUser,
  useTenant,
  useBranding,
  useClient,
} from '@auth0/auth0-acul-react/mfa-begin-enroll-options'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'

interface ACULMfaBeginEnrollOptionsProps {
  onComplete?: () => void
  onSkip?: () => void
  userId: string
  userEmail: string
}

export function ACULMfaBeginEnrollOptions({
  onComplete,
  onSkip,
  userId,
  userEmail,
}: ACULMfaBeginEnrollOptionsProps) {
  const router = useRouter()
  const { enroll } = useMfaBeginEnrollOptions()
  const user = useUser()
  const tenant = useTenant()
  const branding = useBranding()
  const client = useClient()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mfaOptions = [
    {
      id: 'otp',
      label: 'Authenticator App',
      description: 'Use Google Authenticator, Authy, or Microsoft Authenticator',
      icon: '📱',
    },
    {
      id: 'sms',
      label: 'SMS',
      description: 'Receive verification codes via text message',
      icon: '💬',
    },
    {
      id: 'email',
      label: 'Email',
      description: 'Receive verification codes via email',
      icon: '📧',
    },
    {
      id: 'webauthn',
      label: 'Passkey',
      description: 'Use biometric or security key',
      icon: '🔐',
    },
  ]

  const handleEnrollFactor = async (factorType: 'otp' | 'sms' | 'email' | 'webauthn') => {
    try {
      setIsLoading(true)
      setError(null)

      // Call ACUL's enroll method with the selected factor
      await enroll({
        action: factorType,
      })

      // If successful, trigger completion callback
      onComplete?.()
    } catch (err) {
      console.error('[v0] MFA enrollment error:', err)
      setError(err instanceof Error ? err.message : 'Failed to enroll MFA factor')
      setIsLoading(false)
    }
  }

  const handleSkip = () => {
    onSkip?.()
    router.push('/auth/sign-up-success')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Choose Your Security Method</CardTitle>
        <CardDescription>
          Select how you'd like to add an extra layer of security to your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {mfaOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => handleEnrollFactor(option.id as 'otp' | 'sms' | 'email' | 'webauthn')}
              disabled={isLoading}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-2xl mb-2">{option.icon}</div>
              <h3 className="font-semibold text-sm">{option.label}</h3>
              <p className="text-xs text-gray-600 mt-1">{option.description}</p>
            </button>
          ))}
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="flex gap-2 pt-4">
          <Button
            variant="outline"
            onClick={handleSkip}
            disabled={isLoading}
            className="flex-1"
          >
            Skip for now
          </Button>
        </div>

        <p className="text-xs text-gray-500 text-center">
          You can set up multiple authentication methods later in your security settings.
        </p>
      </CardContent>
    </Card>
  )
}
