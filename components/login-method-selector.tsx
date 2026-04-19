'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Mail, Lock, Smartphone } from 'lucide-react'
import { PasswordlessForm } from '@/components/passwordless-form'
import { ACULLoginId } from '@/components/acul-login-id'

export function LoginMethodSelector({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const [activeMethod, setActiveMethod] = useState<'passwordless' | 'acul'>('passwordless')

  const handleACULSuccess = (response: any) => {
    console.log('[Login] ACUL success:', response)
    // Handle successful Auth0 login
    // Typically, Auth0 will redirect to the configured callback URL
  }

  const handleACULError = (error: Error) => {
    console.error('[Login] ACUL error:', error)
  }

  return (
    <div className={cn('w-full', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>Choose your preferred authentication method</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeMethod} onValueChange={(value) => setActiveMethod(value as any)}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="passwordless" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span className="hidden sm:inline">OTP</span>
              </TabsTrigger>
              <TabsTrigger value="acul" className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                <span className="hidden sm:inline">Auth0</span>
              </TabsTrigger>
            </TabsList>



            <TabsContent value="passwordless" className="space-y-4">
              <div className="text-sm text-muted-foreground mb-4">
                Sign in using a one-time code sent to your email or phone.
              </div>
              <PasswordlessForm />
            </TabsContent>

            <TabsContent value="acul" className="space-y-4">
              <div className="text-sm text-muted-foreground mb-4">
                Sign in using Auth0's Universal Login.
              </div>
              <ACULLoginId 
                onSuccess={handleACULSuccess}
                onError={handleACULError}
              />
            </TabsContent>
          </Tabs>

          <div className="mt-6 border-t pt-4">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link href="/auth/sign-up" className="font-medium text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
