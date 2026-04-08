import { PasswordlessForm } from '@/components/passwordless-form'

export default function PasswordlessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4">
      <div className="w-full max-w-md">
        <PasswordlessForm />
      </div>
    </div>
  )
}
