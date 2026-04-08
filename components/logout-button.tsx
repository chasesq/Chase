'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { signOut } from '@/lib/auth/actions'

export function LogoutButton({ className, variant = 'default', ...props }: React.ComponentPropsWithoutRef<'button'> & { variant?: string }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      await signOut()
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
