import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function AdminCredentials() {
  const credentials = [
    { email: 'admin@chase.com', password: 'Admin@2024!', accountName: 'Chase Admin', role: 'Admin' },
    { email: 'manager@chase.com', password: 'Manager@2024!', accountName: 'Chase Manager', role: 'Manager' },
    { email: 'support@chase.com', password: 'Support@2024!', accountName: 'Chase Support', role: 'Support' },
  ]

  return (
    <Card className="w-full max-w-md mx-auto mt-8 border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="text-lg text-gray-900">Admin Test Credentials</CardTitle>
        <CardDescription>Use these credentials to test the application</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {credentials.map((cred) => (
          <div key={cred.email} className="p-4 bg-white rounded-lg border border-gray-200">
            <p className="text-sm font-semibold text-gray-900 mb-2">{cred.role}</p>
            <div className="space-y-1 text-xs text-gray-600">
              <p><span className="font-medium">Email:</span> {cred.email}</p>
              <p><span className="font-medium">Password:</span> {cred.password}</p>
              <p><span className="font-medium">Account Name:</span> {cred.accountName}</p>
            </div>
          </div>
        ))}
        <p className="text-xs text-gray-500 mt-4 p-3 bg-yellow-50 rounded border border-yellow-200">
          💡 Tip: Enter the account name when logging in to customize your session label.
        </p>
      </CardContent>
    </Card>
  )
}
