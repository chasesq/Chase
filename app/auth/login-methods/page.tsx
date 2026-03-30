import { LoginMethodSelector } from '@/components/login-method-selector'

export default function LoginMethodsPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4">
      <div className="w-full max-w-2xl">
        <LoginMethodSelector />
      </div>
    </div>
  )
}
