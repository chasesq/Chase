'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Mail, Lock, Smartphone } from 'lucide-react'
import { SignUpForm } from '@/components/sign-up-form'
import { PasswordlessForm } from '@/components/passwordless-form'

export function AuthMethodSelector({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const [activeMethod, setActiveMethod] = useState<'password' | 'passwordless' | 'acul'>('password')

  return (
    <div className={cn('w-full', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Create Account</CardTitle>
          <CardDescription>Choose your preferred authentication method</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeMethod} onValueChange={(value) => setActiveMethod(value as any)}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                <span className="hidden sm:inline">Password</span>
              </TabsTrigger>
              <TabsTrigger value="passwordless" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span className="hidden sm:inline">OTP</span>
              </TabsTrigger>
              <TabsTrigger value="acul" className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                <span className="hidden sm:inline">Auth0</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="password" className="space-y-4">
              <div className="text-sm text-muted-foreground mb-4">
                Create an account with email and password. You'll set up two-factor authentication after signup.
              </div>
              <SignUpForm />
            </TabsContent>

            <TabsContent value="passwordless" className="space-y-4">
              <div className="text-sm text-muted-foreground mb-4">
                Sign up using a one-time code sent to your email or phone. No password needed.
              </div>
              <PasswordlessForm />
            </TabsContent>

            <TabsContent value="acul" className="space-y-4">
              <div className="text-sm text-muted-foreground mb-4">
                Create an account using Auth0's Universal Login. Simple, secure, and trusted by enterprises.
              </div>
              <Card className="border-2 border-dashed">
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Auth0 ACUL component will appear here when configured.
                    </p>
                    <Button disabled variant="outline" className="w-full">
                      Auth0 Signup (Coming Soon)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-6 border-t pt-4">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/auth/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
