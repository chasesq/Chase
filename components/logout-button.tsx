'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export function LogoutButton({ className, variant = 'default', ...props }: React.ComponentPropsWithoutRef<'button'> & { variant?: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      await fetch('/api/auth/sign-out', { method: 'POST' })
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleLogout}
      disabled={isLoading}
      variant={variant}
      className={className}
      {...props}
    >
      {isLoading ? 'Signing out...' : 'Sign Out'}
    </Button>
  )
}
