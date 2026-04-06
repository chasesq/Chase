'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, Mail } from 'lucide-react'

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [errorCode, setErrorCode] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const router = useRouter()

  const handleResendVerification = async () => {
    if (!email) {
      setError('Please enter your email address first')
      return
    }
    
    setIsResending(true)
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      
      if (response.ok) {
        setResendSuccess(true)
        setError(null)
        setErrorCode(null)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to resend verification email')
      }
    } catch {
      setError('Failed to resend verification email')
    } finally {
      setIsResending(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setErrorCode(null)
    setResendSuccess(false)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setErrorCode(data.code || null)
        throw new Error(data.error || 'Login failed')
      }

      // Store user profile in localStorage
      localStorage.setItem('user_profile', JSON.stringify(data.user))
      localStorage.setItem('userEmail', email)

      // Redirect to dashboard on success
      router.push('/')
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred during sign in. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>Enter your email below to login to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/auth/forgot-password"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {resendSuccess && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <Mail className="h-4 w-4 text-green-500" />
                  <p className="text-sm text-green-600">Verification email sent! Please check your inbox.</p>
                </div>
              )}
              {error && (
                <div className="flex flex-col gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                  {(errorCode === 'EMAIL_NOT_CONFIRMED' || errorCode === 'INVALID_CREDENTIALS') && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleResendVerification}
                      disabled={isResending}
                      className="w-fit text-xs"
                    >
                      {isResending ? 'Sending...' : 'Resend verification email'}
                    </Button>
                  )}
                </div>
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{' '}
              <Link href="/auth/sign-up" className="underline underline-offset-4">
                Sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
