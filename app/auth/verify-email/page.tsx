'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, AlertCircle, Loader2, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [message, setMessage] = useState('Verifying your email...')
  const [email, setEmail] = useState<string>('')

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = searchParams.get('token')

        if (!token) {
          setStatus('error')
          setMessage('No verification token provided. Please check your email link.')
          return
        }

        // Call the verification API
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })

        const data = await response.json()

        if (!response.ok) {
          setStatus('error')
          setMessage(data.error || 'Failed to verify email. The link may have expired.')
          return
        }

        // Email verified successfully
        setStatus('success')
        setMessage('Your email has been verified successfully!')
        setEmail(data.email || '')

        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          router.push('/')
        }, 3000)
      } catch (error) {
        setStatus('error')
        setMessage(
          error instanceof Error ? error.message : 'An error occurred while verifying your email'
        )
      }
    }

    verifyEmail()
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg shadow-xl p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Mail className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-white">Chase</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Verify Email</h1>
            <p className="text-slate-400 text-sm mt-2">Confirm your email address to access your account</p>
          </div>

          {/* Status Content */}
          {status === 'verifying' && (
            <div className="text-center py-8">
              <div className="mb-4 flex justify-center">
                <div className="relative h-12 w-12">
                  <div className="absolute inset-0 bg-blue-500 rounded-full opacity-20 animate-pulse" />
                  <Loader2 className="h-12 w-12 text-blue-400 animate-spin" />
                </div>
              </div>
              <p className="text-slate-300">{message}</p>
              <p className="text-slate-500 text-sm mt-2">This may take a few moments...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center py-8">
              <div className="mb-4 flex justify-center">
                <div className="p-3 rounded-full bg-emerald-500/20 border border-emerald-500/50">
                  <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                </div>
              </div>
              <p className="text-slate-100 font-medium mb-2">{message}</p>
              {email && (
                <p className="text-slate-400 text-sm mb-4">Email: {email}</p>
              )}
              <p className="text-slate-500 text-sm">Redirecting to dashboard in 3 seconds...</p>
              <Button
                onClick={() => router.push('/')}
                className="mt-6 w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white"
              >
                Go to Dashboard
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center py-8">
              <div className="mb-4 flex justify-center">
                <div className="p-3 rounded-full bg-red-500/20 border border-red-500/50">
                  <AlertCircle className="h-8 w-8 text-red-400" />
                </div>
              </div>
              <p className="text-slate-100 font-medium mb-4">{message}</p>
              <div className="space-y-2">
                <Button
                  onClick={() => router.push('/auth/sign-up')}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white"
                >
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/auth/login')}
                  className="w-full border-slate-600 text-slate-300 hover:bg-slate-700/50"
                >
                  Sign In
                </Button>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-slate-700 text-center">
            <p className="text-slate-400 text-sm">
              Need help?{' '}
              <a href="#" className="text-blue-400 hover:text-blue-300 font-medium">
                Contact support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
