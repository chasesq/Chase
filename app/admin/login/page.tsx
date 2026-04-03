'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { AdminCredentials } from '@/components/admin-credentials'
import { Shield, Eye, EyeOff } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Login failed. Please check your credentials.')
        return
      }

      if (data.user && data.user.is_admin) {
        // Store admin session in localStorage
        localStorage.setItem('admin_session', JSON.stringify(data.user))
        // Navigate to admin dashboard
        router.push('/admin')
      } else {
        setError('This account does not have admin access.')
      }
    } catch (err) {
      setError('An error occurred during login. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Chase Admin</h1>
        </div>
        <p className="text-muted-foreground">Secure Administrative Access</p>
      </div>

      {/* Login Card */}
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin Login</CardTitle>
          <CardDescription>Enter your admin credentials to access the dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="admin@chasebank.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="font-mono"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !email || !password}
            >
              {isLoading ? 'Signing In...' : 'Sign In to Admin Dashboard'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground text-center mb-4">
              🔐 For security, this admin portal is protected. Only authorized personnel should access this page.
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push('/')}
            >
              Back to Main Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Credentials Display */}
      <AdminCredentials />

      {/* Footer */}
      <div className="mt-8 text-center text-xs text-muted-foreground max-w-md">
        <p>This is a test/development environment. Do not use production credentials here.</p>
      </div>
    </div>
  )
}
