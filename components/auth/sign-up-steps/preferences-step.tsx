import React from 'react'
import { PreferencesSchema, type PreferencesFormData } from '@/lib/validation/sign-up-schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

interface PreferencesStepProps {
  data: Partial<PreferencesFormData>
  onNext: (data: PreferencesFormData) => void
  onBack: () => void
  isLoading?: boolean
}

export function PreferencesStep({ data, onNext, onBack, isLoading }: PreferencesStepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PreferencesFormData>({
    resolver: zodResolver(PreferencesSchema),
    defaultValues: data,
  })

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      <div>
        <label htmlFor="accountType" className="block text-sm font-semibold text-slate-900 mb-2">
          Preferred Account Type
        </label>
        <select
          id="accountType"
          {...register('accountType')}
          className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
            errors.accountType
              ? 'border-red-500 bg-red-50 focus:outline-none'
              : 'border-slate-200 bg-slate-50 focus:border-blue-500 focus:outline-none'
          }`}
        >
          <option value="">Select an account type</option>
          <option value="checking">Checking Account</option>
          <option value="savings">Savings Account</option>
          <option value="both">Both Checking & Savings</option>
        </select>
        {errors.accountType && <p className="text-red-600 text-sm mt-1">{errors.accountType.message}</p>}
      </div>

      <div>
        <label htmlFor="currency" className="block text-sm font-semibold text-slate-900 mb-2">
          Currency Preference
        </label>
        <select
          id="currency"
          {...register('currency')}
          className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
            errors.currency
              ? 'border-red-500 bg-red-50 focus:outline-none'
              : 'border-slate-200 bg-slate-50 focus:border-blue-500 focus:outline-none'
          }`}
        >
          <option value="">Select a currency</option>
          <option value="USD">US Dollar (USD)</option>
          <option value="EUR">Euro (EUR)</option>
          <option value="GBP">British Pound (GBP)</option>
          <option value="CAD">Canadian Dollar (CAD)</option>
        </select>
        {errors.currency && <p className="text-red-600 text-sm mt-1">{errors.currency.message}</p>}
      </div>

      <div>
        <label htmlFor="language" className="block text-sm font-semibold text-slate-900 mb-2">
          Language Preference
        </label>
        <select
          id="language"
          {...register('language')}
          className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
            errors.language
              ? 'border-red-500 bg-red-50 focus:outline-none'
              : 'border-slate-200 bg-slate-50 focus:border-blue-500 focus:outline-none'
          }`}
        >
          <option value="">Select a language</option>
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="fr">Français</option>
          <option value="de">Deutsch</option>
        </select>
        {errors.language && <p className="text-red-600 text-sm mt-1">{errors.language.message}</p>}
      </div>

      <div className="bg-slate-50 rounded-lg p-4 space-y-4 border border-slate-200">
        <p className="text-sm font-semibold text-slate-900">Notification Preferences</p>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            {...register('emailNotifications')}
            className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-slate-700">Receive email notifications</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            {...register('smsNotifications')}
            className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-slate-700">Receive SMS notifications</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            {...register('inAppNotifications')}
            className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-slate-700">Receive in-app notifications</span>
        </label>
      </div>

      <div className="flex gap-3 pt-6">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 px-6 py-3 rounded-lg bg-slate-200 text-slate-900 font-semibold hover:bg-slate-300 transition-all"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold hover:from-blue-700 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Loading...' : 'Next'}
        </button>
      </div>
    </form>
  )
}
