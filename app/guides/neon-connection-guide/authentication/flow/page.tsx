import { GuideLayout } from '@/components/guides/guide-layout'
import { GuideNavigation } from '@/components/guides/guide-navigation'
import { CodeExampleBlock } from '@/components/guides/code-example-block'
import { Card } from '@/components/ui/card'
import { ArrowRight } from 'lucide-react'

export const metadata = {
  title: 'Authentication Flow | Neon Guides',
  description: 'Complete walkthrough of sign-up, sign-in, and session management processes.',
}

export default function AuthFlowPage() {
  return (
    <GuideLayout
      title="Authentication Flow"
      description="Complete walkthrough of sign-up, sign-in, and session management processes."
      breadcrumbs={[
        { label: 'Neon Connection Guide', href: '/guides/neon-connection-guide' },
        { label: 'Authentication', href: '/guides/neon-connection-guide/authentication/overview' },
        { label: 'Authentication Flow' },
      ]}
      sidebar={<GuideNavigation />}
    >
      <div className="space-y-8">
        {/* Overview */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">Authentication Flow Overview</h2>
          <p className="text-muted-foreground mb-4">
            Neon Auth handles multiple authentication flows. Below are the most common scenarios and how they work.
          </p>
        </section>

        {/* Sign Up Flow */}
        <section>
          <h3 className="text-xl font-bold text-foreground mb-4">Sign-Up Flow</h3>
          <p className="text-muted-foreground mb-6">
            The sign-up process creates a new user account and initiates a session.
          </p>

          <div className="bg-muted p-6 rounded-lg mb-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">User Submits Signup Form</h4>
                  <p className="text-sm text-muted-foreground">Email, password, and profile information</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-primary ml-4" />
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">Server Validates Input</h4>
                  <p className="text-sm text-muted-foreground">Checks for strong passwords, valid email, duplicate accounts</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-primary ml-4" />
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">Password is Hashed and Stored</h4>
                  <p className="text-sm text-muted-foreground">bcrypt or similar algorithm used for secure storage</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-primary ml-4" />
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">4</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">User Record Created</h4>
                  <p className="text-sm text-muted-foreground">New user account added to the database</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-primary ml-4" />
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">5</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">Session Created</h4>
                  <p className="text-sm text-muted-foreground">Access and refresh tokens generated</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-primary ml-4" />
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">6</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">Confirmation Email Sent (Optional)</h4>
                  <p className="text-sm text-muted-foreground">Email verification link or confirmation code</p>
                </div>
              </div>
            </div>
          </div>

          <CodeExampleBlock
            title="Sign-Up Implementation"
            description="Example of handling user sign-up"
            code={`import { createAuthClient } from "better-auth/client";

const authClient = createAuthClient();

async function handleSignUp(email, password, name) {
  try {
    const response = await authClient.signUp.email({
      email,
      password,
      name,
      redirect: false,
    });

    if (response.error) {
      console.error("Sign-up failed:", response.error.message);
      // Show error to user
      return;
    }

    // Success - user is now authenticated
    console.log("User created:", response.user);
    // Redirect to dashboard or home page
  } catch (error) {
    console.error("Sign-up error:", error);
  }
}`}
          />
        </section>

        {/* Sign In Flow */}
        <section>
          <h3 className="text-xl font-bold text-foreground mb-4">Sign-In Flow</h3>
          <p className="text-muted-foreground mb-6">
            The sign-in process authenticates an existing user.
          </p>

          <div className="bg-muted p-6 rounded-lg mb-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">User Submits Credentials</h4>
                  <p className="text-sm text-muted-foreground">Email and password</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-primary ml-4" />
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">Email Lookup</h4>
                  <p className="text-sm text-muted-foreground">Check if email exists in database</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-primary ml-4" />
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">Password Verification</h4>
                  <p className="text-sm text-muted-foreground">Compare hashed password with stored hash</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-primary ml-4" />
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">4</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">MFA Check (if enabled)</h4>
                  <p className="text-sm text-muted-foreground">Verify TOTP, SMS, or other second factor</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-primary ml-4" />
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">5</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">Session Created</h4>
                  <p className="text-sm text-muted-foreground">Access and refresh tokens generated</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-primary ml-4" />
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">6</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">Session Stored</h4>
                  <p className="text-sm text-muted-foreground">Tokens stored in HTTP-only cookies or client storage</p>
                </div>
              </div>
            </div>
          </div>

          <CodeExampleBlock
            title="Sign-In Implementation"
            description="Example of handling user sign-in"
            code={`async function handleSignIn(email, password) {
  try {
    const response = await authClient.signIn.email({
      email,
      password,
    });

    if (response.error) {
      // Credentials invalid
      console.error("Sign-in failed:", response.error.message);
      return;
    }

    // Authenticated successfully
    const user = response.user;
    const session = response.session;
    
    // Token is automatically stored
    // User can now make authenticated requests
  } catch (error) {
    console.error("Sign-in error:", error);
  }
}`}
          />
        </section>

        {/* Multi-Factor Authentication */}
        <section>
          <h3 className="text-xl font-bold text-foreground mb-4">Multi-Factor Authentication (MFA)</h3>
          <p className="text-muted-foreground mb-6">
            When MFA is enabled, an additional verification step is required after password verification.
          </p>

          <h4 className="font-semibold text-foreground mb-3">MFA Setup Process</h4>
          <CodeExampleBlock
            title="Enable MFA"
            description="User enables TOTP-based MFA"
            code={`// User initiates MFA setup
const response = await authClient.mfa.totp.enable();

// response.totpURI can be displayed as QR code
// User scans with authenticator app (Google Authenticator, Authy, etc.)

// User verifies by entering code from authenticator
const verifyResponse = await authClient.mfa.totp.verify({
  code: "123456", // 6-digit code from authenticator
});

console.log("MFA enabled:", verifyResponse.success);`}
          />

          <h4 className="font-semibold text-foreground mb-3 mt-6">MFA Sign-In</h4>
          <CodeExampleBlock
            title="MFA Sign-In Flow"
            description="Complete sign-in with MFA enabled"
            code={`// Step 1: Initial sign-in with email/password
const signInResponse = await authClient.signIn.email({
  email: "user@example.com",
  password: "password123",
});

// Step 2: If MFA required, ask for code
if (signInResponse.requiresMFA) {
  const mfaResponse = await authClient.mfa.verifyTOTP({
    code: "123456", // 6-digit code from authenticator
  });
  
  // Session is now complete
}

// User is fully authenticated
`}
          />
        </section>

        {/* Session Management */}
        <section>
          <h3 className="text-xl font-bold text-foreground mb-4">Session Management</h3>
          <p className="text-muted-foreground mb-6">
            Sessions are maintained using access and refresh tokens.
          </p>

          <div className="space-y-4 mb-6">
            <Card className="p-4">
              <h4 className="font-semibold text-foreground mb-2">Access Token Lifecycle</h4>
              <p className="text-sm text-muted-foreground">
                Access tokens are short-lived (15-60 minutes). They&apos;re sent with each API request to prove the user&apos;s identity.
              </p>
            </Card>
            <Card className="p-4">
              <h4 className="font-semibold text-foreground mb-2">Refresh Token Lifecycle</h4>
              <p className="text-sm text-muted-foreground">
                Refresh tokens are long-lived (7-30 days). When an access token expires, the refresh token is used to obtain a new access token without requiring the user to sign in again.
              </p>
            </Card>
          </div>

          <CodeExampleBlock
            title="Token Refresh"
            description="Automatic token refresh handling"
            code={`// The auth client automatically handles token refresh
// When access token expires, it uses the refresh token

// Make an API request
const response = await fetch('/api/user/profile', {
  headers: {
    'Authorization': \`Bearer \${accessToken}\`,
  },
});

// If access token expired, client automatically:
// 1. Uses refresh token to get new access token
// 2. Retries the original request
// 3. Returns fresh data to the application

// You can also manually refresh:
const session = await authClient.getSession();
// Returns current valid session with fresh tokens`}
          />
        </section>

        {/* Logout Flow */}
        <section>
          <h3 className="text-xl font-bold text-foreground mb-4">Sign-Out Flow</h3>
          <p className="text-muted-foreground mb-6">
            Signing out invalidates the user&apos;s session and tokens.
          </p>

          <CodeExampleBlock
            title="Sign-Out Implementation"
            description="Logging out the user"
            code={`async function handleSignOut() {
  try {
    // Sign out removes the session
    await authClient.signOut();
    
    // Tokens are cleared
    // User is logged out
    // Redirect to login page
    window.location.href = '/login';
  } catch (error) {
    console.error("Sign-out error:", error);
  }
}`}
          />
        </section>

        {/* Session Verification */}
        <section>
          <h3 className="text-xl font-bold text-foreground mb-4">Session Verification on Backend</h3>
          <p className="text-muted-foreground mb-6">
            Always verify the session token on your backend before processing requests.
          </p>

          <CodeExampleBlock
            title="Backend Session Verification"
            description="Verify JWT token in API routes"
            code={`import { auth } from '@/auth';

export async function GET(request) {
  // Get token from request
  const token = request.headers.get('Authorization')?.split(' ')[1];
  
  if (!token) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
    });
  }

  // Verify token with Neon Auth
  const session = await auth.api.verifyToken({ token });
  
  if (!session) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), {
      status: 401,
    });
  }

  // Token is valid, process request
  const user = session.user;
  // ... handle request with authenticated user
}`}
          />
        </section>
      </div>
    </GuideLayout>
  )
}
