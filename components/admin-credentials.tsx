import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Copy, Check } from 'lucide-react'
import { useState } from 'react'

export function AdminCredentials() {
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null)
  
  const credentials = [
    { 
      email: 'admin@chasebank.com', 
      password: 'ChaseAdmin2024', 
      accountName: 'Chase Bank Admin', 
      role: 'Super Admin',
      description: 'Full system access'
    },
    { 
      email: 'manager@chase.com', 
      password: 'Manager@2024!', 
      accountName: 'Chase Manager', 
      role: 'Manager',
      description: 'User & account management'
    },
    { 
      email: 'support@chase.com', 
      password: 'Support@2024!', 
      accountName: 'Chase Support', 
      role: 'Support Agent',
      description: 'Support & customer help'
    },
  ]

  const copyToClipboard = (text: string, email: string) => {
    navigator.clipboard.writeText(text)
    setCopiedEmail(email)
    setTimeout(() => setCopiedEmail(null), 2000)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto mt-8 border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="text-xl text-foreground flex items-center gap-2">
          <span className="text-2xl">🔐</span>
          Admin Test Credentials
        </CardTitle>
        <CardDescription>Use these credentials to test admin features in the application</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {credentials.map((cred) => (
          <div key={cred.email} className="p-4 bg-card rounded-lg border border-border hover:border-primary/40 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm font-bold text-foreground">{cred.role}</p>
                <p className="text-xs text-muted-foreground">{cred.description}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-muted rounded">
                <div className="text-xs">
                  <p className="text-muted-foreground">Email:</p>
                  <p className="font-mono text-foreground">{cred.email}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(cred.email, cred.email)}
                  className="p-1.5 hover:bg-background rounded transition-colors"
                  title="Copy email"
                >
                  {copiedEmail === cred.email ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted rounded">
                <div className="text-xs">
                  <p className="text-muted-foreground">Password:</p>
                  <p className="font-mono text-foreground">{cred.password}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(cred.password, `${cred.email}-pwd`)}
                  className="p-1.5 hover:bg-background rounded transition-colors"
                  title="Copy password"
                >
                  {copiedEmail === `${cred.email}-pwd` ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 rounded border border-amber-200 dark:border-amber-900/50">
          <p className="text-xs text-amber-900 dark:text-amber-100">
            <span className="font-semibold">⚠️ Security Notice:</span> These are test credentials for development only. Never use in production.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
