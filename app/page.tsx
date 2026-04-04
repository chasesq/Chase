'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { HomeDashboard } from '@/components/home-dashboard'

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
          try {
            // Decode the base64 encoded session data
            const sessionData = JSON.parse(atob(sessionCookie.split('=')[1]))
            setIsAuthenticated(true)
            setUser({ 
              email: sessionData.email, 
              name: sessionData.email.split('@')[0],
              accountName: sessionData.accountName,
              role: sessionData.role
            })
          } catch (decodeError) {
            // Fallback to simple extraction if decoding fails
            const email = sessionCookie.split('=')[1]
            setIsAuthenticated(true)
            setUser({ email, name: email.split('@')[0] })
          }
        } else {
          setIsAuthenticated(false)
          // Redirect to login page
          router.push('/auth/login')
        }
      } catch (error) {
        console.error('[v0] Auth check failed:', error)
        setIsAuthenticated(false)
        router.push('/auth/login')
      } finally {
        setIsCheckingAuth(false)
      }
    }
    
    checkAuth()
  }, [router])

  const handleLogout = async () => {
    await fetch('/api/auth/sign-out', { method: 'POST' })
    setIsAuthenticated(false)
    setUser(null)
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

  // Show home dashboard for authenticated users only
  return <HomeDashboard user={user} onLogout={handleLogout} />
}
