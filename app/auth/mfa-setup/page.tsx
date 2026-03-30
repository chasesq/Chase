'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { ACULMfaBeginEnrollOptions } from '@/components/acul-mfa-begin-enroll-options'

function MFASetupContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [userData, setUserData] = useState<{ userId: string; email: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const userId = searchParams.get('user_id')
    const email = searchParams.get('email')

    if (!userId) {
      setError('User ID is required')
      return
    }

    setUserData({
      userId,
      email: email || 'user@example.com',
    })
  }, [searchParams])

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Error</h1>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => router.push('/auth/sign-up-success')}
            className="mt-4 text-blue-600 hover:underline"
          >
            Continue without 2FA
          </button>
        </div>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md">
        <ACULMfaBeginEnrollOptions
          userId={userData.userId}
          userEmail={userData.email}
          onComplete={() => {
            router.push('/auth/mfa-setup-complete')
          }}
          onSkip={() => {
            router.push('/auth/sign-up-success')
          }}
        />
      </div>
    </div>
  )
}

export default function MFASetupPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <MFASetupContent />
    </Suspense>
  )
}

