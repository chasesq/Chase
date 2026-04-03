import { LoginPage } from '@/components/login-page'
import { AdminCredentials } from '@/components/admin-credentials'

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <LoginPage />
        <AdminCredentials />
      </div>
    </div>
  )
}
