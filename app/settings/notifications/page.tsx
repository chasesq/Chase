'use client'

import { SettingsLayout } from '@/components/settings-layout'
import { AccountSettingsPanel } from '@/components/account-settings-panel'

export default function NotificationsSettingsPage() {
  return (
    <SettingsLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">Notifications</h2>
          <p className="text-muted-foreground mt-1">Control how and when you receive alerts</p>
        </div>

        <AccountSettingsPanel />
      </div>
    </SettingsLayout>
  )
}
