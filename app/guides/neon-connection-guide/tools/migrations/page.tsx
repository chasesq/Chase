import { GuideLayout } from '@/components/guides/guide-layout'
import { GuideNavigation } from '@/components/guides/guide-navigation'
import { CodeExampleBlock } from '@/components/guides/code-example-block'
import { Card } from '@/components/ui/card'

export const metadata = {
  title: 'Database Migrations | Neon Guides',
  description: 'Learn how to manage database schema changes with Prisma, Drizzle, Flyway, and other migration tools on Neon.',
}

export default function MigrationsPage() {
  return (
    <GuideLayout
      title="Database Migrations"
      description="Manage database schema changes safely with migration tools."
      breadcrumbs={[
        { label: 'Neon Connection Guide', href: '/guides/neon-connection-guide' },
        { label: 'Tools', href: '/guides/neon-connection-guide/tools/overview' },
        { label: 'Migrations' },
      ]}
      sidebar={<GuideNavigation />}
    >
      <div className="space-y-8">
        {/* Introduction */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">Database Migrations Overview</h2>
          <p className="text-muted-foreground mb-4">
            Migrations are version-controlled changes to your database schema. They ensure consistent schema evolution across development, staging, and production environments.
          </p>
          <p className="text-muted-foreground">
            Neon works seamlessly with popular migration tools. Choose based on your stack and workflow preferences.
          </p>
        </section>

        {/* Prisma Migrations */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">Prisma Migrations</h2>
          <p className="text-muted-foreground mb-4">
            Built-in migration system integrated with the Prisma ORM. Recommended for Next.js and TypeScript projects.
          </p>

          <CodeExampleBlock
            title="Setup Prisma with Neon"
            description="Initialize Prisma for your Neon database"
            code={`# Install Prisma
npm install @prisma/client
npm install -D prisma

# Initialize Prisma
npx prisma init

# In .env
DATABASE_URL="postgresql://user:password@ep-cool-rain.us-east-2.aws.neon.tech/neondb"`}
          />

          <h3 className="text-lg font-bold text-foreground mb-4 mt-6">Creating Migrations</h3>
          <CodeExampleBlock
            title="Create a Migration"
            description="Generate a migration from Prisma schema changes"
            code={`# Edit schema.prisma with your changes

# Create a named migration
npx prisma migrate dev --name add_users_table

# What this does:
# 1. Creates SQL migration file in prisma/migrations/
# 2. Runs the migration on your development database
# 3. Updates prisma/schema.prisma`}
          />

          <h3 className="text-lg font-bold text-foreground mb-4">Running Migrations in Production</h3>
          <CodeExampleBlock
            title="Production Deployment"
            description="Apply migrations to production database"
            code={`# Deploy migrations to production
# Typically done in your CI/CD pipeline
npx prisma migrate deploy

# This reads all migration files in prisma/migrations/
# and applies only unapplied migrations to the target database
# Requires DATABASE_URL to be set to production database`}
          />

          <Card className="p-4 border-amber-200 bg-amber-50 mt-4">
            <h4 className="font-semibold text-foreground mb-2">Best Practices</h4>
            <ul className="space-y-2 text-sm text-foreground">
              <li>• Always commit migration files to version control</li>
              <li>• Test migrations on a branch before deploying to production</li>
              <li>• Use meaningful names for migrations (e.g., <code className="bg-white px-1 rounded text-xs">add_email_to_users</code>)</li>
              <li>• Never manually edit migration SQL files after running them</li>
            </ul>
          </Card>
        </section>

        {/* Drizzle Migrations */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">Drizzle ORM Migrations</h2>
          <p className="text-muted-foreground mb-4">
            Lightweight TypeScript-first ORM with powerful migration capabilities. Great alternative to Prisma for more control.
          </p>

          <CodeExampleBlock
            title="Setup Drizzle with Neon"
            description="Initialize Drizzle for your Neon database"
            code={`# Install Drizzle
npm install drizzle-orm pg
npm install -D drizzle-kit

# Create drizzle.config.ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});`}
          />

          <h3 className="text-lg font-bold text-foreground mb-4">Creating and Running Migrations</h3>
          <CodeExampleBlock
            title="Generate and Apply Migrations"
            description="With Drizzle migrations"
            code={`# Generate migrations from schema changes
npx drizzle-kit generate:pg --name add_users_table

# Run migrations
npx drizzle-kit migrate

# This applies all pending migrations to your database`}
          />

          <h3 className="text-lg font-bold text-foreground mb-4">Drizzle Schema Example</h3>
          <CodeExampleBlock
            title="Define Schema"
            description="Drizzle schema file"
            code={`// src/db/schema.ts
import { pgTable, serial, varchar, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 256 }).notNull(),
  name: varchar('name', { length: 256 }),
  createdAt: timestamp('created_at').defaultNow(),
});`}
          />
        </section>

        {/* Flyway Migrations */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">Flyway Migrations</h2>
          <p className="text-muted-foreground mb-4">
            Language-agnostic version control for database changes. Excellent for polyglot teams and complex migration scenarios.
          </p>

          <CodeExampleBlock
            title="Setup Flyway"
            description="Configure Flyway for Neon"
            code={`# Install Flyway
# macOS
brew install flyway

# Linux/Windows - download from flyway.org

# Create flyway.conf
flyway.url=jdbc:postgresql://ep-cool-rain.us-east-2.aws.neon.tech/neondb
flyway.user=neondb_owner
flyway.password=your_password
flyway.locations=filesystem:./db/migrations`}
          />

          <h3 className="text-lg font-bold text-foreground mb-4">Migration File Naming</h3>
          <CodeExampleBlock
            title="Naming Convention"
            description="Flyway migration file naming"
            code={`# Versioned migrations (ordered by version number)
V1__Initial_schema.sql
V2__Add_users_table.sql
V3__Add_email_index.sql

# Undo migrations (to revert a version)
U2__Add_users_table.sql

# Repeatable migrations (run after any versioned migration)
R__Create_or_replace_views.sql`}
          />

          <h3 className="text-lg font-bold text-foreground mb-4">Running Migrations</h3>
          <CodeExampleBlock
            title="Execute Migrations"
            description="Apply migrations with Flyway"
            code={`# Run migrations
flyway migrate

# Check migration status
flyway info

# Undo last migration
flyway undo

# Validate migration integrity
flyway validate`}
          />
        </section>

        {/* Raw SQL Migrations */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">Raw SQL Migrations</h2>
          <p className="text-muted-foreground mb-4">
            For projects without an ORM or migration tool, you can manage migrations manually with SQL scripts.
          </p>

          <h3 className="text-lg font-bold text-foreground mb-4">Simple Script-Based Approach</h3>
          <CodeExampleBlock
            title="Manual Migration Structure"
            description="Directory structure for SQL migrations"
            code={`db/
├── migrations/
│   ├── 001_initial_schema.sql
│   ├── 002_add_users.sql
│   ├── 003_add_posts.sql
│   └── _migrations.sql  # Track which migrations ran

└── schema.sql  # Full schema backup`}
          />

          <h3 className="text-lg font-bold text-foreground mb-4">Tracking Migrations</h3>
          <CodeExampleBlock
            title="Migration Tracking Table"
            description="Track applied migrations"
            code={`-- Create migrations table
CREATE TABLE IF NOT EXISTS _schema_migrations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  executed_at TIMESTAMP DEFAULT NOW()
);

-- Check applied migrations
SELECT * FROM _schema_migrations ORDER BY id;

-- Mark migration as applied
INSERT INTO _schema_migrations (name) VALUES ('001_initial_schema');`}
          />

          <h3 className="text-lg font-bold text-foreground mb-4">Running SQL Migrations</h3>
          <CodeExampleBlock
            title="Execute SQL Files"
            description="Apply migrations using psql"
            code={`# Apply a specific migration
psql $DATABASE_URL -f db/migrations/001_initial_schema.sql

# Or use a bash script
#!/bin/bash
for file in db/migrations/*.sql; do
  echo "Running $file..."
  psql $DATABASE_URL -f "$file"
done

# Or in Node.js
const fs = require('fs');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const migration = fs.readFileSync('./migrations/001_initial_schema.sql', 'utf8');
pool.query(migration).then(() => console.log('Migration complete'));`}
          />
        </section>

        {/* Branching and Migrations */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">Migrations with Database Branches</h2>
          <p className="text-muted-foreground mb-4">
            Neon branches allow you to test migrations before applying to production.
          </p>

          <Card className="p-4 border-blue-200 bg-blue-50 mb-4">
            <h4 className="font-semibold text-foreground mb-2">Typical Workflow</h4>
            <ol className="space-y-2 text-sm text-foreground">
              <li>1. Create a branch from production</li>
              <li>2. Point your local development to the branch</li>
              <li>3. Run migrations on the branch</li>
              <li>4. Test application with new schema</li>
              <li>5. If successful, apply migrations to production</li>
              <li>6. Delete the branch</li>
            </ol>
          </Card>

          <CodeExampleBlock
            title="Testing Migrations on a Branch"
            description="Safe migration testing workflow"
            code={`# Create a branch for migration testing
neon branches create --name test-migration --parent main

# Get the branch connection string
export DATABASE_URL=$(neon connection string --branch test-migration)

# Run migrations on branch
npx prisma migrate deploy

# Test your application with the new schema
npm run dev

# If everything works, apply to production
export DATABASE_URL=$(neon connection string --branch main)
npx prisma migrate deploy

# Clean up the branch
neon branches delete --name test-migration`}
          />
        </section>

        {/* Best Practices */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">Migration Best Practices</h2>
          <div className="space-y-4">
            <Card className="p-4 border-blue-200 bg-blue-50">
              <h4 className="font-semibold text-foreground mb-2">1. Always Test First</h4>
              <p className="text-sm text-foreground">
                Test migrations on a development database or branch before applying to production.
              </p>
            </Card>

            <Card className="p-4 border-green-200 bg-green-50">
              <h4 className="font-semibold text-foreground mb-2">2. Write Idempotent Migrations</h4>
              <p className="text-sm text-foreground">
                Use <code className="bg-white px-1 rounded text-xs">IF NOT EXISTS</code> and <code className="bg-white px-1 rounded text-xs">IF EXISTS</code> to prevent errors on reruns.
              </p>
            </Card>

            <Card className="p-4 border-amber-200 bg-amber-50">
              <h4 className="font-semibold text-foreground mb-2">3. Backup Before Major Migrations</h4>
              <p className="text-sm text-foreground">
                Create a branch or backup before large schema changes affecting production data.
              </p>
            </Card>

            <Card className="p-4 border-purple-200 bg-purple-50">
              <h4 className="font-semibold text-foreground mb-2">4. Keep Migrations Small</h4>
              <p className="text-sm text-foreground">
                Multiple small migrations are safer than one large migration that's hard to debug.
              </p>
            </Card>

            <Card className="p-4 border-red-200 bg-red-50">
              <h4 className="font-semibold text-foreground mb-2">5. Never Skip Migrations</h4>
              <p className="text-sm text-foreground">
                Always apply migrations in order. Skipping migrations can cause schema inconsistency.
              </p>
            </Card>
          </div>
        </section>

        {/* Troubleshooting */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">Troubleshooting Migrations</h2>

          <Card className="p-4 border-amber-200 bg-amber-50 mb-4">
            <h4 className="font-semibold text-foreground mb-2">Migration Failed</h4>
            <p className="text-sm text-foreground mb-2">
              <strong>Check the error message:</strong> It often tells you exactly what went wrong (e.g., column already exists, syntax error).
            </p>
            <p className="text-sm text-foreground">
              <strong>Fix and retry:</strong> Fix the SQL, rerun the migration. Migrations are only marked as applied after success.
            </p>
          </Card>

          <Card className="p-4 border-amber-200 bg-amber-50 mb-4">
            <h4 className="font-semibold text-foreground mb-2">Schema Out of Sync</h4>
            <p className="text-sm text-foreground mb-2">
              <strong>Check migration status:</strong> Run <code className="bg-white px-1 rounded text-xs">flyway info</code> or check your migrations table.
            </p>
            <p className="text-sm text-foreground">
              <strong>Identify missing migrations:</strong> Compare your migrations directory with applied migrations.
            </p>
          </Card>

          <Card className="p-4 border-amber-200 bg-amber-50">
            <h4 className="font-semibold text-foreground mb-2">Locking Issues</h4>
            <p className="text-sm text-foreground mb-2">
              <strong>Long-running migrations</strong> may cause locks on tables. Test with realistic data volumes.
            </p>
            <p className="text-sm text-foreground">
              <strong>Connection drops:</strong> Ensure stable connection to Neon during migrations.
            </p>
          </Card>
        </section>
      </div>
    </GuideLayout>
  )
}
