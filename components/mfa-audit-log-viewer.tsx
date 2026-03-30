'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Calendar, Clock, AlertCircle } from 'lucide-react'

export interface MFAAuditLog {
  id: string
  action: string
  details?: Record<string, any>
  created_at: string
  device_info?: {
    browser?: string
    os?: string
    ip_address?: string
  }
}

interface MFAAuditLogViewerProps {
  email: string
  limit?: number
}

export function MFAAuditLogViewer({
  email,
  limit = 10,
}: MFAAuditLogViewerProps) {
  const [logs, setLogs] = useState<MFAAuditLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadAuditLogs()
  }, [email])

  const loadAuditLogs = async () => {
    try {
      const response = await fetch(
        `/api/auth/audit-logs?email=${encodeURIComponent(email)}&limit=${limit}&type=mfa`
      )
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load audit logs')
      }

      setLogs(data.logs || [])
    } catch (error) {
      console.error('[v0] Error loading audit logs:', error)
      toast({
        title: 'Error',
        description: 'Failed to load audit logs',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getActionLabel = (action: string): string => {
    const labels: Record<string, string> = {
      'mfa_factor_added': 'MFA Factor Added',
      'mfa_factor_removed': 'MFA Factor Removed',
      'mfa_code_verified': 'MFA Code Verified',
      'recovery_codes_generated': 'Recovery Codes Generated',
      'recovery_code_used': 'Recovery Code Used',
      'mfa_settings_changed': 'MFA Settings Changed',
    }
    return labels[action] || action
  }

  const getActionColor = (action: string): string => {
    if (action.includes('added')) return 'text-green-600'
    if (action.includes('removed')) return 'text-red-600'
    if (action.includes('verified')) return 'text-blue-600'
    return 'text-gray-600'
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center min-h-[200px]">
          <p className="text-gray-600">Loading activity history...</p>
        </div>
      </Card>
    )
  }

  if (logs.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-gray-400 mx-auto" />
          <p className="text-gray-600">No MFA activity yet</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h3 className="font-semibold text-gray-900 mb-4">Recent MFA Activity</h3>
      <div className="space-y-3">
        {logs.map((log) => (
          <div
            key={log.id}
            className="flex items-start gap-3 pb-3 border-b last:border-b-0 last:pb-0"
          >
            <div className="flex-shrink-0">
              <Calendar className="w-4 h-4 text-gray-400 mt-1" />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-medium ${getActionColor(log.action)}`}>
                {getActionLabel(log.action)}
              </p>
              <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
                <Clock className="w-3 h-3" />
                {new Date(log.created_at).toLocaleDateString()} at{' '}
                {new Date(log.created_at).toLocaleTimeString()}
              </div>
              {log.device_info && (
                <p className="text-xs text-gray-500 mt-1">
                  {log.device_info.browser && `${log.device_info.browser} • `}
                  {log.device_info.os && `${log.device_info.os} • `}
                  {log.device_info.ip_address && `IP: ${log.device_info.ip_address}`}
                </p>
              )}
              {log.details && (
                <p className="text-xs text-gray-500 mt-1">
                  {JSON.stringify(log.details)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
