'use client'

import React, { useEffect, useState } from 'react'

interface ChaseInitializationScreenProps {
  isLoading: boolean
  onLoadComplete?: () => void
}

/**
 * Chase branded initialization screen
 * Displays the Chase logo on blue background while app loads
 */
export function ChaseInitializationScreen({
  isLoading,
  onLoadComplete,
}: ChaseInitializationScreenProps) {
  const [showScreen, setShowScreen] = useState(true)
  const [isAnimatingOut, setIsAnimatingOut] = useState(false)

  useEffect(() => {
    if (!isLoading && showScreen) {
      // Start fade out animation
      setIsAnimatingOut(true)
      // Complete fade out after animation
      const timer = setTimeout(() => {
        setShowScreen(false)
        onLoadComplete?.()
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isLoading, showScreen, onLoadComplete])

  if (!showScreen) {
    return null
  }

  return (
    <div
      className={`fixed inset-0 bg-gradient-to-br from-[#0a4fa6] via-[#0953b8] to-[#083d80] flex items-center justify-center z-50 transition-opacity duration-300 ${
        isAnimatingOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Main content container */}
      <div className="flex flex-col items-center justify-center w-full h-full">
        {/* Chase Logo */}
        <div className="flex items-center justify-center mb-8">
          <svg
            width="120"
            height="120"
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="animate-pulse"
          >
            {/* Chase logo - geometric squares */}
            <rect x="30" y="30" width="25" height="25" fill="white" />
            <rect x="65" y="30" width="25" height="25" fill="white" />
            <rect x="30" y="65" width="25" height="25" fill="white" />
            <rect x="65" y="65" width="25" height="25" fill="#0a4fa6" />
          </svg>
        </div>

        {/* Loading text */}
        <div className="text-center space-y-2">
          <p className="text-white text-lg font-semibold">Initializing</p>
          <p className="text-blue-100 text-sm">
            Please wait while we prepare everything
          </p>
        </div>

        {/* Loading dots animation */}
        <div className="flex gap-1 mt-6">
          {[0, 1, 2].map((dot) => (
            <div
              key={dot}
              className="w-2 h-2 rounded-full bg-white"
              style={{
                animation: `bounce 1.4s ease-in-out ${dot * 0.16}s infinite`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a4fa6]/20 pointer-events-none" />

      {/* Animation styles */}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% {
            opacity: 0.3;
            transform: translateY(0);
          }
          40% {
            opacity: 1;
            transform: translateY(-6px);
          }
        }
      `}</style>
    </div>
  )
}

export default ChaseInitializationScreen
