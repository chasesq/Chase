'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useNeonAuth } from '@/lib/auth/neon-context'

export function LogoutButton({ className, variant = 'default', ...props }: React.ComponentPropsWithoutRef<'button'> & { variant?: string }) {
  const { signOut, isLoading } = useNeonAuth()

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Logout failed:', error)
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
