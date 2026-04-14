import React, { useMemo } from 'react'
import { SecuritySchema, type SecurityFormData } from '@/lib/validation/sign-up-schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Check, X } from 'lucide-react'

interface SecurityStepProps {
  data: Partial<SecurityFormData>
  onNext: (data: SecurityFormData) => void
  onBack: () => void
  isLoading?: boolean
}

function getPasswordStrength(password: string) {
  let strength = 0
  if (!password) return { score: 0, label: 'No password', color: 'bg-slate-300' }

  if (password.length >= 8) strength++
  if (password.length >= 12) strength++
  if (/[A-Z]/.test(password)) strength++
  if (/[a-z]/.test(password)) strength++
  if (/[0-9]/.test(password)) strength++
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++

  const scoreMap = {
    0: { label: 'Very Weak', color: 'bg-red-500' },
    1: { label: 'Weak', color: 'bg-red-400' },
    2: { label: 'Fair', color: 'bg-yellow-500' },
    3: { label: 'Good', color: 'bg-blue-500' },
    4: { label: 'Strong', color: 'bg-green-500' },
    5: { label: 'Very Strong', color: 'bg-green-600' },
    6: { label: 'Very Strong', color: 'bg-green-600' },
  }

  return { score: strength, ...scoreMap[strength as keyof typeof scoreMap] }
}

export function SecurityStep({ data, onNext, onBack, isLoading }: SecurityStepProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SecurityFormData>({
    resolver: zodResolver(SecuritySchema),
    defaultValues: data,
  })

  const password = watch('password')
  const confirmPassword = watch('confirmPassword')
  const strengthInfo = useMemo(() => getPasswordStrength(password || ''), [password])

  const passwordRequirements = [
    { regex: /.{8,}/, label: 'At least 8 characters' },
    { regex: /[A-Z]/, label: 'One uppercase letter' },
    { regex: /[a-z]/, label: 'One lowercase letter' },
    { regex: /[0-9]/, label: 'One number' },
    { regex: /[!@#$%^&*(),.?":{}|<>]/, label: 'One special character' },
  ]

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      <div>
        <label htmlFor="password" className="block text-sm font-semibold text-slate-900 mb-2">
          Create Password
        </label>
        <input
          id="password"
          type="password"
          placeholder="Enter a strong password"
          {...register('password')}
          className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
            errors.password
              ? 'border-red-500 bg-red-50 focus:outline-none'
              : 'border-slate-200 bg-slate-50 focus:border-blue-500 focus:outline-none'
          }`}
        />
        {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>}

        {password && (
          <div className="mt-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                <div className={`h-full ${strengthInfo.color} transition-all`} style={{ width: `${(strengthInfo.score / 6) * 100}%` }} />
              </div>
              <span className={`text-xs font-semibold ${strengthInfo.color === 'bg-red-500' || strengthInfo.color === 'bg-red-400' ? 'text-red-600' : strengthInfo.color === 'bg-yellow-500' ? 'text-yellow-600' : 'text-green-600'}`}>
                {strengthInfo.label}
              </span>
            </div>

            <div className="space-y-1">
              {passwordRequirements.map((req, index) => {
                const isMet = req.regex.test(password)
                return (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    {isMet ? (
                      <Check size={16} className="text-green-600" />
                    ) : (
                      <X size={16} className="text-slate-400" />
                    )}
                    <span className={isMet ? 'text-slate-900' : 'text-slate-500'}>{req.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-900 mb-2">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          placeholder="Re-enter your password"
          {...register('confirmPassword')}
          className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
            errors.confirmPassword
              ? 'border-red-500 bg-red-50 focus:outline-none'
              : 'border-slate-200 bg-slate-50 focus:border-blue-500 focus:outline-none'
          }`}
        />
        {errors.confirmPassword && <p className="text-red-600 text-sm mt-1">{errors.confirmPassword.message}</p>}
        {password && confirmPassword && password === confirmPassword && (
          <p className="text-green-600 text-sm mt-1 flex items-center gap-1">
            <Check size={16} /> Passwords match
          </p>
        )}
      </div>

      <label className="flex items-center gap-3 cursor-pointer p-3 bg-blue-50 rounded-lg border border-blue-200">
        <input
          type="checkbox"
          {...register('twoFactorEnabled')}
          className="w-5 h-5 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
        />
        <div>
          <p className="text-sm font-semibold text-slate-900">Enable Two-Factor Authentication</p>
          <p className="text-xs text-slate-600">Recommended for added security</p>
        </div>
      </label>

      <div className="border-t pt-6 space-y-4">
        <p className="text-sm font-semibold text-slate-900">Security Question (Optional)</p>

        <div>
          <label htmlFor="securityQuestion" className="block text-sm text-slate-700 mb-2">
            Security Question
          </label>
          <input
            id="securityQuestion"
            type="text"
            placeholder="e.g., What is your favorite book?"
            {...register('securityQuestion')}
            className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 bg-slate-50 focus:border-blue-500 focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label htmlFor="securityAnswer" className="block text-sm text-slate-700 mb-2">
            Security Answer
          </label>
          <input
            id="securityAnswer"
            type="text"
            placeholder="Your answer"
            {...register('securityAnswer')}
            className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
              errors.securityAnswer
                ? 'border-red-500 bg-red-50 focus:outline-none'
                : 'border-slate-200 bg-slate-50 focus:border-blue-500 focus:outline-none'
            }`}
          />
          {errors.securityAnswer && <p className="text-red-600 text-sm mt-1">{errors.securityAnswer.message}</p>}
        </div>
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
