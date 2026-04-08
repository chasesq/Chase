'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface MFASetupFormProps {
  userId: string
  userEmail: string
  onSkip?: () => void
  onComplete?: () => void
}

interface TOTPSetup {
  secret: string
  qrCode: string
  backupCodes: string[]
}

export function MFASetupForm({ userId, userEmail, onSkip, onComplete }: MFASetupFormProps) {
  const router = useRouter()
  const [totpSetup, setTOTPSetup] = useState<TOTPSetup | null>(null)
  const [verifyCode, setVerifyCode] = useState('')
  const [backupCodesVisible, setBackupCodesVisible] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'setup' | 'verify' | 'backup'>('setup')

  // Generate TOTP secret and QR code on mount
  useEffect(() => {
    const generateSetup = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch('/api/auth/2fa/setup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: userEmail,
            action: 'generate',
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to generate TOTP setup')
        }

        const data = await response.json()
        setTOTPSetup(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate setup')
      } finally {
        setIsLoading(false)
      }
    }

    generateSetup()
  }, [userEmail])

  const handleVerifyCode = async () => {
    if (!verifyCode || !totpSetup) {
      setError('Please enter the 6-digit code')
      return
    }

    if (verifyCode.length !== 6 || !/^\d+$/.test(verifyCode)) {
      setError('Code must be 6 digits')
      return
    }

    try {
      setIsVerifying(true)
      setError(null)

      // Verify the TOTP code before enabling
      const verifyResponse = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          code: verifyCode,
          secret: totpSetup.secret,
        }),
      })

      if (!verifyResponse.ok) {
        throw new Error('Invalid verification code')
      }

      // Code is valid, move to backup codes step
      setStep('backup')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleEnableMFA = async () => {
    if (!totpSetup) return

    try {
      setIsLoading(true)
      setError(null)

      // Enable MFA with backup codes
      const enableResponse = await fetch('/api/auth/2fa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          action: 'enable',
          secret: totpSetup.secret,
          backupCodes: totpSetup.backupCodes,
        }),
      })

      if (!enableResponse.ok) {
        throw new Error('Failed to enable MFA')
      }

      // Redirect to success page
      onComplete?.()
      router.push('/auth/mfa-setup-complete')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enable MFA')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = () => {
    onSkip?.()
    router.push('/auth/sign-up-success')
  }

  const copyBackupCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  if (isLoading && !totpSetup) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Setting up 2FA</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p>Generating your authentication setup...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Secure Your Account with 2FA</CardTitle>
        <CardDescription>
          Two-factor authentication adds an extra layer of security to your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {step === 'setup' && totpSetup && (
          <>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Step 1: Scan QR Code</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Use an authenticator app (Google Authenticator, Authy, Microsoft Authenticator, etc.) to scan this QR code:
                </p>
                <div className="flex justify-center p-4 bg-gray-50 rounded-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={totpSetup.qrCode} alt="QR Code" className="w-48 h-48" />
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Step 2: Enter Code</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Enter the 6-digit code from your authenticator app:
                </p>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="000000"
                    maxLength={6}
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                    className="text-center text-2xl tracking-widest"
                  />
                  <Button
                    onClick={handleVerifyCode}
                    disabled={isVerifying || verifyCode.length !== 6}
                  >
                    {isVerifying ? 'Verifying...' : 'Verify'}
                  </Button>
                </div>
              </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSkip} className="flex-1">
                Skip for now
              </Button>
            </div>
          </>
        )}

        {step === 'backup' && totpSetup && (
          <>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Save Backup Codes</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Save these backup codes in a secure location. You can use them to recover your account if you lose access to your authenticator app.
                </p>

                <button
                  onClick={() => setBackupCodesVisible(!backupCodesVisible)}
                  className="mb-4 text-sm text-blue-600 hover:underline"
                >
                  {backupCodesVisible ? 'Hide' : 'Show'} backup codes
                </button>

                {backupCodesVisible && (
                  <div className="space-y-2 p-4 bg-gray-50 rounded-lg border border-gray-200 max-h-64 overflow-y-auto">
                    {totpSetup.backupCodes.map((code, index) => (
                      <div
                        key={index}
                        onClick={() => copyBackupCode(code, index)}
                        className="flex justify-between items-center p-2 hover:bg-gray-100 rounded cursor-pointer transition-colors"
                      >
                        <code className="font-mono text-sm">{code}</code>
                        <span className="text-xs text-gray-500">
                          {copiedIndex === index ? 'Copied!' : 'Click to copy'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep('setup')}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleEnableMFA}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? 'Enabling MFA...' : 'Enable 2FA'}
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
