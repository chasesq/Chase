'use client'

import React, { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { AlertCircle, Loader2, Check } from 'lucide-react'

interface StepUpAuthModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
  requirementReason?: string
}

export function StepUpAuthModal({
  isOpen,
  onClose,
  onComplete,
  requirementReason = 'to perform this action',
}: StepUpAuthModalProps) {
  const [stage, setStage] = useState<'method' | 'verify'>('method')
  const [verifyMethod, setVerifyMethod] = useState<'totp' | 'backup'>('totp')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleMethodSelect = (method: 'totp' | 'backup') => {
    setVerifyMethod(method)
    setStage('verify')
    setCode('')
    setError(null)
  }

  const handleVerify = async () => {
    if (!code.trim()) {
      setError('Please enter a verification code')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/stepup/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          method: verifyMethod,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Verification failed')
      }

      // Store the step-up token
      const data = await response.json()
      localStorage.setItem('stepUpToken', data.token)
      localStorage.setItem('stepUpExpires', data.expiresAt)

      // Call onComplete and close
      onComplete()
      setTimeout(() => {
        onClose()
        setStage('method')
        setCode('')
        setError(null)
      }, 500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-[#0a4fa6]" />
            Verify Your Identity
          </AlertDialogTitle>
          <AlertDialogDescription>
            Additional verification is required {requirementReason}. Please enter your authentication code.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          {stage === 'method' ? (
            <>
              <p className="text-sm font-medium">Choose verification method:</p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleMethodSelect('totp')}
                  className="h-auto p-3 flex flex-col items-center gap-2"
                >
                  <span className="text-xl">📱</span>
                  <span className="text-xs font-medium">Authenticator</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleMethodSelect('backup')}
                  className="h-auto p-3 flex flex-col items-center gap-2"
                >
                  <span className="text-xl">🔐</span>
                  <span className="text-xs font-medium">Backup Code</span>
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="code" className="text-sm">
                  {verifyMethod === 'totp' ? 'Enter 6-digit code from authenticator' : 'Enter backup code'}
                </Label>
                <Input
                  id="code"
                  type="text"
                  placeholder={verifyMethod === 'totp' ? '000000' : 'XXXX-XXXX-XXXX'}
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.toUpperCase())
                    setError(null)
                  }}
                  disabled={loading}
                  autoComplete="off"
                  maxLength={verifyMethod === 'totp' ? 6 : 15}
                />
              </div>

              {error && (
                <div className="flex gap-2 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStage('method')
                  setCode('')
                  setError(null)
                }}
                className="text-xs"
              >
                Use different method
              </Button>
            </>
          )}
        </div>

        <div className="flex gap-2">
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          {stage === 'verify' && (
            <AlertDialogAction
              onClick={handleVerify}
              disabled={loading || !code.trim()}
              className="bg-[#0a4fa6] hover:bg-[#083d80]"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Verify
                </>
              )}
            </AlertDialogAction>
          )}
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// Add missing Lock icon import
import { Lock } from 'lucide-react'
