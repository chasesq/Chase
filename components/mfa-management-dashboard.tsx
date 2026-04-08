'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Shield, Smartphone, Mail, Fingerprint, Trash2, Eye, EyeOff } from 'lucide-react'

export interface MFAFactor {
  id: string
  type: 'totp' | 'sms' | 'email' | 'passkey'
  name: string
  enrolled_at: string
  last_used?: string
  is_primary: boolean
  device_info?: {
    browser?: string
    os?: string
    device_name?: string
  }
}

interface MFAManagementDashboardProps {
  email: string
  onFactorRemoved?: () => void
}

export function MFAManagementDashboard({
  email,
  onFactorRemoved,
}: MFAManagementDashboardProps) {
  const [factors, setFactors] = useState<MFAFactor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showDetails, setShowDetails] = useState<string | null>(null)
  const [removingFactorId, setRemovingFactorId] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadMFAFactors()
  }, [email])

  const loadMFAFactors = async () => {
    try {
      const response = await fetch(`/api/auth/mfa/factors?email=${encodeURIComponent(email)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load MFA factors')
      }

      setFactors(data.factors || [])
    } catch (error) {
      console.error('[v0] Error loading MFA factors:', error)
      toast({
        title: 'Error',
        description: 'Failed to load MFA factors',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveFactor = async (factorId: string) => {
    if (!confirm('Are you sure you want to remove this MFA factor? You will need to verify with another method.')) {
      return
    }

    setRemovingFactorId(factorId)
    try {
      const response = await fetch('/api/auth/mfa/factor/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          factorId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove factor')
      }

      toast({
        title: 'Success',
        description: 'MFA factor removed successfully',
      })

      setFactors(factors.filter(f => f.id !== factorId))
      onFactorRemoved?.()
    } catch (error) {
      console.error('[v0] Error removing MFA factor:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to remove MFA factor',
        variant: 'destructive',
      })
    } finally {
      setRemovingFactorId(null)
    }
  }

  const getFactorIcon = (type: string) => {
    switch (type) {
      case 'totp':
        return <Smartphone className="w-5 h-5" />
      case 'sms':
        return <Smartphone className="w-5 h-5" />
      case 'email':
        return <Mail className="w-5 h-5" />
      case 'passkey':
        return <Fingerprint className="w-5 h-5" />
      default:
        return <Shield className="w-5 h-5" />
    }
  }

  const getFactorLabel = (type: string) => {
    switch (type) {
      case 'totp':
        return 'Authenticator App'
      case 'sms':
        return 'SMS Text Message'
      case 'email':
        return 'Email Code'
      case 'passkey':
        return 'Passkey'
      default:
        return 'Unknown'
    }
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center min-h-[200px]">
          <p className="text-gray-600">Loading MFA factors...</p>
        </div>
      </Card>
    )
  }

  if (factors.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center space-y-4">
          <Shield className="w-12 h-12 text-gray-400 mx-auto" />
          <p className="text-gray-600">No MFA factors enrolled yet</p>
          <p className="text-sm text-gray-500">Add a factor to enhance your account security</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {factors.map((factor) => (
        <Card key={factor.id} className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              <div className="text-blue-600 mt-1">
                {getFactorIcon(factor.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">{getFactorLabel(factor.type)}</h3>
                  {factor.is_primary && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      Primary
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">{factor.name}</p>
                
                {/* Show/Hide Details Toggle */}
                <button
                  onClick={() => setShowDetails(showDetails === factor.id ? null : factor.id)}
                  className="text-sm text-blue-600 hover:underline mt-2 flex items-center gap-1"
                >
                  {showDetails === factor.id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showDetails === factor.id ? 'Hide' : 'Show'} Details
                </button>

                {/* Detailed Information */}
                {showDetails === factor.id && (
                  <div className="mt-3 pt-3 border-t text-sm space-y-2 text-gray-600">
                    <div>
                      <span className="font-medium text-gray-700">Enrolled:</span>{' '}
                      {new Date(factor.enrolled_at).toLocaleDateString()} at{' '}
                      {new Date(factor.enrolled_at).toLocaleTimeString()}
                    </div>
                    {factor.last_used && (
                      <div>
                        <span className="font-medium text-gray-700">Last Used:</span>{' '}
                        {new Date(factor.last_used).toLocaleDateString()} at{' '}
                        {new Date(factor.last_used).toLocaleTimeString()}
                      </div>
                    )}
                    {factor.device_info && (
                      <div>
                        <span className="font-medium text-gray-700">Device:</span>{' '}
                        {factor.device_info.device_name || 'Unknown Device'}
                        {factor.device_info.browser && ` • ${factor.device_info.browser}`}
                        {factor.device_info.os && ` • ${factor.device_info.os}`}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Remove Button */}
            {!factor.is_primary && factors.length > 1 && (
              <Button
                onClick={() => handleRemoveFactor(factor.id)}
                disabled={removingFactorId === factor.id}
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                {removingFactorId === factor.id ? 'Removing...' : 'Remove'}
              </Button>
            )}
            {factor.is_primary && factors.length > 1 && (
              <Button
                disabled
                variant="outline"
                size="sm"
                className="text-gray-400"
              >
                Primary Factor
              </Button>
            )}
          </div>
        </Card>
      ))}

      {factors.length > 0 && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-900">
            <strong>Tip:</strong> Keep at least one backup MFA factor enrolled in case you lose access to your primary method.
          </p>
        </Card>
      )}
    </div>
  )
}
