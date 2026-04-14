'use client'

import React, { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { StepIndicator, type Step } from './step-indicator'
import { PersonalInfoStep } from './sign-up-steps/personal-info-step'
import { AddressIdentityStep } from './sign-up-steps/address-identity-step'
import { PreferencesStep } from './sign-up-steps/preferences-step'
import { SecurityStep } from './sign-up-steps/security-step'
import { ReviewStep } from './sign-up-steps/review-step'
import {
  type PersonalInfoFormData,
  type AddressIdentityFormData,
  type PreferencesFormData,
  type SecurityFormData,
  type MultiStepSignUpFormData,
} from '@/lib/validation/sign-up-schema'

const STEPS: Step[] = [
  { id: 1, title: 'Personal Info', description: 'Your details' },
  { id: 2, title: 'Address & ID', description: 'Verify identity' },
  { id: 3, title: 'Preferences', description: 'Your choices' },
  { id: 4, title: 'Security', description: 'Your password' },
  { id: 5, title: 'Review', description: 'Confirm all' },
]

interface MultiStepSignUpProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function MultiStepSignUp({ onSuccess, onCancel }: MultiStepSignUpProps) {
  const router = useRouter()
  const { signUp } = useAuth()

  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [formData, setFormData] = useState<Partial<MultiStepSignUpFormData>>({})

  const handlePersonalInfoNext = useCallback((data: PersonalInfoFormData) => {
    setFormData((prev) => ({ ...prev, ...data }))
    setCompletedSteps((prev) => [...new Set([...prev, 1])])
    setCurrentStep(2)
    setError(null)
  }, [])

  const handleAddressIdentityNext = useCallback((data: AddressIdentityFormData) => {
    setFormData((prev) => ({ ...prev, ...data }))
    setCompletedSteps((prev) => [...new Set([...prev, 2])])
    setCurrentStep(3)
    setError(null)
  }, [])

  const handlePreferencesNext = useCallback((data: PreferencesFormData) => {
    setFormData((prev) => ({ ...prev, ...data }))
    setCompletedSteps((prev) => [...new Set([...prev, 3])])
    setCurrentStep(4)
    setError(null)
  }, [])

  const handleSecurityNext = useCallback((data: SecurityFormData) => {
    setFormData((prev) => ({ ...prev, ...data }))
    setCompletedSteps((prev) => [...new Set([...prev, 4])])
    setCurrentStep(5)
    setError(null)
  }, [])

  const handleReviewSubmit = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Prepare the sign-up data
      const signUpData = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        street: formData.street,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        dateOfBirth: formData.dateOfBirth,
        governmentIdType: formData.governmentIdType,
        accountType: formData.accountType,
        currency: formData.currency,
        language: formData.language,
        emailNotifications: formData.emailNotifications,
        smsNotifications: formData.smsNotifications,
        inAppNotifications: formData.inAppNotifications,
        twoFactorEnabled: formData.twoFactorEnabled,
      }

      // Call the sign-up API
      const response = await fetch('/api/auth/sign-up', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signUpData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create account')
      }

      setSuccessMessage('Account created successfully! Redirecting to login...')
      setCompletedSteps((prev) => [...new Set([...prev, 5])])

      // Redirect to login after a short delay
      setTimeout(() => {
        if (onSuccess) {
          onSuccess()
        } else {
          router.push('/login')
        }
      }, 2000)
    } catch (err) {
      console.error('[SignUp] Error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred during sign-up')
    } finally {
      setIsLoading(false)
    }
  }, [formData, router, onSuccess])

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      setError(null)
    }
  }, [currentStep])

  const handleEdit = useCallback((step: number) => {
    setCurrentStep(step)
    setError(null)
  }, [])

  if (successMessage) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-xl">✓</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Account Created!</h2>
        <p className="text-slate-600">{successMessage}</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Step Indicator */}
      <div className="mb-8">
        <StepIndicator steps={STEPS} currentStep={currentStep} completedSteps={completedSteps} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm font-semibold">Error</p>
          <p className="text-red-700 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Form Content */}
      <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
        {currentStep === 1 && (
          <PersonalInfoStep
            data={formData}
            onNext={handlePersonalInfoNext}
            isLoading={isLoading}
          />
        )}

        {currentStep === 2 && (
          <AddressIdentityStep
            data={formData}
            onNext={handleAddressIdentityNext}
            onBack={handleBack}
            isLoading={isLoading}
          />
        )}

        {currentStep === 3 && (
          <PreferencesStep
            data={formData}
            onNext={handlePreferencesNext}
            onBack={handleBack}
            isLoading={isLoading}
          />
        )}

        {currentStep === 4 && (
          <SecurityStep
            data={formData}
            onNext={handleSecurityNext}
            onBack={handleBack}
            isLoading={isLoading}
          />
        )}

        {currentStep === 5 && (
          <ReviewStep
            data={formData}
            onSubmit={handleReviewSubmit}
            onEdit={handleEdit}
            isLoading={isLoading}
          />
        )}

        {/* Cancel Button */}
        {currentStep === 1 && (
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 rounded-lg border-2 border-slate-200 text-slate-900 font-semibold hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Help Text */}
      <p className="text-center text-xs text-slate-500 mt-6">
        Already have an account?{' '}
        <a href="/login" className="text-blue-600 hover:underline font-semibold">
          Sign in here
        </a>
      </p>
    </div>
  )
}
