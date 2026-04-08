'use client'

import { SettingsLayout } from '@/components/settings-layout'
import { ProfileForm } from '@/components/profile-form'
import { Card } from '@/components/ui/card'

export default function ProfileSettingsPage() {
  return (
    <SettingsLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">Profile Settings</h2>
          <p className="text-muted-foreground mt-1">Update your personal information</p>
        </div>

        <ProfileForm />

        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 p-4">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Profile Tips</h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Keep your profile picture professional and up-to-date</li>
            <li>• Your email address is used for account recovery</li>
            <li>• Phone number helps us reach you if needed</li>
            <li>• Profile changes are synced across all your devices</li>
          </ul>
        </Card>
      </div>
    </SettingsLayout>
  )
}
