import React from 'react'
import { type MultiStepSignUpFormData } from '@/lib/validation/sign-up-schema'
import { Edit2 } from 'lucide-react'

interface ReviewStepProps {
  data: Partial<MultiStepSignUpFormData>
  onSubmit: () => void
  onEdit: (step: number) => void
  isLoading?: boolean
}

export function ReviewStep({ data, onSubmit, onEdit, isLoading }: ReviewStepProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not provided'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          Please review your information below. If anything is incorrect, use the edit buttons to go back and make changes.
        </p>
      </div>

      {/* Personal Information Section */}
      <div className="border rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Personal Information</h3>
          <button
            type="button"
            onClick={() => onEdit(1)}
            className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <Edit2 size={16} />
            <span className="text-xs">Edit</span>
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-slate-600">First Name</p>
            <p className="font-medium text-slate-900">{data.firstName}</p>
          </div>
          <div>
            <p className="text-slate-600">Last Name</p>
            <p className="font-medium text-slate-900">{data.lastName}</p>
          </div>
          <div className="col-span-2">
            <p className="text-slate-600">Email</p>
            <p className="font-medium text-slate-900">{data.email}</p>
          </div>
          <div className="col-span-2">
            <p className="text-slate-600">Phone</p>
            <p className="font-medium text-slate-900">{data.phone}</p>
          </div>
        </div>
      </div>

      {/* Address & Identity Section */}
      <div className="border rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Address & Identity</h3>
          <button
            type="button"
            onClick={() => onEdit(2)}
            className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <Edit2 size={16} />
            <span className="text-xs">Edit</span>
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="col-span-2">
            <p className="text-slate-600">Street Address</p>
            <p className="font-medium text-slate-900">{data.street}</p>
          </div>
          <div>
            <p className="text-slate-600">City</p>
            <p className="font-medium text-slate-900">{data.city}</p>
          </div>
          <div>
            <p className="text-slate-600">State</p>
            <p className="font-medium text-slate-900">{data.state}</p>
          </div>
          <div>
            <p className="text-slate-600">ZIP Code</p>
            <p className="font-medium text-slate-900">{data.zipCode}</p>
          </div>
          <div>
            <p className="text-slate-600">Date of Birth</p>
            <p className="font-medium text-slate-900">{formatDate(data.dateOfBirth)}</p>
          </div>
          <div>
            <p className="text-slate-600">Government ID Type</p>
            <p className="font-medium text-slate-900 capitalize">
              {data.governmentIdType?.replace('_', ' ')}
            </p>
          </div>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="border rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Preferences</h3>
          <button
            type="button"
            onClick={() => onEdit(3)}
            className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <Edit2 size={16} />
            <span className="text-xs">Edit</span>
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-slate-600">Account Type</p>
            <p className="font-medium text-slate-900 capitalize">{data.accountType}</p>
          </div>
          <div>
            <p className="text-slate-600">Currency</p>
            <p className="font-medium text-slate-900">{data.currency}</p>
          </div>
          <div>
            <p className="text-slate-600">Language</p>
            <p className="font-medium text-slate-900">{data.language === 'en' ? 'English' : data.language}</p>
          </div>
          <div>
            <p className="text-slate-600">2FA Enabled</p>
            <p className="font-medium text-slate-900">{data.twoFactorEnabled ? 'Yes' : 'No'}</p>
          </div>
        </div>
      </div>

      {/* Agreements Section */}
      <div className="border rounded-lg p-4 space-y-2 text-sm">
        <p className="text-slate-600 mb-2">Agreements</p>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500 flex items-center justify-center">
            <span className="text-white text-xs">✓</span>
          </div>
          <p className="text-slate-900">Terms and Conditions accepted</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500 flex items-center justify-center">
            <span className="text-white text-xs">✓</span>
          </div>
          <p className="text-slate-900">Privacy Policy accepted</p>
        </div>
      </div>

      <div className="bg-slate-50 rounded-lg p-4 text-xs text-slate-600 space-y-1">
        <p>By clicking Create Account, you agree to:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>The Terms and Conditions</li>
          <li>The Privacy Policy</li>
          <li>Receive communications about your account</li>
        </ul>
      </div>

      <div className="flex gap-3 pt-6">
        <button
          type="button"
          onClick={() => onEdit(4)}
          className="flex-1 px-6 py-3 rounded-lg bg-slate-200 text-slate-900 font-semibold hover:bg-slate-300 transition-all"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={isLoading}
          className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold hover:from-green-700 hover:to-green-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>
      </div>
    </div>
  )
}
