'use client'

import { useState, useEffect } from 'react'
import { SettingsLayout } from '@/components/settings-layout'
import { ProfileForm } from '@/components/profile-form'
import { ProfileDisplay } from '@/components/profile/profile-display'
import { ProfileCompleteness } from '@/components/profile/profile-completeness'
import { Card } from '@/components/ui/card'
import { useAuth } from '@/lib/auth-context'
import { Loader2 } from 'lucide-react'
import type { UserProfile } from '@/lib/auth-context'

export default function ProfileSettingsPage() {
  const { profile, user, isAuthenticated } = useAuth()
  const [isEditMode, setIsEditMode] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [profileData, setProfileData] = useState<UserProfile | null>(null)

  useEffect(() => {
    // Set up profile data when auth context is ready
    if (profile) {
      setProfileData(profile)
      setIsLoading(false)
    }
  }, [profile])

  if (!isAuthenticated) {
    return (
      <SettingsLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">Please log in to view your profile</p>
        </div>
      </SettingsLayout>
    )
  }

  if (isLoading) {
    return (
      <SettingsLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </SettingsLayout>
    )
  }

  return (
    <SettingsLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Profile Settings</h2>
            <p className="text-muted-foreground mt-1">
              {isEditMode ? 'Edit your personal information' : 'View your profile details'}
            </p>
          </div>
          {!isEditMode && (
            <button
              onClick={() => setIsEditMode(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Edit Profile
            </button>
          )}
          {isEditMode && (
            <button
              onClick={() => setIsEditMode(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Cancel
            </button>
          )}
        </div>

        {/* Profile Completeness Widget */}
        {profileData && (
          <ProfileCompleteness
            profile={profileData}
            onMissingFieldClick={() => setIsEditMode(true)}
          />
        )}

        {/* View or Edit Mode */}
        {isEditMode ? (
          // Edit mode - show form
          <div className="space-y-6">
            <Card className="p-6">
              <ProfileForm email={user?.email || undefined} />
            </Card>
          </div>
        ) : (
          // View mode - show display
          profileData && <ProfileDisplay profile={profileData} onEditClick={() => setIsEditMode(true)} />
        )}

        {/* Tips card */}
        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 p-4">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Profile Tips</h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Keep your profile information up-to-date for better security</li>
            <li>• Your email address is used for account recovery and notifications</li>
            <li>• Phone number helps us reach you if needed for important updates</li>
            <li>• Complete your profile to unlock additional features</li>
            <li>• Profile changes are saved immediately and synced across devices</li>
          </ul>
        </Card>
      </div>
    </SettingsLayout>
  )
}
