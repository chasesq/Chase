import { LoginForm } from '@/components/login-form'
import { AuthLayout } from '@/components/auth-layout'

export default function Page() {
  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Access your Chase banking account securely"
    >
      <LoginForm />
    </AuthLayout>
  )
}
