'use client'

import React, { createContext, useContext } from 'react'

interface ACULContextType {
  auth0Domain: string
  auth0ClientId: string
  isInitialized: boolean
}

const ACULContext = createContext<ACULContextType | undefined>(undefined)

export function ACULProvider({ children }: { children: React.ReactNode }) {
  const auth0Domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN || ''
  const auth0ClientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID || ''

  const value: ACULContextType = {
    auth0Domain,
    auth0ClientId,
    isInitialized: !!(auth0Domain && auth0ClientId),
  }

  if (!value.isInitialized) {
    console.warn('[ACUL] Auth0 credentials not configured. ACUL SDK features will not be available.')
  }

  return <ACULContext.Provider value={value}>{children}</ACULContext.Provider>
}

export function useACUL() {
  const context = useContext(ACULContext)
  if (!context) {
    throw new Error('useACUL must be used within ACULProvider')
  }
  return context
}
