import React from 'react'
import { Check } from 'lucide-react'

export interface Step {
  id: number
  title: string
  description: string
}

interface StepIndicatorProps {
  steps: Step[]
  currentStep: number
  completedSteps: number[]
}

export function StepIndicator({ steps, currentStep, completedSteps }: StepIndicatorProps) {
  return (
    <div className="w-full">
      {/* Desktop View */}
      <div className="hidden sm:block">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg
                    transition-all duration-300
                    ${
                      currentStep === step.id
                        ? 'bg-gradient-to-r from-blue-600 to-blue-400 text-white shadow-lg scale-110'
                        : completedSteps.includes(step.id)
                          ? 'bg-gradient-to-r from-green-600 to-green-400 text-white'
                          : 'bg-slate-200 text-slate-600'
                    }
                  `}
                >
                  {completedSteps.includes(step.id) ? <Check size={24} /> : step.id}
                </div>
                <div className="mt-2 text-center">
                  <p
                    className={`text-sm font-semibold ${
                      currentStep === step.id || completedSteps.includes(step.id)
                        ? 'text-slate-900'
                        : 'text-slate-500'
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-slate-500 hidden sm:block">{step.description}</p>
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-1 mx-2 mb-8">
                  <div
                    className={`h-full rounded transition-all duration-300 ${
                      completedSteps.includes(step.id)
                        ? 'bg-gradient-to-r from-green-600 to-green-400'
                        : 'bg-slate-200'
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Mobile View */}
      <div className="block sm:hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="text-center flex-1">
            <p className="text-xs text-slate-500">Step {currentStep} of {steps.length}</p>
            <p className="text-sm font-semibold text-slate-900 mt-1">
              {steps.find((s) => s.id === currentStep)?.title}
            </p>
          </div>
        </div>
        {/* Progress Bar */}
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-600 to-blue-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}
