import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Authentication Error</CardTitle>
            <CardDescription>
              Something went wrong during authentication. Please try again.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              If you continue to experience issues, please try the following:
            </p>
            <ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground">
              <li>Clear your browser cache and cookies</li>
              <li>Try a different browser</li>
              <li>Check that JavaScript is enabled</li>
              <li>Ensure you&apos;re using a supported browser</li>
            </ul>

            <div className="flex flex-col gap-2 pt-4">
              <Button asChild className="w-full">
                <Link href="/auth/login">Back to Login</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/auth/sign-up">Create Account</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/">Go to Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
