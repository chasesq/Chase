'use client'

import { SettingsLayout } from '@/components/settings-layout'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

export default function PrivacySettingsPage() {
  return (
    <SettingsLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">Privacy Settings</h2>
          <p className="text-muted-foreground mt-1">Control your data and visibility preferences</p>
        </div>

        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Profile Visibility</Label>
                <p className="text-sm text-muted-foreground mt-1">Make your profile visible to other users</p>
              </div>
              <Switch defaultChecked className="data-[state=checked]:bg-[#0a4fa6]" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Activity Visibility</Label>
                <p className="text-sm text-muted-foreground mt-1">Show your last active time to others</p>
              </div>
              <Switch className="data-[state=checked]:bg-[#0a4fa6]" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Data Collection</Label>
                <p className="text-sm text-muted-foreground mt-1">Allow us to collect usage analytics</p>
              </div>
              <Switch defaultChecked className="data-[state=checked]:bg-[#0a4fa6]" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Marketing Emails</Label>
                <p className="text-sm text-muted-foreground mt-1">Receive emails about new features</p>
              </div>
              <Switch className="data-[state=checked]:bg-[#0a4fa6]" />
            </div>
          </Card>
        </div>

        <Card className="bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800 p-4">
          <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Data Rights</h4>
          <p className="text-sm text-purple-800 dark:text-purple-200 mb-3">
            You have the right to access, modify, or delete your personal data at any time.
          </p>
          <div className="space-y-2">
            <button className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:underline">
              Download your data
            </button>
            <br />
            <button className="text-sm font-medium text-red-600 dark:text-red-400 hover:underline">
              Request account deletion
            </button>
          </div>
        </Card>
      </div>
    </SettingsLayout>
  )
}
