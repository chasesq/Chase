'use client'

import React, { useEffect, useState, useRef } from 'react'
import ChaseInitializationScreen from './chase-initialization-screen'

interface InitializationWrapperProps {
  children: React.ReactNode
  minDisplayTime?: number
}

/**
 * Wrapper that shows initialization screen while app loads
 * Ensures smooth transition and proper data loading
 */
export function InitializationWrapper({
  children,
  minDisplayTime = 1500,
}: InitializationWrapperProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  const initStartTimeRef = useRef<number>(Date.now())
  const contentReadyRef = useRef<boolean>(false)

  // Mark content as ready when mounted
  useEffect(() => {
    // Give providers time to initialize
    const readyTimer = setTimeout(() => {
      contentReadyRef.current = true
      checkCanHideLoadingScreen()
    }, 500)

    return () => clearTimeout(readyTimer)
  }, [])

  // Check if we can hide the loading screen
  const checkCanHideLoadingScreen = () => {
    if (!contentReadyRef.current) return

    // Calculate elapsed time since init started
    const elapsedTime = Date.now() - initStartTimeRef.current

    // Wait for minimum display time before hiding
    if (elapsedTime >= minDisplayTime) {
      setIsLoading(false)
      setIsInitialized(true)
    } else {
      // Schedule another check
      const remainingTime = minDisplayTime - elapsedTime
      const timer = setTimeout(() => {
        setIsLoading(false)
        setIsInitialized(true)
      }, remainingTime)
      return () => clearTimeout(timer)
    }
  }

  return (
    <>
      <ChaseInitializationScreen
        isLoading={isLoading}
        onLoadComplete={() => {
          console.log('[v0] App initialization complete')
        }}
      />
      {isInitialized && <>{children}</>}
    </>
  )
}

export default InitializationWrapper
