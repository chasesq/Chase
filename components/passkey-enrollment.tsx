'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { isWebAuthnSupported, isPlatformAuthenticatorAvailable, getDeviceInfo, arrayBufferToBase64 } from '@/lib/auth/webauthn-utils'
import { Loader2, Key, Smartphone, AlertCircle } from 'lucide-react'

interface PasskeyEnrollmentProps {
  userId: string
  email: string
  onComplete?: (passkeyId: string) => void
}

export function PasskeyEnrollment({ userId, email, onComplete }: PasskeyEnrollmentProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deviceName, setDeviceName] = useState('')
  const [webAuthnSupported, setWebAuthnSupported] = useState(false)
  const [platformAvailable, setPlatformAvailable] = useState(false)
  const [step, setStep] = useState<'intro' | 'name' | 'registering' | 'success'>('intro')

  useEffect(() => {
    async function checkWebAuthn() {
      const supported = await isWebAuthnSupported()
      setWebAuthnSupported(supported)
      
      if (supported) {
        const platformAuth = await isPlatformAuthenticatorAvailable()
        setPlatformAvailable(platformAuth)
      }
    }

    checkWebAuthn()
  }, [])

  const handleEnrollPasskey = async () => {
    if (!webAuthnSupported) {
      setError('WebAuthn is not supported on this device')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Request registration options from backend
      const optionsResponse = await fetch('/api/auth/passkey/register-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email, deviceName }),
      })

      if (!optionsResponse.ok) {
        throw new Error('Failed to get registration options')
      }

      const options = await optionsResponse.json()

      // Start WebAuthn registration
      const credential = await navigator.credentials.create({
        publicKey: {
          ...options.publicKey,
          challenge: new Uint8Array(Object.values(options.publicKey.challenge)),
          user: {
            ...options.publicKey.user,
            id: new Uint8Array(Object.values(options.publicKey.user.id)),
          },
        },
      })

      if (!credential || credential.type !== 'public-key') {
        throw new Error('Failed to create credential')
      }

      const publicKeyCredential = credential as PublicKeyCredential
      const response = publicKeyCredential.response as AuthenticatorAttestationResponse

      // Verify registration with backend
      const verifyResponse = await fetch('/api/auth/passkey/register-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          email,
          deviceName,
          credential: {
            id: publicKeyCredential.id,
            type: publicKeyCredential.type,
            response: {
              clientDataJSON: arrayBufferToBase64(response.clientDataJSON),
              attestationObject: arrayBufferToBase64(response.attestationObject),
            },
          },
        }),
      })

      if (!verifyResponse.ok) {
        throw new Error('Failed to verify passkey')
      }

      const result = await verifyResponse.json()
      setStep('success')
      onComplete?.(result.passkeyId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enroll passkey')
    } finally {
      setIsLoading(false)
    }
  }

  if (!webAuthnSupported) {
    return (
      <Card className="p-6 border-red-200 bg-red-50">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="font-semibold text-red-900">WebAuthn Not Supported</p>
        </div>
        <p className="text-sm text-red-700">
          Passkeys require WebAuthn support. Please try on a compatible device or browser.
        </p>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      {step === 'intro' && (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              <Key className="w-5 h-5" />
              Add a Passkey
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              A passkey is a secure, phishing-resistant way to sign in. {platformAvailable ? 'Your device supports platform authentication.' : 'Use a security key or compatible device.'}
            </p>
          </div>
          <Button onClick={() => setStep('name')} className="w-full">
            Continue
          </Button>
        </div>
      )}

      {step === 'name' && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="device-name">Device Name (optional)</Label>
            <Input
              id="device-name"
              placeholder="e.g., My MacBook, iPhone 15"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Helps you identify this passkey later
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setStep('intro')}
              disabled={isLoading}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              onClick={() => {
                setStep('registering')
                handleEnrollPasskey()
              }}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Registering...
                </>
              ) : (
                'Register Passkey'
              )}
            </Button>
          </div>
        </div>
      )}

      {step === 'registering' && (
        <div className="space-y-4">
          <div className="text-center">
            <Smartphone className="w-12 h-12 mx-auto mb-2 text-blue-600 animate-pulse" />
            <p className="font-semibold">Follow the prompts on your device</p>
            <p className="text-sm text-muted-foreground">
              Complete the authentication process on your device or security key
            </p>
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>
      )}

      {step === 'success' && (
        <div className="space-y-4">
          <div className="text-center">
            <Key className="w-12 h-12 mx-auto mb-2 text-green-600" />
            <p className="font-semibold text-green-900">Passkey Added Successfully</p>
            <p className="text-sm text-muted-foreground mt-1">
              {deviceName ? `${deviceName} is now registered.` : 'Your passkey is now registered.'}
            </p>
          </div>
          <Button onClick={() => setStep('intro')} className="w-full">
            Add Another Passkey
          </Button>
        </div>
      )}
    </Card>
  )
}
