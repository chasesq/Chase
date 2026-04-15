'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

interface ChaseSplashScreenProps {
  onComplete: () => void
  duration?: number
}

export function ChaseSplashScreen({ onComplete, duration = 2500 }: ChaseSplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      // Call onComplete after fade-out animation
      setTimeout(onComplete, 500)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onComplete])

  if (!isVisible) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-[#0a4fa6] transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="flex flex-col items-center justify-center gap-8">
        {/* Chase Logo - using the exact image provided */}
        <div className="relative w-24 h-24 animate-pulse">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-SpCti5OhtRFi3XA8bvFH2bO1ldrhTR.png"
            alt="Chase Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>
    </div>
  )
}
