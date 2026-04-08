'use client'

import { SettingsLayout } from '@/components/settings-layout'
import { AuthenticationSettings } from '@/components/authentication-settings'
import { PasswordManagement } from '@/components/password-management'
import { MFAManagementDashboard } from '@/components/mfa-management-dashboard'
import { RecoveryCodesManager } from '@/components/recovery-codes-manager'
import { MFAAuditLogViewer } from '@/components/mfa-audit-log-viewer'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useCallback, useState } from 'react'

export default function SecuritySettingsPage() {
  const [userEmail, setUserEmail] = useState('demo@example.com')
  const [refreshKey, setRefreshKey] = useState(0)

  const handleMFAFactorRemoved = useCallback(() => {
    // Refresh the MFA management dashboard
    setRefreshKey(prev => prev + 1)
  }, [])

  return (
    <SettingsLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">Security Settings</h2>
          <p className="text-muted-foreground mt-1">Manage your password, 2FA, sessions, and MFA factors</p>
        </div>

        {/* Password Management */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Password</h3>
          <PasswordManagement />
        </div>

        <Separator className="my-6" />

        {/* Authentication Settings */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Two-Factor Authentication</h3>
          <AuthenticationSettings />
        </div>

        <Separator className="my-6" />

        {/* MFA Management */}
        <div>
          <h3 className="text-lg font-semibold mb-4">MFA Factors</h3>
          <p className="text-sm text-muted-foreground mb-4">
            View and manage your enrolled multi-factor authentication methods
          </p>
          <MFAManagementDashboard
            key={refreshKey}
            email={userEmail}
            onFactorRemoved={handleMFAFactorRemoved}
          />
        </div>

        <Separator className="my-6" />

        {/* Recovery Codes */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Recovery Codes</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Keep backup codes in a safe place for account recovery
          </p>
          <RecoveryCodesManager
            email={userEmail}
            onCodesRegenerated={handleMFAFactorRemoved}
          />
        </div>

        <Separator className="my-6" />

        {/* MFA Activity Log */}
        <div>
          <h3 className="text-lg font-semibold mb-4">MFA Activity</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Recent multi-factor authentication activity on your account
          </p>
          <MFAAuditLogViewer email={userEmail} limit={10} />
        </div>

        <Separator className="my-6" />

        {/* Active Sessions */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Active Sessions</h3>
          <Card className="p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">Current Device</p>
                <p className="text-sm text-muted-foreground">Chrome on macOS</p>
                <p className="text-xs text-muted-foreground mt-1">Last active: Just now</p>
              </div>
              <span className="px-2 py-1 bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400 text-xs font-medium rounded">
                Active
              </span>
            </div>
          </Card>
          <p className="text-xs text-muted-foreground mt-3">
            Other sessions will be displayed here. You can terminate sessions to improve security.
          </p>
        </div>

        <Card className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800 p-4">
          <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">Security Recommendations</h4>
          <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
            <li>✓ Enable 2FA for an extra layer of security</li>
            <li>✓ Enroll multiple MFA factors for account recovery</li>
            <li>✓ Keep recovery codes in a safe place</li>
            <li>✓ Use a strong, unique password</li>
            <li>✓ Review active sessions and MFA activity regularly</li>
          </ul>
        </Card>
      </div>
    </SettingsLayout>
  )
}

