'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Page() {
  const router = useRouter()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const sessionCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith('session='))
        
        if (sessionCookie) {
          const email = sessionCookie.split('=')[1]
          setIsAuthenticated(true)
          setUser({ email, name: email.split('@')[0] })
        } else {
          router.push('/auth/login')
        }
      } catch (error) {
        console.error('[v0] Auth check failed:', error)
        router.push('/auth/login')
      } finally {
        setIsCheckingAuth(false)
      }
    }
    
    checkAuth()
  }, [router])

  const handleLogout = async () => {
    await fetch('/api/auth/sign-out', { method: 'POST' })
    router.push('/auth/login')
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Unauthenticated users are redirected to /auth/login by useEffect
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome to Chase Banking</h1>
            <p className="text-lg text-gray-600">You are successfully logged in</p>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Account</h2>
            <div className="space-y-3">
              <p className="text-gray-700"><span className="font-medium">Email:</span> {user?.email}</p>
              <p className="text-gray-700"><span className="font-medium">Name:</span> {user?.name}</p>
              <p className="text-gray-700"><span className="font-medium">Status:</span> <span className="text-green-600 font-medium">Active</span></p>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition"
            >
              Refresh
            </button>
            <button
              onClick={handleLogout}
              className="bg-slate-600 hover:bg-slate-700 text-white font-medium px-6 py-3 rounded-lg transition"
            >
              Sign Out
            </button>
          </div>

          <div className="text-center text-gray-600 mt-8 text-sm">
            <p>© 2024 Chase Banking. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
