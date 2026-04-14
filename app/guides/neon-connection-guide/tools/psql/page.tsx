import { GuideLayout } from '@/components/guides/guide-layout'
import { GuideNavigation } from '@/components/guides/guide-navigation'
import { CodeExampleBlock } from '@/components/guides/code-example-block'
import { Card } from '@/components/ui/card'
import { Terminal, Database, Settings } from 'lucide-react'

export const metadata = {
  title: 'psql Guide | Neon Guides',
  description: 'Learn how to use the PostgreSQL command-line tool to connect to Neon.',
}

export default function PsqlPage() {
  return (
    <GuideLayout
      title="PostgreSQL Command-Line Tool (psql)"
      description="Learn how to use the PostgreSQL command-line tool to connect to Neon and manage your database."
      breadcrumbs={[
        { label: 'Neon Connection Guide', href: '/guides/neon-connection-guide' },
        { label: 'Tools', href: '/guides/neon-connection-guide/tools/pooling' },
        { label: 'psql' },
      ]}
      sidebar={<GuideNavigation />}
    >
      <div className="space-y-8">
        {/* Introduction */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">What is psql?</h2>
          <p className="text-muted-foreground mb-4">
            psql is the interactive terminal for PostgreSQL. It allows you to connect directly to your Neon database, execute SQL commands, and manage your database schema from the command line.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="flex items-start gap-3">
                <Terminal className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-foreground text-sm mb-1">Interactive CLI</h4>
                  <p className="text-xs text-muted-foreground">
                    Execute SQL and PostgreSQL commands interactively
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-start gap-3">
                <Database className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-foreground text-sm mb-1">Schema Management</h4>
                  <p className="text-xs text-muted-foreground">
                    Create tables, indexes, and manage your schema
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-start gap-3">
                <Settings className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-foreground text-sm mb-1">Diagnostics</h4>
                  <p className="text-xs text-muted-foreground">
                    Debug issues and inspect database state
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Installation */}
        <section>
          <h3 className="text-xl font-bold text-foreground mb-4">Installation</h3>
          <p className="text-muted-foreground mb-4">
            psql comes with PostgreSQL. Install PostgreSQL for your operating system.
          </p>

          <CodeExampleBlock
            title="macOS"
            description="Install with Homebrew"
            code={`# Using Homebrew
brew install postgresql

# Verify installation
psql --version`}
          />

          <CodeExampleBlock
            title="Linux (Ubuntu/Debian)"
            description="Install with apt"
            code={`# Update package list
sudo apt update

# Install PostgreSQL client
sudo apt install postgresql-client

# Verify installation
psql --version`}
          />

          <CodeExampleBlock
            title="Windows"
            description="Using PostgreSQL installer"
            code={`# Download and run installer from:
# https://www.postgresql.org/download/windows/

# Or use Chocolatey:
choco install postgresql

# Verify installation
psql --version`}
          />
        </section>

        {/* Basic Connection */}
        <section>
          <h3 className="text-xl font-bold text-foreground mb-4">Connecting to Neon</h3>
          <p className="text-muted-foreground mb-4">
            Connect to your Neon database using the connection string from your Neon dashboard.
          </p>

          <CodeExampleBlock
            title="Basic Connection"
            description="Using connection string directly"
            code={`# Connect using full connection string
psql postgresql://user:password@ep-cool-rain-123456.us-east-2.aws.neon.tech:5432/neondb

# Connect with pooled connection (recommended)
psql postgresql://user:password@ep-cool-rain-123456-pooler.us-east-2.aws.neon.tech:5432/neondb`}
          />

          <CodeExampleBlock
            title="Using Environment Variable"
            description="Set DATABASE_URL variable"
            code={`# Set environment variable
export DATABASE_URL="postgresql://user:password@ep-cool-rain-123456-pooler.us-east-2.aws.neon.tech:5432/neondb"

# Connect using the variable
psql $DATABASE_URL`}
          />

          <Card className="p-4 border-amber-200 bg-amber-50 mt-4">
            <p className="text-sm text-foreground">
              <strong>Note:</strong> For interactive use and simple queries, you can use either pooled or direct connections. For schema migrations, use the direct connection (without -pooler).
            </p>
          </Card>
        </section>

        {/* Common Commands */}
        <section>
          <h3 className="text-xl font-bold text-foreground mb-4">Essential psql Commands</h3>
          <p className="text-muted-foreground mb-4">
            Key commands for working with your database.
          </p>

          <div className="space-y-4">
            <Card className="p-4">
              <div className="font-mono text-sm text-foreground mb-2">\\dt</div>
              <p className="text-sm text-muted-foreground">
                List all tables in the current database
              </p>
            </Card>
            <Card className="p-4">
              <div className="font-mono text-sm text-foreground mb-2">\\d tablename</div>
              <p className="text-sm text-muted-foreground">
                Describe a specific table (show columns, types, constraints)
              </p>
            </Card>
            <Card className="p-4">
              <div className="font-mono text-sm text-foreground mb-2">\\dn</div>
              <p className="text-sm text-muted-foreground">
                List all schemas
              </p>
            </Card>
            <Card className="p-4">
              <div className="font-mono text-sm text-foreground mb-2">\\du</div>
              <p className="text-sm text-muted-foreground">
                List all users/roles
              </p>
            </Card>
            <Card className="p-4">
              <div className="font-mono text-sm text-foreground mb-2">\\l</div>
              <p className="text-sm text-muted-foreground">
                List all databases
              </p>
            </Card>
            <Card className="p-4">
              <div className="font-mono text-sm text-foreground mb-2">\\h command</div>
              <p className="text-sm text-muted-foreground">
                Get help on a SQL command (e.g., \\h SELECT)
              </p>
            </Card>
            <Card className="p-4">
              <div className="font-mono text-sm text-foreground mb-2">\\c database</div>
              <p className="text-sm text-muted-foreground">
                Connect to a different database
              </p>
            </Card>
            <Card className="p-4">
              <div className="font-mono text-sm text-foreground mb-2">\\q</div>
              <p className="text-sm text-muted-foreground">
                Quit psql
              </p>
            </Card>
          </div>
        </section>

        {/* SQL Examples */}
        <section>
          <h3 className="text-xl font-bold text-foreground mb-4">SQL Examples</h3>
          <p className="text-muted-foreground mb-4">
            Common SQL operations in psql.
          </p>

          <h4 className="font-semibold text-foreground mb-3">Creating a Table</h4>
          <CodeExampleBlock
            title="CREATE TABLE"
            code={`CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`}
          />

          <h4 className="font-semibold text-foreground mb-3 mt-6">Inserting Data</h4>
          <CodeExampleBlock
            title="INSERT"
            code={`INSERT INTO users (email, name) VALUES 
('alice@example.com', 'Alice'),
('bob@example.com', 'Bob');

-- Verify insertion
SELECT * FROM users;`}
          />

          <h4 className="font-semibold text-foreground mb-3 mt-6">Creating an Index</h4>
          <CodeExampleBlock
            title="CREATE INDEX"
            code={`-- Create index on email for faster lookups
CREATE INDEX idx_users_email ON users(email);

-- Create index concurrently (non-blocking for production)
CREATE INDEX CONCURRENTLY idx_users_created_at ON users(created_at);`}
          />

          <h4 className="font-semibold text-foreground mb-3 mt-6">Modifying Schema</h4>
          <CodeExampleBlock
            title="ALTER TABLE"
            code={`-- Add a new column
ALTER TABLE users ADD COLUMN phone VARCHAR(20);

-- Drop a column
ALTER TABLE users DROP COLUMN phone;

-- Rename a column
ALTER TABLE users RENAME COLUMN name TO full_name;`}
          />
        </section>

        {/* Scripting */}
        <section>
          <h3 className="text-xl font-bold text-foreground mb-4">Running SQL Scripts</h3>
          <p className="text-muted-foreground mb-4">
            Execute SQL files from psql.
          </p>

          <CodeExampleBlock
            title="Execute SQL File"
            code={`# Run SQL from a file
psql postgresql://user:pass@host/db -f script.sql

# Run SQL and exit
psql postgresql://user:pass@host/db < script.sql

# Run with verbose output
psql -v ON_ERROR_STOP=1 postgresql://user:pass@host/db -f script.sql`}
          />

          <h4 className="font-semibold text-foreground mb-3 mt-6">Example SQL Script</h4>
          <CodeExampleBlock
            title="schema.sql"
            code={`-- Create tables
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);

-- Insert sample data
INSERT INTO users (email) VALUES ('test@example.com');

-- Verify
SELECT COUNT(*) FROM users;`}
          />
        </section>

        {/* Backup and Export */}
        <section>
          <h3 className="text-xl font-bold text-foreground mb-4">Backup and Export</h3>
          <p className="text-muted-foreground mb-4">
            Export data and schema from your Neon database.
          </p>

          <CodeExampleBlock
            title="Dump Database Schema"
            description="Export schema without data"
            code={`pg_dump postgresql://user:pass@host/db \\
  --schema-only \\
  > schema.sql`}
          />

          <CodeExampleBlock
            title="Dump Database with Data"
            description="Export complete database"
            code={`pg_dump postgresql://user:pass@host/db \\
  > backup.sql`}
          />

          <CodeExampleBlock
            title="Dump Specific Table"
            description="Export just one table"
            code={`pg_dump postgresql://user:pass@host/db \\
  --table=users \\
  > users.sql`}
          />

          <CodeExampleBlock
            title="Dump as CSV"
            description="Export data as CSV for spreadsheets"
            code={`# Using psql
psql postgresql://user:pass@host/db \\
  --command \"COPY users TO STDOUT WITH CSV HEADER\" \\
  > users.csv`}
          />
        </section>

        {/* Troubleshooting */}
        <section>
          <h3 className="text-xl font-bold text-foreground mb-4">Troubleshooting</h3>
          <div className="space-y-4">
            <Card className="p-4 border-red-200 bg-red-50">
              <h4 className="font-semibold text-foreground text-sm mb-2">\"could not connect to server\"</h4>
              <p className="text-sm text-muted-foreground">
                Check your connection string and credentials. Verify the hostname is correct and your IP address is allowed.
              </p>
            </Card>
            <Card className="p-4 border-amber-200 bg-amber-50">
              <h4 className="font-semibold text-foreground text-sm mb-2">\"role does not exist\"</h4>
              <p className="text-sm text-muted-foreground">
                Verify you&apos;re using the correct username from your connection string.
              </p>
            </Card>
            <Card className="p-4 border-yellow-200 bg-yellow-50">
              <h4 className="font-semibold text-foreground text-sm mb-2">\"SSL error\"</h4>
              <p className="text-sm text-muted-foreground">
                Neon requires SSL. Make sure your connection string includes <code className="bg-white px-2 py-1 rounded text-xs">?sslmode=require</code>.
              </p>
            </Card>
            <Card className="p-4 border-blue-200 bg-blue-50">
              <h4 className="font-semibold text-foreground text-sm mb-2">\"too many connections\"</h4>
              <p className="text-sm text-muted-foreground">
                Use the pooled connection string (-pooler) or upgrade your compute tier.
              </p>
            </Card>
          </div>
        </section>

        {/* Best Practices */}
        <section>
          <h3 className="text-xl font-bold text-foreground mb-4">Best Practices</h3>
          <div className="space-y-4">
            <Card className="p-4 border-green-200 bg-green-50">
              <h4 className="font-semibold text-foreground mb-2">Use Direct Connection for Migrations</h4>
              <p className="text-sm text-muted-foreground">
                For schema changes (CREATE INDEX CONCURRENTLY, migrations), use the direct connection without -pooler.
              </p>
            </Card>
            <Card className="p-4 border-blue-200 bg-blue-50">
              <h4 className="font-semibold text-foreground mb-2">Keep Scripts Version Controlled</h4>
              <p className="text-sm text-muted-foreground">
                Store your SQL migration scripts in git for tracking and reproducibility.
              </p>
            </Card>
            <Card className="p-4 border-purple-200 bg-purple-50">
              <h4 className="font-semibold text-foreground mb-2">Test in Development First</h4>
              <p className="text-sm text-muted-foreground">
                Always test SQL changes on a development branch before applying to production.
              </p>
            </Card>
            <Card className="p-4 border-indigo-200 bg-indigo-50">
              <h4 className="font-semibold text-foreground mb-2">Regular Backups</h4>
              <p className="text-sm text-muted-foreground">
                Use pg_dump regularly to create backups of your database.
              </p>
            </Card>
          </div>
        </section>
      </div>
    </GuideLayout>
  )
}
