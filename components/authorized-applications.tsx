'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, Trash2, Clock, Shield, Plus } from 'lucide-react'

interface AuthorizedApp {
  id: string
  name: string
  icon: string
  lastUsed: string
  permissions: string[]
  riskLevel: 'low' | 'medium' | 'high'
  connectedAt: string
}

const mockApps: AuthorizedApp[] = [
  {
    id: '1',
    name: 'Chase Mobile App',
    icon: '📱',
    lastUsed: '2 hours ago',
    permissions: ['view_accounts', 'view_transactions', 'make_transfers'],
    riskLevel: 'low',
    connectedAt: 'January 15, 2025',
  },
  {
    id: '2',
    name: 'Budget Planner Pro',
    icon: '📊',
    lastUsed: '1 day ago',
    permissions: ['view_accounts', 'view_transactions'],
    riskLevel: 'low',
    connectedAt: 'December 1, 2024',
  },
  {
    id: '3',
    name: 'Unknown App',
    icon: '❓',
    lastUsed: '3 weeks ago',
    permissions: ['view_accounts', 'view_transactions', 'access_full_data'],
    riskLevel: 'high',
    connectedAt: 'November 20, 2024',
  },
]

export function AuthorizedApplications() {
  const [apps, setApps] = useState<AuthorizedApp[]>(mockApps)
  const [isLoading, setIsLoading] = useState(false)

  const handleRevokeAccess = async (appId: string) => {
    if (!confirm('Are you sure you want to revoke access for this application?')) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/revoke-app-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appId }),
      })

      if (response.ok) {
        setApps(apps.filter(app => app.id !== appId))
      }
    } catch (error) {
      console.error('Error revoking access:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950'
      case 'medium':
        return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950'
      case 'high':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Connected Applications
              </CardTitle>
              <CardDescription>Applications with access to your account</CardDescription>
            </div>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Connect App
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {apps.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-sm text-muted-foreground">No connected applications</p>
            </div>
          ) : (
            apps.map(app => (
              <div
                key={app.id}
                className={`p-4 rounded-lg border transition-colors ${
                  app.riskLevel === 'high'
                    ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950'
                    : 'border-border hover:bg-muted/50'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{app.icon}</span>
                    <div>
                      <h4 className="font-medium text-foreground">{app.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        Connected {app.connectedAt}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(app.riskLevel)}`}
                    >
                      {app.riskLevel === 'low'
                        ? 'Low Risk'
                        : app.riskLevel === 'medium'
                          ? 'Medium Risk'
                          : 'High Risk'}
                    </span>
                  </div>
                </div>

                {app.riskLevel === 'high' && (
                  <div className="mb-3 p-2 bg-red-100 dark:bg-red-900 rounded flex items-center gap-2 text-xs text-red-800 dark:text-red-200">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>This app has elevated permissions. Review carefully.</span>
                  </div>
                )}

                <div className="space-y-2 mb-3">
                  <p className="text-xs font-medium text-foreground">Permissions:</p>
                  <div className="flex flex-wrap gap-2">
                    {app.permissions.map(permission => (
                      <span
                        key={permission}
                        className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded"
                      >
                        {permission.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border/50">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    Last used: {app.lastUsed}
                  </div>
                  <Button
                    onClick={() => handleRevokeAccess(app.id)}
                    variant="ghost"
                    size="sm"
                    disabled={isLoading}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                    Revoke
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Security Note */}
      <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium mb-1">Review Connected Apps Regularly</p>
              <p>
                Only keep applications connected that you actively use. Remove any app you no longer
                recognize or use to maintain your account security.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
