'use client'

import { SettingsLayout } from '@/components/settings-layout'
import { AuthenticationSettings } from '@/components/authentication-settings'
import { PasswordManagement } from '@/components/password-management'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default function SecuritySettingsPage() {
  return (
    <SettingsLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">Security Settings</h2>
          <p className="text-muted-foreground mt-1">Manage your password, 2FA, and sessions</p>
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
            <li>✓ Use a strong, unique password</li>
            <li>✓ Review active sessions regularly</li>
            <li>✓ Keep your backup codes in a safe place</li>
          </ul>
        </Card>
      </div>
    </SettingsLayout>
  )
}
