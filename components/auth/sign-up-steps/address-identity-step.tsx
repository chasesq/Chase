import React from 'react'
import { AddressIdentitySchema, type AddressIdentityFormData } from '@/lib/validation/sign-up-schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

interface AddressIdentityStepProps {
  data: Partial<AddressIdentityFormData>
  onNext: (data: AddressIdentityFormData) => void
  onBack: () => void
  isLoading?: boolean
}

export function AddressIdentityStep({ data, onNext, onBack, isLoading }: AddressIdentityStepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressIdentityFormData>({
    resolver: zodResolver(AddressIdentitySchema),
    defaultValues: data,
  })

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      <div>
        <label htmlFor="street" className="block text-sm font-semibold text-slate-900 mb-2">
          Street Address
        </label>
        <input
          id="street"
          type="text"
          placeholder="123 Main Street"
          {...register('street')}
          className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
            errors.street
              ? 'border-red-500 bg-red-50 focus:outline-none'
              : 'border-slate-200 bg-slate-50 focus:border-blue-500 focus:outline-none'
          }`}
        />
        {errors.street && <p className="text-red-600 text-sm mt-1">{errors.street.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="city" className="block text-sm font-semibold text-slate-900 mb-2">
            City
          </label>
          <input
            id="city"
            type="text"
            placeholder="New York"
            {...register('city')}
            className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
              errors.city
                ? 'border-red-500 bg-red-50 focus:outline-none'
                : 'border-slate-200 bg-slate-50 focus:border-blue-500 focus:outline-none'
            }`}
          />
          {errors.city && <p className="text-red-600 text-sm mt-1">{errors.city.message}</p>}
        </div>

        <div>
          <label htmlFor="state" className="block text-sm font-semibold text-slate-900 mb-2">
            State
          </label>
          <input
            id="state"
            type="text"
            placeholder="NY"
            {...register('state')}
            className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
              errors.state
                ? 'border-red-500 bg-red-50 focus:outline-none'
                : 'border-slate-200 bg-slate-50 focus:border-blue-500 focus:outline-none'
            }`}
          />
          {errors.state && <p className="text-red-600 text-sm mt-1">{errors.state.message}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="zipCode" className="block text-sm font-semibold text-slate-900 mb-2">
          ZIP Code
        </label>
        <input
          id="zipCode"
          type="text"
          placeholder="10001"
          {...register('zipCode')}
          className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
            errors.zipCode
              ? 'border-red-500 bg-red-50 focus:outline-none'
              : 'border-slate-200 bg-slate-50 focus:border-blue-500 focus:outline-none'
          }`}
        />
        {errors.zipCode && <p className="text-red-600 text-sm mt-1">{errors.zipCode.message}</p>}
      </div>

      <div>
        <label htmlFor="dateOfBirth" className="block text-sm font-semibold text-slate-900 mb-2">
          Date of Birth
        </label>
        <input
          id="dateOfBirth"
          type="date"
          {...register('dateOfBirth')}
          className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
            errors.dateOfBirth
              ? 'border-red-500 bg-red-50 focus:outline-none'
              : 'border-slate-200 bg-slate-50 focus:border-blue-500 focus:outline-none'
          }`}
        />
        {errors.dateOfBirth && <p className="text-red-600 text-sm mt-1">{errors.dateOfBirth.message}</p>}
      </div>

      <div>
        <label htmlFor="governmentIdType" className="block text-sm font-semibold text-slate-900 mb-2">
          Government ID Type
        </label>
        <select
          id="governmentIdType"
          {...register('governmentIdType')}
          className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
            errors.governmentIdType
              ? 'border-red-500 bg-red-50 focus:outline-none'
              : 'border-slate-200 bg-slate-50 focus:border-blue-500 focus:outline-none'
          }`}
        >
          <option value="">Select an ID type</option>
          <option value="drivers_license">Driver&apos;s License</option>
          <option value="passport">Passport</option>
          <option value="state_id">State ID</option>
          <option value="other">Other</option>
        </select>
        {errors.governmentIdType && (
          <p className="text-red-600 text-sm mt-1">{errors.governmentIdType.message}</p>
        )}
      </div>

      <div className="space-y-3 border-t pt-6">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            {...register('termsAccepted')}
            className="mt-1 w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-slate-700">
            I agree to the <a href="#" className="text-blue-600 hover:underline">Terms and Conditions</a>
          </span>
        </label>
        {errors.termsAccepted && <p className="text-red-600 text-sm">{errors.termsAccepted.message}</p>}

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            {...register('privacyAccepted')}
            className="mt-1 w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-slate-700">
            I agree to the <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
          </span>
        </label>
        {errors.privacyAccepted && <p className="text-red-600 text-sm">{errors.privacyAccepted.message}</p>}
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
