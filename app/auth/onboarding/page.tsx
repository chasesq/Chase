'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { OnboardingWizard } from '@/components/onboarding-wizard'

export default function OnboardingPage() {
  const router = useRouter()
  const [userName, setUserName] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get user info from localStorage
    const name = localStorage.getItem('userName') || 'User'
    const onboardingComplete = localStorage.getItem('onboarding_complete') === 'true'

    if (onboardingComplete) {
      router.push('/')
      return
    }

    setUserName(name)
    setIsLoading(false)
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block p-3 rounded-full bg-blue-500/20 mb-4">
            <div className="h-8 w-8 border-2 border-blue-500 border-t-blue-400 rounded-full animate-spin" />
          </div>
          <p className="text-slate-300">Loading your onboarding...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <OnboardingWizard
        userName={userName}
        balance={0}
        onComplete={() => {
          setTimeout(() => {
            router.push('/')
          }, 1500)
        }}
      />
    </div>
  )
}
