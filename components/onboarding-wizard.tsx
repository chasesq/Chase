'use client'

import { useState } from 'react'
import { ChevronRight, CheckCircle2, Target, Lock, Users, Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface OnboardingWizardProps {
  userName: string
  accountNumber?: string
  balance?: number
  onComplete?: () => void
}

export function OnboardingWizard({ userName, accountNumber, balance = 0, onComplete }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [isMinimized, setIsMinimized] = useState(false)

  const steps = [
    {
      title: "Welcome to Chase Banking",
      description: "We're glad to have you on board",
      content: (
        <div className="space-y-4">
          <p className="text-slate-300">Hi {userName}! Your secure banking account is ready.</p>
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30 space-y-2">
            <p className="text-sm text-slate-300"><span className="font-semibold">Account Status:</span> Active</p>
            <p className="text-sm text-slate-300"><span className="font-semibold">Starting Balance:</span> ${balance.toFixed(2)}</p>
            {accountNumber && (
              <p className="text-sm text-slate-300"><span className="font-semibold">Checking Account:</span> ...{accountNumber.slice(-4)}</p>
            )}
          </div>
        </div>
      ),
      icon: <Sparkles className="h-6 w-6" />,
    },
    {
      title: "Confirm Your Account",
      description: "Review your primary checking account",
      content: (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-slate-700/50 border border-slate-600">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-100">Chase Checking Account</h3>
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            </div>
            <div className="space-y-2 text-sm text-slate-300">
              <p><span className="text-slate-400">Type:</span> Checking</p>
              <p><span className="text-slate-400">Status:</span> <span className="text-emerald-400">Active</span></p>
              <p><span className="text-slate-400">Current Balance:</span> ${balance.toFixed(2)}</p>
            </div>
          </div>
          <p className="text-sm text-slate-400">This is your primary account. You can create additional savings or money market accounts anytime.</p>
        </div>
      ),
      icon: <Target className="h-6 w-6" />,
    },
    {
      title: "Secure Your Account",
      description: "Set up additional security measures",
      content: (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-emerald-300">Password Protection</p>
                <p className="text-sm text-emerald-200/70">Active on your account</p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-lg bg-slate-700/50 border border-slate-600">
            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 text-slate-400 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-100">Two-Factor Authentication</p>
                <p className="text-sm text-slate-400 mb-3">Add an extra layer of security to your account</p>
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-500 text-white"
                  onClick={() => alert('Two-factor authentication setup would be implemented here')}
                >
                  Enable Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      ),
      icon: <Lock className="h-6 w-6" />,
    },
    {
      title: "Add Beneficiaries",
      description: "Set up payees for easy transfers",
      content: (
        <div className="space-y-4">
          <p className="text-sm text-slate-300">Add people you frequently send money to for quick access.</p>
          <div className="p-4 rounded-lg bg-slate-700/50 border border-slate-600 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-300">No beneficiaries added yet</p>
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-500 text-white"
                onClick={() => alert('Add beneficiary form would open here')}
              >
                Add Beneficiary
              </Button>
            </div>
          </div>
          <p className="text-xs text-slate-500">You can add beneficiaries anytime from your account settings.</p>
        </div>
      ),
      icon: <Users className="h-6 w-6" />,
    },
    {
      title: "You&apos;re All Set!",
      description: "Start managing your finances",
      content: (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5" />
              <div>
                <p className="font-semibold text-emerald-300">Account Setup Complete</p>
                <p className="text-sm text-emerald-200/70">Your account is ready to use</p>
              </div>
            </div>
          </div>
          <div className="space-y-2 text-sm text-slate-300">
            <p>✓ Account created and verified</p>
            <p>✓ Zero balance checked account active</p>
            <p>✓ Security settings configured</p>
          </div>
          <p className="text-sm text-slate-400">Start by exploring your dashboard or adding funds to your account.</p>
        </div>
      ),
      icon: <CheckCircle2 className="h-6 w-6" />,
    },
  ]

  const handleNext = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep])
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep])
    }

    try {
      // Mark onboarding as complete
      await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: localStorage.getItem('userId') }),
      })

      localStorage.setItem('onboarding_complete', 'true')
      onComplete?.()
    } catch (error) {
      console.error('[v0] Error completing onboarding:', error)
    }
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="p-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg transition-all duration-300 flex items-center justify-center h-12 w-12"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {steps[currentStep].icon && (
              <div className="p-2 rounded-lg bg-white/20">
                {steps[currentStep].icon}
              </div>
            )}
            <div>
              <h3 className="font-semibold text-white text-sm">{steps[currentStep].title}</h3>
              <p className="text-xs text-blue-100">{steps[currentStep].description}</p>
            </div>
          </div>
          <button
            onClick={() => {
              handleComplete()
              setIsMinimized(true)
            }}
            className="p-1 text-white hover:bg-white/20 rounded transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-slate-700">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          {steps[currentStep].content}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-700/50 border-t border-slate-700 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-400">
            Step {currentStep + 1} of {steps.length}
          </p>
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={handlePrevious}
                className="border-slate-600 text-slate-300 hover:bg-slate-600"
              >
                Previous
              </Button>
            )}
            {currentStep < steps.length - 1 ? (
              <Button
                size="sm"
                onClick={handleNext}
                className="bg-blue-600 hover:bg-blue-500 text-white"
              >
                Next
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleComplete}
                className="bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                Complete
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
