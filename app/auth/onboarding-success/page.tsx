'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function OnboardingSuccessPage() {
  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState<string | null>(null)

  const handleResendEmail = async () => {
    setIsResending(true)
    setResendMessage(null)

    try {
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user?.email) {
        throw new Error('No email found')
      }

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: session.user.email,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
            `${window.location.origin}/`,
        },
      })

      if (error) throw error

      setResendMessage('Confirmation email sent! Check your inbox.')
    } catch (error) {
      setResendMessage(
        error instanceof Error ? error.message : 'Failed to resend email. Please try again.'
      )
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Check your email</CardTitle>
            <CardDescription>
              We sent you a confirmation link to verify your account. Please check your email (including spam folder) to complete your sign up.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {resendMessage && (
              <div className={`rounded-lg p-3 text-sm ${
                resendMessage.includes('sent')
                  ? 'bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-300'
                  : 'bg-destructive/15 text-destructive'
              }`}>
                {resendMessage}
              </div>
            )}

            <div className="space-y-2">
              <Button
                onClick={handleResendEmail}
                disabled={isResending}
                variant="outline"
                className="w-full"
              >
                {isResending ? 'Sending...' : 'Resend confirmation email'}
              </Button>

              <Button asChild className="w-full">
                <Link href="/auth/login">Back to Login</Link>
              </Button>
            </div>

            <p className="text-center text-xs text-muted-foreground">
              Already verified your email?{' '}
              <Link href="/auth/login" className="underline underline-offset-4 hover:text-primary">
                Sign in here
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
