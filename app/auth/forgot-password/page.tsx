import { ForgotPasswordForm } from '@/components/forgot-password-form'
import { AuthLayout } from '@/components/auth-layout'

export default function Page() {
  return (
    <AuthLayout
      title="Reset Your Password"
      subtitle="We&apos;ll help you get back into your account"
    >
      <ForgotPasswordForm />
    </AuthLayout>
  )
}
