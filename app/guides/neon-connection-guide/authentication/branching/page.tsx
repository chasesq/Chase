import { GuideLayout } from '@/components/guides/guide-layout'
import { GuideNavigation } from '@/components/guides/guide-navigation'
import { CodeExampleBlock } from '@/components/guides/code-example-block'
import { Card } from '@/components/ui/card'
import { GitBranch, Database, Shield } from 'lucide-react'

export const metadata = {
  title: 'Branching & Authentication | Neon Guides',
  description: 'How to use database branches with authentication systems.',
}

export default function BranchingAuthPage() {
  return (
    <GuideLayout
      title="Database Branching & Authentication"
      description="How to use database branches with authentication systems and manage multi-environment authentication."
      breadcrumbs={[
        { label: 'Neon Connection Guide', href: '/guides/neon-connection-guide' },
        { label: 'Authentication', href: '/guides/neon-connection-guide/authentication/overview' },
        { label: 'Branching & Authentication' },
      ]}
      sidebar={<GuideNavigation />}
    >
      <div className="space-y-8">
        {/* Introduction */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">Branching & Authentication</h2>
          <p className="text-muted-foreground mb-4">
            Neon allows you to create database branches for development, staging, and testing. Using branches with authentication requires careful management of secrets and configuration across environments.
          </p>
        </section>

        {/* What are Database Branches */}
        <section>
          <h3 className="text-xl font-bold text-foreground mb-4">What are Database Branches?</h3>
          <p className="text-muted-foreground mb-4">
            Database branches let you create isolated copies of your database for testing and development without affecting production data.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="p-4 border-blue-200 bg-blue-50">
              <div className="flex items-start gap-3">
                <GitBranch className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Development</h4>
                  <p className="text-sm text-muted-foreground">
                    Branch for local development with test data
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4 border-green-200 bg-green-50">
              <div className="flex items-start gap-3">
                <Database className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Staging</h4>
                  <p className="text-sm text-muted-foreground">
                    Pre-production environment for testing
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4 border-purple-200 bg-purple-50">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Production</h4>
                  <p className="text-sm text-muted-foreground">
                    Live environment with real user data
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Environment Setup */}
        <section>
          <h3 className="text-xl font-bold text-foreground mb-4">Setting Up Branches</h3>
          <p className="text-muted-foreground mb-4">
            Each branch gets its own database and connection string.
          </p>

          <CodeExampleBlock
            title="Connection Strings by Environment"
            description="Different connection strings for each branch"
            code={`# .env.local (Development)
DATABASE_URL="postgresql://user:pass@dev-branch.neon.tech/mydb"
NEON_AUTH_URL="http://localhost:3000"

# .env.staging (Staging)
DATABASE_URL="postgresql://user:pass@staging-branch.neon.tech/mydb"
NEON_AUTH_URL="https://staging.example.com"

# .env.production (Production)
DATABASE_URL="postgresql://user:pass@main-branch.neon.tech/mydb"
NEON_AUTH_URL="https://example.com"`}
          />
        </section>

        {/* Auth Configuration */}
        <section>
          <h3 className="text-xl font-bold text-foreground mb-4">Authentication Configuration per Branch</h3>
          <p className="text-muted-foreground mb-4">
            Each environment needs its own authentication configuration for OAuth providers and redirect URLs.
          </p>

          <h4 className="font-semibold text-foreground mb-3">Environment-Specific OAuth Setup</h4>
          <CodeExampleBlock
            title="Multi-Environment Auth Setup"
            description="Configure Neon Auth for each environment"
            code={`import { betterAuth } from "better-auth";
import { neonAdapter } from "better-auth/adapters/neon";

const isProduction = process.env.NODE_ENV === 'production';

export const auth = betterAuth({
  database: neonAdapter(process.env.DATABASE_URL),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.NEON_AUTH_URL,
  
  // Different OAuth credentials per environment
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      // Note: GitHub OAuth requires different IDs per environment
      // Create separate GitHub apps for dev/staging/prod
    },
  },
  
  // Email configuration
  emailVerification: {
    sendVerificationEmail: async (email, url) => {
      // Use environment-specific email service
      if (isProduction) {
        return await sendProductionEmail(email, url);
      } else {
        return await sendDevEmail(email, url);
      }
    },
  },
});`}
          />

          <Card className="p-4 border-amber-200 bg-amber-50 mt-4">
            <p className="text-sm text-foreground">
              <strong>Important:</strong> OAuth providers require different app credentials for each environment (dev, staging, prod). Create separate OAuth applications on your provider&apos;s dashboard with environment-specific redirect URLs.
            </p>
          </Card>
        </section>

        {/* Branch Promotion */}
        <section>
          <h3 className="text-xl font-bold text-foreground mb-4">Promoting Changes Between Branches</h3>
          <p className="text-muted-foreground mb-4">
            When changes are tested on a branch and ready for production, they need to be promoted.
          </p>

          <div className="bg-muted p-6 rounded-lg mb-6">
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center">1</div>
                <p className="text-muted-foreground">
                  <strong>Development:</strong> Test new auth features, user schema changes, etc.
                </p>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center">2</div>
                <p className="text-muted-foreground">
                  <strong>Staging:</strong> Run end-to-end tests with realistic data and load
                </p>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center">3</div>
                <p className="text-muted-foreground">
                  <strong>Production:</strong> Deploy to main branch after approval and testing
                </p>
              </div>
            </div>
          </div>

          <h4 className="font-semibold text-foreground mb-3">Schema Promotion with Auth Tables</h4>
          <CodeExampleBlock
            title="Promoting Authentication Schema"
            description="Script to copy auth schema to production"
            code={`-- Use Neon's branch operations to promote schema
-- Option 1: Create branch from development
-- This copies the entire schema including auth tables

-- Option 2: Manual schema migration script
-- For controlled, incremental changes

-- Example: Adding a new user field
ALTER TABLE "user"
ADD COLUMN "phone_number" VARCHAR(20);

-- Run this migration on development first
-- Test with your auth system
-- Once verified, apply to staging
-- Finally, apply to production

-- Remember: ALWAYS backup production before schema changes!`}
          />
        </section>

        {/* Data Considerations */}
        <section>
          <h3 className="text-xl font-bold text-foreground mb-4">Data Handling Across Branches</h3>
          <p className="text-muted-foreground mb-4">
            Different strategies for managing user data across branches.
          </p>

          <div className="space-y-4">
            <Card className="p-4 border-blue-200 bg-blue-50">
              <h4 className="font-semibold text-foreground mb-2">Development Branch</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Use test accounts and synthetic data. Create test users with known credentials for testing the auth flow.
              </p>
              <CodeExampleBlock
                title="Creating Test Users"
                code={`-- SQL to create test users in development
INSERT INTO "user" (id, email, name, created_at)
VALUES 
  ('test-1', 'test@example.com', 'Test User', now()),
  ('test-2', 'admin@example.com', 'Admin User', now());

-- Create corresponding auth records
INSERT INTO "account" (user_id, type, provider, provider_account_id)
VALUES ('test-1', 'email', 'email', 'test@example.com');`}
              />
            </Card>

            <Card className="p-4 border-green-200 bg-green-50">
              <h4 className="font-semibold text-foreground mb-2">Staging Branch</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Optionally use anonymized production data or realistic test data for accurate load testing.
              </p>
            </Card>

            <Card className="p-4 border-purple-200 bg-purple-50">
              <h4 className="font-semibold text-foreground mb-2">Production Branch</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Contains real user authentication data. Never test in production. Always use a separate branch.
              </p>
            </Card>
          </div>
        </section>

        {/* Branch Refresh */}
        <section>
          <h3 className="text-xl font-bold text-foreground mb-4">Refreshing Branches with Production Data</h3>
          <p className="text-muted-foreground mb-4">
            Periodically refresh staging with production data to test against realistic datasets.
          </p>

          <Card className="p-4 border-amber-200 bg-amber-50 mb-4">
            <p className="text-sm text-foreground">
              <strong>Warning:</strong> When refreshing staging with production data, ensure user passwords and sensitive auth tokens are reset or removed. Never expose user passwords in non-production environments.
            </p>
          </Card>

          <CodeExampleBlock
            title="Safe Data Refresh"
            description="Refresh staging data while protecting auth credentials"
            code={`-- After refreshing staging with production data:

-- Reset all passwords (users will need to use password reset)
UPDATE "user" 
SET password = NULL 
WHERE password IS NOT NULL;

-- Clear session/auth tokens
DELETE FROM "session";
DELETE FROM "verificationToken";

-- Reset MFA for testing
UPDATE "user" 
SET two_factor_enabled = false 
WHERE two_factor_enabled = true;

-- Create known test accounts
INSERT INTO "user" (email, name, created_at)
VALUES ('staging-test@example.com', 'Staging Test User', now())
ON CONFLICT DO NOTHING;`}
          />
        </section>

        {/* Best Practices */}
        <section>
          <h3 className="text-xl font-bold text-foreground mb-4">Best Practices for Branches & Auth</h3>
          <div className="space-y-4">
            <Card className="p-4 border-blue-200 bg-blue-50">
              <h4 className="font-semibold text-foreground mb-2">Separate OAuth Applications</h4>
              <p className="text-sm text-muted-foreground">
                Create separate OAuth apps for development, staging, and production with appropriate redirect URLs.
              </p>
            </Card>
            <Card className="p-4 border-green-200 bg-green-50">
              <h4 className="font-semibold text-foreground mb-2">Environment Variables</h4>
              <p className="text-sm text-muted-foreground">
                Use environment-specific variables for database URLs, API keys, and auth configuration.
              </p>
            </Card>
            <Card className="p-4 border-amber-200 bg-amber-50">
              <h4 className="font-semibold text-foreground mb-2">Never Copy Secrets</h4>
              <p className="text-sm text-muted-foreground">
                Keep production secrets separate. Never commit or copy production tokens to development branches.
              </p>
            </Card>
            <Card className="p-4 border-purple-200 bg-purple-50">
              <h4 className="font-semibold text-foreground mb-2">Document Auth Setup</h4>
              <p className="text-sm text-muted-foreground">
                Document which OAuth apps and credentials should be used for each environment to prevent confusion.
              </p>
            </Card>
          </div>
        </section>
      </div>
    </GuideLayout>
  )
}
