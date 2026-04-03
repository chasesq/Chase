'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Shield, AlertTriangle, CheckCircle, Lock, Smartphone, Key } from 'lucide-react'

interface SecurityStat {
  label: string
  status: 'secure' | 'warning' | 'critical'
  description: string
  icon: React.ReactNode
  action?: string
  actionUrl?: string
}

export function SecurityStatusDashboard() {
  const [securityStats] = useState<SecurityStat[]>([
    {
      label: 'Password Strength',
      status: 'secure',
      description: 'Your password meets security requirements',
      icon: <Lock className="w-5 h-5" />,
      action: 'Change Password',
      actionUrl: '/auth/change-password',
    },
    {
      label: 'Two-Factor Authentication',
      status: 'secure',
      description: '2FA is enabled on your account',
      icon: <Smartphone className="w-5 h-5" />,
      action: 'Manage 2FA',
      actionUrl: '/auth/mfa-setup',
    },
    {
      label: 'Authorized Applications',
      status: 'secure',
      description: '3 applications have access to your account',
      icon: <Key className="w-5 h-5" />,
      action: 'Review Apps',
      actionUrl: '/auth/profile',
    },
    {
      label: 'Recent Suspicious Activity',
      status: 'warning',
      description: '1 failed login attempt detected',
      icon: <AlertTriangle className="w-5 h-5" />,
      action: 'View Details',
      actionUrl: '/auth/profile',
    },
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'secure':
        return 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
      case 'warning':
        return 'bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800'
      case 'critical':
        return 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
      default:
        return 'bg-gray-50 dark:bg-gray-950'
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'secure':
        return 'default'
      case 'warning':
        return 'secondary'
      case 'critical':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const secureCount = securityStats.filter(s => s.status === 'secure').length
  const warningCount = securityStats.filter(s => s.status === 'warning').length
  const criticalCount = securityStats.filter(s => s.status === 'critical').length

  const securityScore = Math.round(((secureCount - warningCount * 0.5 - criticalCount) / securityStats.length) * 100)

  return (
    <div className="space-y-6">
      {/* Overall Security Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security Score
          </CardTitle>
          <CardDescription>Your account security rating</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-6">
            <div className="flex items-center gap-4">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-muted"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeDasharray={`${(securityScore / 100) * 339.29} 339.29`}
                    className="text-green-500 transition-all"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-foreground">{securityScore}%</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-lg font-semibold text-foreground mt-1">
                  {securityScore >= 80
                    ? 'Excellent'
                    : securityScore >= 60
                      ? 'Good'
                      : securityScore >= 40
                        ? 'Fair'
                        : 'Needs Attention'}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {secureCount} secure • {warningCount} warning{warningCount !== 1 ? 's' : ''}
                  {criticalCount > 0 && ` • ${criticalCount} critical`}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Items */}
      <div className="grid gap-4">
        {securityStats.map((stat, index) => (
          <Card key={index} className={`border ${getStatusColor(stat.status)}`}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div
                    className={`mt-1 ${
                      stat.status === 'secure'
                        ? 'text-green-600 dark:text-green-400'
                        : stat.status === 'warning'
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {stat.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-foreground">{stat.label}</h3>
                      <Badge variant={getStatusBadgeVariant(stat.status)}>
                        {stat.status === 'secure'
                          ? 'Secure'
                          : stat.status === 'warning'
                            ? 'Warning'
                            : 'Critical'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{stat.description}</p>
                  </div>
                </div>
                {stat.action && (
                  <Button
                    onClick={() => {
                      if (stat.actionUrl) window.location.href = stat.actionUrl
                    }}
                    variant="outline"
                    size="sm"
                    className="ml-4 flex-shrink-0"
                  >
                    {stat.action}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recommendations */}
      {warningCount > 0 || criticalCount > 0 ? (
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950">
          <CardHeader>
            <CardTitle className="text-amber-900 dark:text-amber-100 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Security Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-amber-800 dark:text-amber-200">
              {warningCount > 0 && (
                <li>• Review and address {warningCount} warning{warningCount !== 1 ? 's' : ''} above</li>
              )}
              {criticalCount > 0 && (
                <li>• Take immediate action on {criticalCount} critical issue{criticalCount !== 1 ? 's' : ''}</li>
              )}
              <li>• Regularly review your login history for unauthorized access</li>
              <li>• Update your password periodically</li>
            </ul>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
