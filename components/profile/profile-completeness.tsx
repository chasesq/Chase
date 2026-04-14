import { calculateProfileCompleteness, type ProfileFormData } from '@/lib/validation/profile-schema'
import { CheckCircle, AlertCircle } from 'lucide-react'

interface ProfileCompletenessProps {
  profile: Partial<ProfileFormData>
  onMissingFieldClick?: (field: string) => void
}

export function ProfileCompleteness({ profile, onMissingFieldClick }: ProfileCompletenessProps) {
  const { percentage, filledFields, totalFields, missingFields } = calculateProfileCompleteness(profile)

  const fieldLabels: Record<string, string> = {
    full_name: 'Full Name',
    email: 'Email Address',
    phone: 'Phone Number',
    address: 'Street Address',
    city: 'City',
    state: 'State',
    zip_code: 'ZIP Code',
    date_of_birth: 'Date of Birth',
    government_id_type: 'Government ID Type',
    account_type_preference: 'Account Type',
    currency_preference: 'Preferred Currency',
    language_preference: 'Preferred Language',
  }

  const getProgressColor = () => {
    if (percentage >= 80) return 'bg-green-500'
    if (percentage >= 60) return 'bg-blue-500'
    if (percentage >= 40) return 'bg-yellow-500'
    return 'bg-orange-500'
  }

  const getStatusText = () => {
    if (percentage === 100) return 'Profile Complete'
    if (percentage >= 80) return 'Almost There'
    if (percentage >= 60) return 'Good Progress'
    if (percentage >= 40) return 'Getting Started'
    return 'Incomplete'
  }

  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 p-6">
      <div className="space-y-4">
        {/* Header with percentage */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Profile Completeness</h3>
            <p className="text-sm text-gray-600 mt-1">{filledFields} of {totalFields} fields completed</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{percentage}%</div>
            <div className="text-xs font-medium text-gray-600">{getStatusText()}</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full ${getProgressColor()} transition-all duration-300`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Missing fields list */}
        {missingFields.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Missing Information
            </h4>
            <ul className="space-y-2">
              {missingFields.map((field) => (
                <li key={field} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{fieldLabels[field as keyof typeof fieldLabels] || field}</span>
                  {onMissingFieldClick && (
                    <button
                      onClick={() => onMissingFieldClick(field)}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Add
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Completion message */}
        {percentage === 100 && (
          <div className="border-t pt-4 flex items-center gap-3 text-green-700 bg-green-50 rounded-md p-3">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">Your profile is complete and verified</p>
          </div>
        )}
      </div>
    </div>
  )
}
