'use client'

import type { UserProfile } from '@/lib/auth-context'
import { Mail, Phone, MapPin, User, Calendar, FileText, Settings, Globe, Bell } from 'lucide-react'
import { format } from 'date-fns'

interface ProfileDisplayProps {
  profile: UserProfile | null
  onEditClick?: () => void
}

interface ProfileSection {
  title: string
  icon: React.ReactNode
  fields: Array<{
    label: string
    value: string | null | undefined
    icon?: React.ReactNode
  }>
}

export function ProfileDisplay({ profile, onEditClick }: ProfileDisplayProps) {
  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Profile information not available</p>
      </div>
    )
  }

  const formatDate = (date: string | null) => {
    if (!date) return 'Not provided'
    try {
      return format(new Date(date), 'MMMM d, yyyy')
    } catch {
      return 'Invalid date'
    }
  }

  const sections: ProfileSection[] = [
    {
      title: 'Personal Information',
      icon: <User className="w-5 h-5" />,
      fields: [
        { label: 'Full Name', value: profile.full_name },
        { label: 'Date of Birth', value: profile.date_of_birth ? formatDate(profile.date_of_birth) : 'Not provided' },
        { label: 'Government ID Type', value: (profile as any).government_id_type || 'Not provided' },
      ],
    },
    {
      title: 'Contact Information',
      icon: <Mail className="w-5 h-5" />,
      fields: [
        { label: 'Email', value: profile.email, icon: <Mail className="w-4 h-4" /> },
        { label: 'Phone', value: profile.phone, icon: <Phone className="w-4 h-4" /> },
        { label: 'Address', value: profile.address, icon: <MapPin className="w-4 h-4" /> },
      ],
    },
    {
      title: 'Preferences',
      icon: <Settings className="w-5 h-5" />,
      fields: [
        { label: 'Currency', value: (profile as any).currency_preference || 'USD', icon: <Globe className="w-4 h-4" /> },
        { label: 'Language', value: (profile as any).language_preference || 'English', icon: <Globe className="w-4 h-4" /> },
        { label: 'Account Type', value: (profile as any).account_type_preference || 'Not specified' },
      ],
    },
    {
      title: 'Notifications',
      icon: <Bell className="w-5 h-5" />,
      fields: [
        {
          label: 'Email Notifications',
          value: (profile as any).email_notifications ? 'Enabled' : 'Disabled',
        },
        {
          label: 'SMS Notifications',
          value: (profile as any).sms_notifications ? 'Enabled' : 'Disabled',
        },
        {
          label: 'In-App Notifications',
          value: (profile as any).inapp_notifications ? 'Enabled' : 'Disabled',
        },
      ],
    },
    {
      title: 'Security',
      icon: <FileText className="w-5 h-5" />,
      fields: [
        {
          label: 'Two-Factor Authentication',
          value: (profile as any).two_factor_enabled ? 'Enabled' : 'Disabled',
        },
        {
          label: 'Account Status',
          value: 'Active',
        },
        {
          label: 'Member Since',
          value: profile.member_since ? formatDate(profile.member_since) : 'Recently',
        },
      ],
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header with edit button */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
        {onEditClick && (
          <button
            onClick={onEditClick}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Edit Profile
          </button>
        )}
      </div>

      {/* Profile sections */}
      <div className="grid grid-cols-1 gap-6">
        {sections.map((section, idx) => (
          <div
            key={idx}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            {/* Section header */}
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
              <div className="text-blue-600">{section.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
            </div>

            {/* Section fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {section.fields.map((field, fieldIdx) => (
                <div key={fieldIdx}>
                  <label className="text-sm font-medium text-gray-600 block mb-1">{field.label}</label>
                  <div className="flex items-center gap-2">
                    {field.icon && <span className="text-gray-400">{field.icon}</span>}
                    <p className="text-gray-900 font-medium">{field.value || 'Not provided'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Last updated info */}
      {profile.updated_at && (
        <div className="text-xs text-gray-500 text-center pt-4 border-t border-gray-200">
          Last updated: {formatDate(profile.updated_at)}
        </div>
      )}
    </div>
  )
}
