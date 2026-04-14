import React from 'react'
import { PersonalInfoSchema, type PersonalInfoFormData } from '@/lib/validation/sign-up-schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

interface PersonalInfoStepProps {
  data: Partial<PersonalInfoFormData>
  onNext: (data: PersonalInfoFormData) => void
  isLoading?: boolean
}

export function PersonalInfoStep({ data, onNext, isLoading }: PersonalInfoStepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PersonalInfoFormData>({
    resolver: zodResolver(PersonalInfoSchema),
    defaultValues: data,
  })

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      <div>
        <label htmlFor="firstName" className="block text-sm font-semibold text-slate-900 mb-2">
          First Name
        </label>
        <input
          id="firstName"
          type="text"
          placeholder="John"
          {...register('firstName')}
          className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
            errors.firstName
              ? 'border-red-500 bg-red-50 focus:outline-none'
              : 'border-slate-200 bg-slate-50 focus:border-blue-500 focus:outline-none'
          }`}
        />
        {errors.firstName && <p className="text-red-600 text-sm mt-1">{errors.firstName.message}</p>}
      </div>

      <div>
        <label htmlFor="lastName" className="block text-sm font-semibold text-slate-900 mb-2">
          Last Name
        </label>
        <input
          id="lastName"
          type="text"
          placeholder="Doe"
          {...register('lastName')}
          className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
            errors.lastName
              ? 'border-red-500 bg-red-50 focus:outline-none'
              : 'border-slate-200 bg-slate-50 focus:border-blue-500 focus:outline-none'
          }`}
        />
        {errors.lastName && <p className="text-red-600 text-sm mt-1">{errors.lastName.message}</p>}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-slate-900 mb-2">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          placeholder="john@example.com"
          {...register('email')}
          className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
            errors.email
              ? 'border-red-500 bg-red-50 focus:outline-none'
              : 'border-slate-200 bg-slate-50 focus:border-blue-500 focus:outline-none'
          }`}
        />
        {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-semibold text-slate-900 mb-2">
          Phone Number
        </label>
        <input
          id="phone"
          type="tel"
          placeholder="+1 (555) 123-4567"
          {...register('phone')}
          className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
            errors.phone
              ? 'border-red-500 bg-red-50 focus:outline-none'
              : 'border-slate-200 bg-slate-50 focus:border-blue-500 focus:outline-none'
          }`}
        />
        {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold hover:from-blue-700 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Loading...' : 'Next'}
      </button>
    </form>
  )
}
