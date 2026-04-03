'use client'

import { MFASetupComponent } from '@/components/mfa-setup'
import { useRouter } from 'next/navigation'

export default function MFASetupPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <MFASetupComponent
        onComplete={() => {
          router.push('/auth/profile')
        }}
        onCancel={() => {
          router.back()
        }}
      />
    </div>
  )
}

