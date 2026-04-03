'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ShieldCheck, Copy, Check, ArrowLeft } from 'lucide-react'

interface MFASetupProps {
  onComplete?: (backupCodes: string[]) => void
  onCancel?: () => void
}

export function MFASetupComponent({ onComplete, onCancel }: MFASetupProps) {
  const [step, setStep] = useState<'intro' | 'qr' | 'verify' | 'backup' | 'complete'>('intro')
  const [qrCode, setQrCode] = useState('')
  const [totpSecret, setTotpSecret] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (step === 'verify' && inputRef.current) {
      inputRef.current.focus()
    }
  }, [step])

  const handleStartSetup = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/auth/mfa/setup', {
        method: 'POST',
      })

      if (!response.ok) throw new Error('Failed to initialize MFA setup')

      const data = await response.json()
      setQrCode(data.qrCode)
      setTotpSecret(data.secret)
      setStep('qr')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code')
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/auth/mfa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: verificationCode,
          secret: totpSecret,
        }),
      })

      if (!response.ok) throw new Error('Invalid verification code')

      const data = await response.json()
      setBackupCodes(data.backupCodes)
      setStep('backup')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyBackupCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const handleCompleteSetup = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/mfa/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backupCodes }),
      })

      if (!response.ok) throw new Error('Failed to complete MFA setup')

      setStep('complete')
      onComplete?.(backupCodes)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Setup failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    if (step === 'qr') setStep('intro')
    else if (step === 'verify') setStep('qr')
    else if (step === 'backup') setStep('verify')
  }

  // Step 1: Introduction
  if (step === 'intro') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" />
            Set Up Two-Factor Authentication
          </CardTitle>
          <CardDescription>Add an extra layer of security to your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg space-y-2">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">What is 2FA?</p>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Two-factor authentication requires a second verification method (like your phone) when you sign in, making your account much more secure.
            </p>
          </div>

          <div className="space-y-2 text-sm">
            <p className="font-medium text-foreground">You&apos;ll need:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>An authenticator app (Google Authenticator, Authy, Microsoft Authenticator)</li>
              <li>Your recovery codes (save them in a safe place)</li>
            </ul>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded text-sm text-red-800 dark:text-red-200">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button onClick={onCancel} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleStartSetup} disabled={isLoading} className="flex-1">
              {isLoading ? 'Loading...' : 'Continue'}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Step 2: QR Code
  if (step === 'qr') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={handleBack}
              className="p-1 hover:bg-muted rounded transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex-1">
              <CardTitle className="text-lg">Scan QR Code</CardTitle>
              <CardDescription>Step 1 of 3</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-white p-4 rounded-lg flex justify-center">
            {qrCode && (
              <img
                src={qrCode}
                alt="MFA QR Code"
                className="w-48 h-48"
              />
            )}
          </div>

          <div className="bg-amber-50 dark:bg-amber-950 p-3 rounded-lg text-sm text-amber-800 dark:text-amber-200">
            Open your authenticator app and scan this QR code
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Can&apos;t scan?</p>
            <p className="text-xs text-muted-foreground break-all font-mono bg-muted p-2 rounded">
              {totpSecret}
            </p>
            <p className="text-xs text-muted-foreground">Enter this code manually in your authenticator app</p>
          </div>

          <Button onClick={() => setStep('verify')} className="w-full">
            I&apos;ve Scanned the Code
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Step 3: Verify Code
  if (step === 'verify') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={handleBack}
              className="p-1 hover:bg-muted rounded transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex-1">
              <CardTitle className="text-lg">Verify Code</CardTitle>
              <CardDescription>Step 2 of 3</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Enter the 6-digit code from your authenticator app:
          </p>

          <div className="space-y-2">
            <Label htmlFor="mfa-code" className="text-sm">
              Authentication Code
            </Label>
            <Input
              ref={inputRef}
              id="mfa-code"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
              className="text-center text-2xl tracking-widest font-mono"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded text-sm text-red-800 dark:text-red-200">
              {error}
            </div>
          )}

          <Button
            onClick={handleVerifyCode}
            disabled={isLoading || verificationCode.length !== 6}
            className="w-full"
          >
            {isLoading ? 'Verifying...' : 'Verify Code'}
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Step 4: Backup Codes
  if (step === 'backup') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1">
              <CardTitle className="text-lg">Save Recovery Codes</CardTitle>
              <CardDescription>Step 3 of 3</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 p-3 rounded-lg">
            <p className="text-sm font-medium text-red-900 dark:text-red-100 mb-2">Important:</p>
            <p className="text-sm text-red-800 dark:text-red-200">
              Save these backup codes in a safe place. You can use them to access your account if you lose access to your authenticator app.
            </p>
          </div>

          <div className="bg-muted p-4 rounded-lg space-y-2 max-h-48 overflow-y-auto">
            {backupCodes.map((code, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 hover:bg-background rounded transition-colors"
              >
                <code className="text-sm font-mono text-foreground">{code}</code>
                <button
                  onClick={() => handleCopyBackupCode(code, index)}
                  className="p-1 hover:bg-background rounded transition-colors"
                  aria-label={`Copy code ${index + 1}`}
                >
                  {copiedIndex === index ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            ))}
          </div>

          <Button
            onClick={handleCompleteSetup}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Completing...' : 'I&apos;ve Saved My Codes'}
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Step 5: Complete
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
          <ShieldCheck className="w-5 h-5" />
          Setup Complete!
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg space-y-2">
          <p className="text-sm font-medium text-green-900 dark:text-green-100">Success!</p>
          <p className="text-sm text-green-800 dark:text-green-200">
            Your account is now protected with two-factor authentication.
          </p>
        </div>

        <div className="text-sm text-muted-foreground space-y-1">
          <p>Next time you sign in, you&apos;ll be asked to enter a code from your authenticator app.</p>
        </div>

        <Button onClick={() => window.location.href = '/auth/profile'} className="w-full">
          Go to Profile
        </Button>
      </CardContent>
    </Card>
  )
}
