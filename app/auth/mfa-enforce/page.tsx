'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, Shield, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'

export default function MFAEnforcePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [step, setStep] = useState<'intro' | 'method' | 'complete'>('intro')

  const missingFactors = searchParams.get('missing_factors')?.split(',') || []
  const gracePeriodExpires = searchParams.get('grace_period_expires')

  const factorDescriptions: Record<string, { name: string; description: string; icon: string }> = {
    totp: {
      name: 'Authenticator App',
      description: 'Use an authenticator app like Google Authenticator or Authy',
      icon: '📱',
    },
    sms: {
      name: 'SMS Text Message',
      description: 'Receive verification codes via SMS to your phone',
      icon: '💬',
    },
    passkey: {
      name: 'Passkey',
      description: 'Use biometric authentication or security keys',
      icon: '🔑',
    },
    email: {
      name: 'Email',
      description: 'Receive verification codes via email',
      icon: '📧',
    },
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="w-full max-w-md p-4">
        {step === 'intro' && (
          <div className="space-y-6">
            <div className="text-center">
              <Shield className="w-16 h-16 mx-auto mb-4 text-blue-600" />
              <h1 className="text-2xl font-bold mb-2">MFA Required</h1>
              <p className="text-muted-foreground">
                To access your account, please set up multi-factor authentication
              </p>
            </div>

            {gracePeriodExpires && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Grace period expired on {new Date(gracePeriodExpires).toLocaleDateString()}
                </AlertDescription>
              </Alert>
            )}

            <Card className="p-6 space-y-4">
              <h2 className="font-semibold">Required Methods:</h2>
              <div className="space-y-2">
                {missingFactors.map((factor) => {
                  const desc = factorDescriptions[factor as keyof typeof factorDescriptions]
                  return (
                    <div key={factor} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <span className="text-xl">{desc?.icon}</span>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{desc?.name}</p>
                        <p className="text-xs text-muted-foreground">{desc?.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>

            <Button onClick={() => setStep('method')} size="lg" className="w-full">
              Continue to Setup
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              This is a mandatory security requirement for your account
            </p>
          </div>
        )}

        {step === 'method' && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold">Choose Setup Method</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Select one of the required methods to add
              </p>
            </div>

            <div className="space-y-2">
              {missingFactors.map((factor) => {
                const desc = factorDescriptions[factor as keyof typeof factorDescriptions]
                return (
                  <Card
                    key={factor}
                    className="p-4 cursor-pointer hover:border-blue-400 transition"
                    onClick={() => {
                      router.push(`/auth/mfa-enroll?method=${factor}`)
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{desc?.icon}</span>
                        <div>
                          <p className="font-medium">{desc?.name}</p>
                          <p className="text-xs text-muted-foreground">{desc?.description}</p>
                        </div>
                      </div>
                      <span className="text-blue-600">→</span>
                    </div>
                  </Card>
                )
              })}
            </div>

            <Button
              variant="outline"
              onClick={() => setStep('intro')}
              className="w-full"
            >
              Back
            </Button>
          </div>
        )}

        {step === 'complete' && (
          <div className="text-center space-y-4">
            <CheckCircle2 className="w-16 h-16 mx-auto text-green-600" />
            <div>
              <h1 className="text-2xl font-bold">Setup Complete</h1>
              <p className="text-muted-foreground mt-2">
                Your account is now secured with multi-factor authentication
              </p>
            </div>
            <Button
              onClick={() => router.push('/dashboard')}
              className="w-full"
            >
              Continue to Dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
