'use client'

import { useGlobalLoading } from '@/lib/global-loading-context'
import { cn } from '@/lib/utils'

export function GlobalLoadingOverlay() {
  const { isLoading } = useGlobalLoading()

  if (!isLoading) return null

  return (
    <div
      className={cn(
        'fixed inset-0 bg-black/50 flex items-center justify-center z-50',
        'backdrop-blur-sm transition-opacity duration-200',
        isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
    >
      <div className="bg-white rounded-lg shadow-lg p-8 flex flex-col items-center gap-4">
        {/* Loading spinner */}
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>

        {/* Loading text */}
        <div className="text-center">
          <p className="font-medium text-gray-900">Loading your data</p>
          <p className="text-sm text-gray-500 mt-1">
            Please wait while we prepare your information...
          </p>
        </div>

        {/* Loading bar */}
        <div className="w-48 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary/50 rounded-full"
            style={{
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          ></div>
        </div>
      </div>
    </div>
  )
}
