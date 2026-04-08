'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Key, Trash2, Plus, Smartphone, AlertCircle, Loader2 } from 'lucide-react'
import { PasskeyEnrollment } from '@/components/passkey-enrollment'

interface Passkey {
  id: string
  device_name: string
  device_type?: string
  browser_name?: string
  enrolled_at: string
  last_used_at?: string
}

interface PasskeyManagerProps {
  userId: string
  email: string
  onFactorChanged?: () => void
}

export function PasskeyManager({ userId, email, onFactorChanged }: PasskeyManagerProps) {
  const [passkeys, setPasskeys] = useState<Passkey[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showEnrollment, setShowEnrollment] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPasskeys()
  }, [userId])

  const fetchPasskeys = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/auth/passkey/list?userId=${userId}`)
      if (!response.ok) throw new Error('Failed to fetch passkeys')
      
      const data = await response.json()
      setPasskeys(data.passkeys || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load passkeys')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemovePasskey = async (passkeyId: string) => {
    if (!confirm('Are you sure you want to remove this passkey?')) return

    try {
      const response = await fetch('/api/auth/passkey/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, passkeyId }),
      })

      if (!response.ok) throw new Error('Failed to remove passkey')

      setPasskeys(passkeys.filter((p) => p.id !== passkeyId))
      onFactorChanged?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove passkey')
    }
  }

  if (showEnrollment) {
    return (
      <div className="space-y-4">
        <Button
          variant="outline"
          onClick={() => setShowEnrollment(false)}
          className="mb-4"
        >
          Back
        </Button>
        <PasskeyEnrollment
          userId={userId}
          email={email}
          onComplete={() => {
            fetchPasskeys()
            setShowEnrollment(false)
            onFactorChanged?.()
          }}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <Card className="bg-red-50 border-red-200 p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </Card>
      )}

      {isLoading ? (
        <Card className="p-6">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <p>Loading passkeys...</p>
          </div>
        </Card>
      ) : passkeys.length === 0 ? (
        <Card className="p-6">
          <div className="text-center">
            <Key className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p className="font-semibold mb-2">No passkeys registered</p>
            <p className="text-sm text-muted-foreground mb-4">
              Add a passkey to enable phishing-resistant authentication
            </p>
            <Button onClick={() => setShowEnrollment(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Passkey
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-2">
          {passkeys.map((passkey) => (
            <Card key={passkey.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Smartphone className="w-4 h-4 text-blue-600" />
                    <h4 className="font-semibold">{passkey.device_name || 'Unnamed Device'}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Enrolled {new Date(passkey.enrolled_at).toLocaleDateString()}
                  </p>
                  {passkey.last_used_at && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Last used {new Date(passkey.last_used_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemovePasskey(passkey.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}

          <Button
            onClick={() => setShowEnrollment(true)}
            variant="outline"
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Another Passkey
          </Button>
        </div>
      )}
    </div>
  )
}
