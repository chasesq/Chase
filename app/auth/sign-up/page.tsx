import { SignUpForm } from '@/components/sign-up-form'
import { AuthLayout } from '@/components/auth-layout'

export default function Page() {
  return (
    <AuthLayout
      title="Create Your Account"
      subtitle="Join Chase Banking and start managing your finances better"
    >
      <SignUpForm />
    </AuthLayout>
  )
}
