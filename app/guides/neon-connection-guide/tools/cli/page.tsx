import { GuideLayout } from '@/components/guides/guide-layout'
import { GuideNavigation } from '@/components/guides/guide-navigation'
import { CodeExampleBlock } from '@/components/guides/code-example-block'
import { Card } from '@/components/ui/card'
import { Terminal } from 'lucide-react'

export const metadata = {
  title: 'Neon CLI Guide | Neon Guides',
  description: 'Learn how to use the Neon CLI to manage databases, branches, and projects from the command line.',
}

export default function CLIPage() {
  return (
    <GuideLayout
      title="Neon CLI"
      description="Master the Neon CLI for command-line management of your databases and projects."
      breadcrumbs={[
        { label: 'Neon Connection Guide', href: '/guides/neon-connection-guide' },
        { label: 'Tools', href: '/guides/neon-connection-guide/tools/overview' },
        { label: 'CLI' },
      ]}
      sidebar={<GuideNavigation />}
    >
      <div className="space-y-8">
        {/* Introduction */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">Neon CLI Overview</h2>
          <p className="text-muted-foreground mb-4">
            The Neon CLI is a powerful command-line tool that lets you manage your Neon projects, databases, and branches without leaving your terminal. It&apos;s perfect for automation, CI/CD pipelines, and developers who prefer the command line.
          </p>
        </section>

        {/* Installation */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">Installation</h2>

          <CodeExampleBlock
            title="Install Neon CLI"
            description="Install using npm or your package manager"
            code={`# Using npm
npm install -g @neondatabase/cli

# Using Homebrew (macOS)
brew install neondatabase/tap/neon

# Using Scoop (Windows)
scoop install neon

# Verify installation
neon --version`}
          />

          <h3 className="text-lg font-bold text-foreground mb-4">Authentication</h3>
          <CodeExampleBlock
            title="Authenticate with Neon"
            description="Set up your API credentials"
            code={`# Login with your Neon account
neon auth

# This opens a browser to authenticate
# Your API key is stored in ~/.neondatabase/credentials.json

# Or set API key directly
export NEON_API_KEY="your-api-key-here"

# Get API key from Neon Console > Project Settings > API Keys`}
          />
        </section>

        {/* Core Commands */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">Core Commands</h2>

          {/* Projects */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-foreground mb-4">Project Management</h3>
            
            <CodeExampleBlock
              title="List Projects"
              description="View all your Neon projects"
              code={`# List all projects
neon projects list

# Example output:
# ID                         NAME              REGION
# proj_abc123def456          my-app            us-east-2
# proj_xyz789uvw123          my-staging        us-east-2`}
            />

            <CodeExampleBlock
              title="Project Details"
              description="Get information about a specific project"
              code={`# Get project details
neon projects get <project-id>

# Set default project (for shorter commands)
neon projects set-default <project-id>`}
            />
          </div>

          {/* Databases */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-foreground mb-4">Database Management</h3>
            
            <CodeExampleBlock
              title="List Databases"
              description="View databases in your project"
              code={`# List databases
neon databases list

# List for specific project
neon databases list --project-id proj_abc123`}
            />

            <CodeExampleBlock
              title="Create Database"
              description="Create a new database"
              code={`# Create a database
neon databases create --name my_database

# Create in specific project
neon databases create --name my_database --project-id proj_abc123`}
            />
          </div>

          {/* Branches */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-foreground mb-4">Branch Management</h3>
            <p className="text-muted-foreground mb-4">
              Branches are the most powerful feature of Neon CLI, letting you create isolated database copies for development and testing.
            </p>
            
            <CodeExampleBlock
              title="List Branches"
              description="View all branches in your database"
              code={`# List all branches
neon branches list

# List branches for specific database
neon branches list --database-name my_database

# Show detailed information
neon branches list --json`}
            />

            <CodeExampleBlock
              title="Create Branch"
              description="Create a new database branch"
              code={`# Create branch from main (default)
neon branches create --name feature-branch

# Create branch from specific parent
neon branches create --name staging-test --parent production

# Create with specific database
neon branches create --name my-branch --database-name my_database`}
            />

            <CodeExampleBlock
              title="Branch Details & Connection"
              description="Get connection string for a branch"
              code={`# Get branch details
neon branches get <branch-id>

# Get connection string
neon connection string <branch-name>

# Example output:
# postgresql://user:password@ep-cool-rain-123456.us-east-2.aws.neon.tech/dbname

# Get specific role connection
neon connection string <branch-name> --role-name my_role`}
            />

            <CodeExampleBlock
              title="Delete Branch"
              description="Remove a branch when done testing"
              code={`# Delete a branch
neon branches delete <branch-id>

# Delete by name
neon branches delete --name feature-branch

# Delete all branches except main
neon branches delete --all-except main`}
            />

            <CodeExampleBlock
              title="Reset Branch"
              description="Reset a branch to its parent state"
              code={`# Reset branch to parent's state
neon branches reset <branch-id>

# Resets all changes made in the branch
# Parent branch is unaffected`}
            />
          </div>

          {/* Users & Roles */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-foreground mb-4">User & Role Management</h3>
            
            <CodeExampleBlock
              title="List Roles"
              description="View database roles"
              code={`# List all roles
neon roles list

# List roles for specific branch
neon roles list --branch-id <branch-id>`}
            />

            <CodeExampleBlock
              title="Create Role"
              description="Create a new database role"
              code={`# Create a new role
neon roles create --name app_user

# Create role with password
neon roles create --name app_user --password`}
            />
          </div>
        </section>

        {/* Advanced Usage */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">Advanced Usage</h2>

          <h3 className="text-lg font-bold text-foreground mb-4">Running SQL with CLI</h3>
          <CodeExampleBlock
            title="Execute SQL Queries"
            description="Run SQL directly from the CLI"
            code={`# Get connection string and pipe to psql
psql $(neon connection string main) -c "SELECT version();"

# Or use neon query (if available)
neon sql --branch main "SELECT * FROM users LIMIT 10;"`}
          />

          <h3 className="text-lg font-bold text-foreground mb-4">Automating with Bash Scripts</h3>
          <CodeExampleBlock
            title="CI/CD Pipeline Example"
            description="Create branch and get connection string"
            code={`#!/bin/bash
set -e

# Get project ID from environment
PROJECT_ID="proj_abc123"

# Create a preview branch
BRANCH_ID=$(neon branches create \\
  --name "preview-$CI_COMMIT_SHA" \\
  --project-id "$PROJECT_ID" \\
  --json | jq -r '.id')

echo "Created branch: $BRANCH_ID"

# Get connection string
CONNECTION_STRING=$(neon connection string "$BRANCH_ID")
echo "CONNECTION_STRING=$CONNECTION_STRING" >> $GITHUB_ENV

# Run migrations
psql "$CONNECTION_STRING" -f migrations/001_schema.sql

# Cleanup on completion
# neon branches delete "$BRANCH_ID"`}
          />

          <h3 className="text-lg font-bold text-foreground mb-4">JSON Output for Scripting</h3>
          <CodeExampleBlock
            title="Parsing JSON Output"
            description="Use --json flag for machine-readable output"
            code={`# Get branch info as JSON
neon branches get --branch-id <id> --json | jq '.'

# Extract specific field
BRANCH_ID=$(neon branches list --json | jq -r '.[] | select(.name=="main") | .id')

# Create branch and extract ID
NEW_BRANCH=$(neon branches create --name test --json)
BRANCH_ID=$(echo "$NEW_BRANCH" | jq -r '.id')
CONNECTION=$(echo "$NEW_BRANCH" | jq -r '.connection_uris[0]')`}
          />
        </section>

        {/* Helpful Workflows */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">Common Workflows</h2>

          <Card className="p-6 mb-4">
            <h3 className="text-lg font-bold text-foreground mb-4">Workflow 1: Create a Feature Branch</h3>
            <CodeExampleBlock
              title="Feature Development"
              code={`#!/bin/bash
# Create a branch for a new feature
BRANCH_NAME="feature/user-auth"
neon branches create --name "$BRANCH_NAME"

# Get connection string
CONNECTION=$(neon connection string "$BRANCH_NAME")
export DATABASE_URL="$CONNECTION"

# Run migrations
npm run migrate

# Start development
npm run dev

# When done, delete the branch
neon branches delete --name "$BRANCH_NAME"`}
            />
          </Card>

          <Card className="p-6 mb-4">
            <h3 className="text-lg font-bold text-foreground mb-4">Workflow 2: Staging Environment Refresh</h3>
            <CodeExampleBlock
              title="Refresh Staging from Main"
              code={`#!/bin/bash
# Delete old staging branch
neon branches delete --name staging || true

# Create fresh staging from main
neon branches create --name staging --parent main

# Deploy staging environment
STAGING_DB=$(neon connection string staging)
export DATABASE_URL="$STAGING_DB"

# Run latest migrations
npm run migrate:prod

# Deploy to staging server
vercel deploy --prod --env DATABASE_URL="$STAGING_DB"`}
            />
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">Workflow 3: Test Database Changes Safely</h3>
            <CodeExampleBlock
              title="Schema Testing"
              code={`#!/bin/bash
# Create test branch
TEST_BRANCH="schema-test-$(date +%s)"
neon branches create --name "$TEST_BRANCH"

# Get connection
TEST_DB=$(neon connection string "$TEST_BRANCH")
export DATABASE_URL="$TEST_DB"

# Apply experimental migration
psql "$DATABASE_URL" -f experimental-migration.sql

# Run tests
npm test

# Check results - if tests fail, branch is auto-cleaned up
# If successful, keep for review
# neon branches delete --name "$TEST_BRANCH"`}
            />
          </Card>
        </section>

        {/* Environment Variables */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">Environment Variables</h2>
          <div className="space-y-3">
            <Card className="p-4">
              <code className="text-sm font-mono text-foreground">NEON_API_KEY</code>
              <p className="text-sm text-muted-foreground mt-1">
                API key for authentication. Required if not logged in via <code className="bg-muted px-1 rounded text-xs">neon auth</code>
              </p>
            </Card>

            <Card className="p-4">
              <code className="text-sm font-mono text-foreground">NEON_DEFAULT_PROJECT_ID</code>
              <p className="text-sm text-muted-foreground mt-1">
                Set a default project to avoid specifying <code className="bg-muted px-1 rounded text-xs">--project-id</code> every time.
              </p>
            </Card>

            <Card className="p-4">
              <code className="text-sm font-mono text-foreground">NEON_CLI_DEBUG</code>
              <p className="text-sm text-muted-foreground mt-1">
                Set to <code className="bg-muted px-1 rounded text-xs">1</code> to enable debug logging for troubleshooting.
              </p>
            </Card>
          </div>
        </section>

        {/* Best Practices */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">CLI Best Practices</h2>
          <div className="space-y-4">
            <Card className="p-4 border-blue-200 bg-blue-50">
              <h4 className="font-semibold text-foreground mb-2">1. Use Consistent Naming</h4>
              <p className="text-sm text-foreground">
                Use branch names that describe their purpose: <code className="bg-white px-1 rounded text-xs">feature/auth</code>, <code className="bg-white px-1 rounded text-xs">staging</code>, <code className="bg-white px-1 rounded text-xs">pr-123</code>
              </p>
            </Card>

            <Card className="p-4 border-green-200 bg-green-50">
              <h4 className="font-semibold text-foreground mb-2">2. Clean Up Branches</h4>
              <p className="text-sm text-foreground">
                Delete branches when done to keep your project organized and control costs.
              </p>
            </Card>

            <Card className="p-4 border-amber-200 bg-amber-50">
              <h4 className="font-semibold text-foreground mb-2">3. Use JSON Output in Scripts</h4>
              <p className="text-sm text-foreground">
                Use <code className="bg-white px-1 rounded text-xs">--json</code> when writing scripts that parse CLI output.
              </p>
            </Card>

            <Card className="p-4 border-purple-200 bg-purple-50">
              <h4 className="font-semibold text-foreground mb-2">4. Store API Keys Securely</h4>
              <p className="text-sm text-foreground">
                Never commit API keys. Use environment variables or secret management tools in CI/CD.
              </p>
            </Card>
          </div>
        </section>

        {/* Troubleshooting */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">Troubleshooting</h2>

          <Card className="p-4 border-amber-200 bg-amber-50 mb-4">
            <h4 className="font-semibold text-foreground mb-2">Authentication Errors</h4>
            <p className="text-sm text-foreground">
              <strong>Error:</strong> <code className="bg-white px-1 rounded text-xs">Unauthorized</code>
            </p>
            <p className="text-sm text-foreground mt-2">
              <strong>Solution:</strong> Run <code className="bg-white px-1 rounded text-xs">neon auth</code> to re-authenticate or set <code className="bg-white px-1 rounded text-xs">NEON_API_KEY</code>
            </p>
          </Card>

          <Card className="p-4 border-amber-200 bg-amber-50 mb-4">
            <h4 className="font-semibold text-foreground mb-2">Command Not Found</h4>
            <p className="text-sm text-foreground">
              <strong>Solution:</strong> Ensure Neon CLI is installed: <code className="bg-white px-1 rounded text-xs">npm install -g @neondatabase/cli</code>
            </p>
          </Card>

          <Card className="p-4 border-amber-200 bg-amber-50">
            <h4 className="font-semibold text-foreground mb-2">Enable Debug Logging</h4>
            <p className="text-sm text-foreground">
              <strong>For detailed output:</strong> Set <code className="bg-white px-1 rounded text-xs">NEON_CLI_DEBUG=1</code> and rerun the command.
            </p>
          </Card>
        </section>
      </div>
    </GuideLayout>
  )
}
