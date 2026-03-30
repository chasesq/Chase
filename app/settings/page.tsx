'use client'

import { SettingsLayout } from '@/components/settings-layout'

export default function SettingsPage() {
  return (
    <SettingsLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-[#0a4fa6] to-[#117aca] text-white rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-2">Account Settings</h2>
          <p className="text-white/80">Manage your account preferences and security settings</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">Security Level</p>
            <p className="text-2xl font-semibold text-blue-600 dark:text-blue-400">High</p>
            <p className="text-xs text-muted-foreground mt-2">2FA enabled</p>
          </div>

          <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">Active Sessions</p>
            <p className="text-2xl font-semibold text-green-600 dark:text-green-400">1</p>
            <p className="text-xs text-muted-foreground mt-2">This device</p>
          </div>

          <div className="bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">Last Updated</p>
            <p className="text-2xl font-semibold text-purple-600 dark:text-purple-400">Today</p>
            <p className="text-xs text-muted-foreground mt-2">Profile changes</p>
          </div>
        </div>

        {/* Info Text */}
        <div className="bg-blue-50/50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            Select a category from the menu to manage your settings. Changes are automatically saved and synced across your account.
          </p>
        </div>
      </div>
    </SettingsLayout>
  )
}
