'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

interface ACULContextType {
  auth0Domain: string
  auth0ClientId: string
  isInitialized: boolean
}

const ACULContext = createContext<ACULContextType | undefined>(undefined)

export function ACULProvider({ children }: { children: React.ReactNode }) {
  const [warned, setWarned] = useState(false)
  const auth0Domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN || ''
  const auth0ClientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID || ''

  const value: ACULContextType = {
    auth0Domain,
    auth0ClientId,
    isInitialized: !!(auth0Domain && auth0ClientId),
  }

  // Only warn once on initialization
  useEffect(() => {
    if (!value.isInitialized && !warned) {
      console.warn('[ACUL] Auth0 credentials not configured. ACUL SDK features will not be available.')
      setWarned(true)
    }
  }, [value.isInitialized, warned])

  return <ACULContext.Provider value={value}>{children}</ACULContext.Provider>
}

export function useACUL() {
  const context = useContext(ACULContext)
  if (!context) {
    throw new Error('useACUL must be used within ACULProvider')
  }
  return context
}
