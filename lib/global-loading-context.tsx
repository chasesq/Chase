'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'

interface LoadingState {
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  startLoading: (key: string) => void
  stopLoading: (key: string) => void
  loadingKeys: Set<string>
}

const GlobalLoadingContext = createContext<LoadingState | undefined>(undefined)

export function GlobalLoadingProvider({ children }: { children: React.ReactNode }) {
  const [loadingKeys, setLoadingKeys] = useState<Set<string>>(new Set())

  const startLoading = useCallback((key: string) => {
    setLoadingKeys((prev) => new Set([...prev, key]))
  }, [])

  const stopLoading = useCallback((key: string) => {
    setLoadingKeys((prev) => {
      const newSet = new Set(prev)
      newSet.delete(key)
      return newSet
    })
  }, [])

  const isLoading = loadingKeys.size > 0

  return (
    <GlobalLoadingContext.Provider
      value={{
        isLoading,
        setIsLoading: (loading) => {
          if (loading) {
            setLoadingKeys(new Set(['global']))
          } else {
            setLoadingKeys(new Set())
          }
        },
        startLoading,
        stopLoading,
        loadingKeys,
      }}
    >
      {children}
    </GlobalLoadingContext.Provider>
  )
}

export function useGlobalLoading() {
  const context = useContext(GlobalLoadingContext)
  if (!context) {
    throw new Error('useGlobalLoading must be used within GlobalLoadingProvider')
  }
  return context
}
