'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Check, ArrowLeft } from 'lucide-react'

type PasswordResetStep = 'email' | 'otp' | 'reset' | 'success'

interface PasswordResetFlowProps {
  onComplete?: () => void
  onCancel?: () => void
}

export function PasswordResetFlow({ onComplete, onCancel }: PasswordResetFlowProps) {
  const [step, setStep] = useState<PasswordResetStep>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resendCountdown, setResendCountdown] = useState(0)

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/password-reset/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        throw new Error('Email not found or request failed')
      }

      setStep('otp')
      setResendCountdown(60)
      const countdown = setInterval(() => {
        setResendCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdown)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/password-reset/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      })

      if (!response.ok) {
        throw new Error('Invalid or expired OTP')
      }

      setStep('reset')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/password-reset/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          otp,
          newPassword,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to reset password')
      }

      setStep('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password reset failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/password-reset/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        throw new Error('Failed to resend OTP')
      }

      setResendCountdown(60)
      const countdown = setInterval(() => {
        setResendCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdown)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend OTP')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    if (step === 'otp') setStep('email')
    else if (step === 'reset') setStep('otp')
  }

  // Step 1: Email Entry
  if (step === 'email') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Reset Your Password</CardTitle>
          <CardDescription>Enter your email to receive a reset code</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-medium">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
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
              <Button type="submit" disabled={isLoading || !email} className="flex-1">
                {isLoading ? 'Sending...' : 'Send Code'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    )
  }

  // Step 2: OTP Verification
  if (step === 'otp') {
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
              <CardTitle className="text-lg">Enter Code</CardTitle>
              <CardDescription>Step 1 of 2</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp" className="text-sm">
                Verification Code
              </Label>
              <p className="text-xs text-muted-foreground mb-2">
                Enter the 6-digit code we sent to {email}
              </p>
              <Input
                id="otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="text-center text-2xl tracking-widest font-mono"
                required
                autoFocus
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded text-sm text-red-800 dark:text-red-200">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className="w-full"
            >
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </Button>

            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-2">Didn&apos;t receive the code?</p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleResendOtp}
                disabled={resendCountdown > 0 || isLoading}
                className="text-xs"
              >
                {resendCountdown > 0
                  ? `Resend in ${resendCountdown}s`
                  : 'Resend Code'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    )
  }

  // Step 3: New Password
  if (step === 'reset') {
    const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword
    const passwordStrong = newPassword.length >= 8

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
              <CardTitle className="text-lg">Create New Password</CardTitle>
              <CardDescription>Step 2 of 2</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-sm font-medium">New Password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="text-xs text-muted-foreground">
                At least 8 characters recommended
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-sm font-medium">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {passwordsMatch && passwordStrong && (
              <div className="p-2 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded flex items-center gap-2 text-sm text-green-800 dark:text-green-200">
                <Check className="w-4 h-4" />
                Passwords match
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded text-sm text-red-800 dark:text-red-200">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading || !passwordsMatch || !passwordStrong}
              className="w-full"
            >
              {isLoading ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    )
  }

  // Step 4: Success
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
          <Check className="w-5 h-5" />
          Password Updated
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-200">
            Your password has been successfully updated. You can now sign in with your new password.
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => window.location.href = '/auth/login'}
            className="flex-1"
          >
            Go to Login
          </Button>
          {onComplete && (
            <Button
              onClick={onComplete}
              variant="outline"
              className="flex-1"
            >
              Close
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
