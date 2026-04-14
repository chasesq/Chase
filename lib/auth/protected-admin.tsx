'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { isAdminRole } from '@/lib/auth/roles'

interface ProtectedAdminProps {
  children: React.ReactNode
}

export function ProtectedAdminRoute({ children }: ProtectedAdminProps) {
  const router = useRouter()
  const { isAuthenticated, isAdmin, isLoading, profile } = useAuth()
  const [hasAccess, setHasAccess] = useState(false)

  useEffect(() => {
    // Wait for auth to finish loading
    if (isLoading) return

    // Check if user is authenticated and is admin
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    if (!isAdmin || !profile?.role || !isAdminRole(profile.role)) {
      router.push('/dashboard')
      return
    }

    setHasAccess(true)
  }, [isAuthenticated, isAdmin, isLoading, profile, router])

  // Show loading state while checking permissions
  if (isLoading || !hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="space-y-4 text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
