import { GuideLayout } from '@/components/guides/guide-layout'
import { GuideNavigation } from '@/components/guides/guide-navigation'
import { CodeExampleBlock } from '@/components/guides/code-example-block'
import { Card } from '@/components/ui/card'
import { Shield, Lock, CheckCircle2, Users } from 'lucide-react'

export const metadata = {
  title: 'Neon Auth Overview | Neon Guides',
  description: 'Learn about Neon managed authentication and how to integrate it with your applications.',
}

export default function AuthOverviewPage() {
  return (
    <GuideLayout
      title="Authentication Overview"
      description="Understand Neon Auth and how to integrate managed authentication into your applications."
      breadcrumbs={[
        { label: 'Neon Connection Guide', href: '/guides/neon-connection-guide' },
        { label: 'Authentication', href: '/guides/neon-connection-guide/authentication/overview' },
        { label: 'Overview' },
      ]}
      sidebar={<GuideNavigation />}
    >
      <div className="space-y-8">
        {/* What is Neon Auth */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">What is Neon Auth?</h2>
          <p className="text-muted-foreground mb-4">
            Neon Auth is a managed authentication service built on Better Auth. It provides a complete authentication solution for your applications with support for:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Multiple Auth Methods</h4>
                  <p className="text-sm text-muted-foreground">
                    Email/password, social login, passwordless, and multi-factor authentication.
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Secure Sessions</h4>
                  <p className="text-sm text-muted-foreground">
                    Built-in session management and secure token handling.
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Security Best Practices</h4>
                  <p className="text-sm text-muted-foreground">
                    Password hashing, rate limiting, and protection against common attacks.
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Easy Integration</h4>
                  <p className="text-sm text-muted-foreground">
                    Simple APIs for sign-up, sign-in, and user management.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Key Features */}
        <section>
          <h3 className="text-xl font-bold text-foreground mb-4">Key Features</h3>
          <div className="space-y-4">
            <div className="p-4 border border-border rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">Email & Password</h4>
              <p className="text-sm text-muted-foreground">
                Traditional email/password authentication with secure password hashing and validation.
              </p>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">Social Login</h4>
              <p className="text-sm text-muted-foreground">
                Integrate with popular OAuth providers like Google, GitHub, and Discord.
              </p>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">Passwordless Authentication</h4>
              <p className="text-sm text-muted-foreground">
                Email links and magic links for users who prefer not to manage passwords.
              </p>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">Multi-Factor Authentication (MFA)</h4>
              <p className="text-sm text-muted-foreground">
                TOTP, SMS, and backup codes for enhanced security.
              </p>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">User Management</h4>
              <p className="text-sm text-muted-foreground">
                Update profiles, manage accounts, and handle password resets.
              </p>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">Session Management</h4>
              <p className="text-sm text-muted-foreground">
                Automatic session creation, validation, and token refresh.
              </p>
            </div>
          </div>
        </section>

        {/* Architecture */}
        <section>
          <h3 className="text-xl font-bold text-foreground mb-4">Authentication Architecture</h3>
          <p className="text-muted-foreground mb-4">
            Neon Auth is built on Better Auth, a modern authentication framework. Here&apos;s how it works:
          </p>
          
          <div className="bg-muted p-6 rounded-lg mb-6">
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center">1</div>
                <p className="text-muted-foreground">User submits credentials (email, password, OAuth, etc.)</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center">2</div>
                <p className="text-muted-foreground">Neon Auth validates credentials securely</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center">3</div>
                <p className="text-muted-foreground">Session and JWT tokens are generated</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center">4</div>
                <p className="text-muted-foreground">Tokens are returned to the client</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center">5</div>
                <p className="text-muted-foreground">Client uses tokens for subsequent requests</p>
              </div>
            </div>
          </div>
        </section>

        {/* Token Types */}
        <section>
          <h3 className="text-xl font-bold text-foreground mb-4">Token Types</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card className="p-4 border-blue-200 bg-blue-50">
              <h4 className="font-semibold text-foreground mb-2">Access Token (JWT)</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Short-lived token (typically 15-60 minutes) used to authenticate API requests.
              </p>
              <div className="text-xs font-mono text-muted-foreground bg-white p-2 rounded">
                eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
              </div>
            </Card>

            <Card className="p-4 border-green-200 bg-green-50">
              <h4 className="font-semibold text-foreground mb-2">Refresh Token</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Long-lived token (typically 7-30 days) used to obtain new access tokens.
              </p>
              <div className="text-xs font-mono text-muted-foreground bg-white p-2 rounded">
                eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
              </div>
            </Card>
          </div>
        </section>

        {/* Integration Steps */}
        <section>
          <h3 className="text-xl font-bold text-foreground mb-4">Getting Started with Neon Auth</h3>
          <ol className="space-y-4 list-decimal list-inside">
            <li className="text-muted-foreground">
              <strong>Enable Neon Auth</strong> in your Neon project settings
            </li>
            <li className="text-muted-foreground">
              <strong>Configure providers</strong> (email, OAuth, passwordless, etc.)
            </li>
            <li className="text-muted-foreground">
              <strong>Set up callbacks</strong> for redirect URLs and email templates
            </li>
            <li className="text-muted-foreground">
              <strong>Integrate SDK</strong> in your application (frontend and backend)
            </li>
            <li className="text-muted-foreground">
              <strong>Test authentication</strong> flow end-to-end
            </li>
          </ol>
        </section>

        {/* Basic Setup */}
        <section>
          <h3 className="text-xl font-bold text-foreground mb-4">Basic Setup Example</h3>
          <p className="text-muted-foreground mb-4">
            Here&apos;s a minimal example of setting up Neon Auth:
          </p>

          <CodeExampleBlock
            title="Backend Setup"
            description="Initialize Neon Auth on your backend"
            code={`import { betterAuth } from "better-auth";
import { neonAdapter } from "better-auth/adapters/neon";

export const auth = betterAuth({
  database: neonAdapter(process.env.DATABASE_URL),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    },
  },
});`}
          />

          <CodeExampleBlock
            title="Frontend Integration"
            description="Use auth client in your application"
            code={`import { createAuthClient } from "better-auth/client";

const client = createAuthClient({
  baseURL: "http://localhost:3000",
});

// Sign up
await client.signUp.email({
  email: "user@example.com",
  password: "secure-password",
  name: "John Doe",
});

// Sign in
const session = await client.signIn.email({
  email: "user@example.com",
  password: "secure-password",
});

// Sign out
await client.signOut();`}
          />
        </section>

        {/* Best Practices */}
        <section>
          <h3 className="text-xl font-bold text-foreground mb-4">Best Practices</h3>
          <div className="space-y-4">
            <Card className="p-4 border-blue-200 bg-blue-50">
              <h4 className="font-semibold text-foreground mb-2">Store Tokens Securely</h4>
              <p className="text-sm text-muted-foreground">
                Use HTTP-only cookies or secure storage mechanisms. Never store sensitive tokens in localStorage.
              </p>
            </Card>
            <Card className="p-4 border-green-200 bg-green-50">
              <h4 className="font-semibold text-foreground mb-2">Use HTTPS</h4>
              <p className="text-sm text-muted-foreground">
                Always use HTTPS in production to prevent token interception.
              </p>
            </Card>
            <Card className="p-4 border-amber-200 bg-amber-50">
              <h4 className="font-semibold text-foreground mb-2">Validate Tokens</h4>
              <p className="text-sm text-muted-foreground">
                Always validate tokens on the backend before processing requests.
              </p>
            </Card>
            <Card className="p-4 border-purple-200 bg-purple-50">
              <h4 className="font-semibold text-foreground mb-2">Enable MFA</h4>
              <p className="text-sm text-muted-foreground">
                Encourage users to enable multi-factor authentication for enhanced security.
              </p>
            </Card>
          </div>
        </section>
      </div>
    </GuideLayout>
  )
}
