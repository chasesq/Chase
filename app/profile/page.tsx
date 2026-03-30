'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ProfileForm } from '@/components/profile-form'
import { StepUpAuthModal } from '@/components/stepup-auth-modal'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Lock } from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showStepUp, setShowStepUp] = useState(false)

  useEffect(() => {
    // Get email from session or authentication state
    // This is a placeholder - integrate with your actual auth system
    const getUserEmail = async () => {
      try {
        // Replace with your actual auth check
        const storedEmail = localStorage.getItem('userEmail')
        if (storedEmail) {
          setEmail(storedEmail)
        }
      } catch (error) {
        console.error('Failed to get user email:', error)
      } finally {
        setLoading(false)
      }
    }

    getUserEmail()
  }, [])

  const handleStepUpRequired = () => {
    setShowStepUp(true)
  }

  const handleStepUpComplete = () => {
    setShowStepUp(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin">
          <Lock className="h-8 w-8 text-[#0a4fa6]" />
        </div>
      </div>
    )
  }

  if (!email) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4">
        <h1 className="text-2xl font-semibold">Access Required</h1>
        <p className="text-muted-foreground">Please log in to view your profile</p>
        <Button onClick={() => router.push('/auth/login')} className="bg-[#0a4fa6] hover:bg-[#083d80]">
          Go to Login
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background border-b">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="text-muted-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold flex-1">My Profile</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-6">
        <ProfileForm email={email} onStepUpRequired={handleStepUpRequired} />

        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-600 dark:text-blue-400">
            💡 <strong>Tip:</strong> Changes to sensitive information may require additional verification for security.
          </p>
        </div>
      </div>

      {/* Step-Up Auth Modal */}
      <StepUpAuthModal
        isOpen={showStepUp}
        onClose={() => setShowStepUp(false)}
        onComplete={handleStepUpComplete}
        requirementReason="to update your profile information"
      />
    </div>
  )
}
