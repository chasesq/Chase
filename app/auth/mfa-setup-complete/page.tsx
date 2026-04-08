'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function MFASetupCompletePage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <CardTitle className="text-2xl">2FA Enabled Successfully!</CardTitle>
            <CardDescription>
              Your account is now protected with two-factor authentication
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-3">
                <span className="text-green-600 font-bold">✓</span>
                <div>
                  <p className="font-semibold text-gray-900">Authenticator app configured</p>
                  <p className="text-xs">Your authenticator app is now linked to your account</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-600 font-bold">✓</span>
                <div>
                  <p className="font-semibold text-gray-900">Backup codes saved</p>
                  <p className="text-xs">You can use backup codes to recover your account</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-600 font-bold">✓</span>
                <div>
                  <p className="font-semibold text-gray-900">Enhanced security active</p>
                  <p className="text-xs">You&apos;ll need your authenticator code to sign in</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>Next time you sign in:</strong> You&apos;ll be asked for a code from your authenticator app in addition to your password.
              </p>
            </div>

            <Button asChild className="w-full">
              <Link href="/auth/login">Go to Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
