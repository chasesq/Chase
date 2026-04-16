import { GuideLayout } from '@/components/guides/guide-layout'
import { GuideNavigation } from '@/components/guides/guide-navigation'
import { CodeExampleBlock } from '@/components/guides/code-example-block'
import { Card } from '@/components/ui/card'
import { Terminal } from 'lucide-react'

export const metadata = {
  title: 'psql Guide | Neon Guides',
  description: 'Learn how to use psql to connect to and query your Neon database from the command line.',
}

export default function PsqlPage() {
  return (
    <GuideLayout
      title="Using psql with Neon"
      description="Master the psql command-line tool for interacting with your Neon PostgreSQL database."
      breadcrumbs={[
        { label: 'Neon Connection Guide', href: '/guides/neon-connection-guide' },
        { label: 'Tools', href: '/guides/neon-connection-guide/tools/overview' },
        { label: 'psql' },
      ]}
      sidebar={<GuideNavigation />}
    >
      <div className="space-y-8">
        {/* Introduction */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">What is psql?</h2>
          <p className="text-muted-foreground mb-4">
            psql is the official PostgreSQL command-line client. It allows you to connect to and interact with PostgreSQL databases directly from your terminal. It&apos;s perfect for running queries, managing databases, and automating tasks.
          </p>
          <p className="text-muted-foreground">
            psql comes with PostgreSQL, so if you have PostgreSQL installed, you already have psql.
          </p>
        </section>

        {/* Installation */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">Installation</h2>

          <h3 className="text-lg font-bold text-foreground mb-4">macOS</h3>
          <CodeExampleBlock
            title="Install PostgreSQL with Homebrew"
            code={`# Install PostgreSQL (includes psql)
brew install postgresql@15

# Or just install psql client (lighter weight)
brew install libpq
echo 'export PATH="/usr/local/opt/libpq/bin:$PATH"' >> ~/.zprofile`}
          />

          <h3 className="text-lg font-bold text-foreground mb-4">Linux (Ubuntu/Debian)</h3>
          <CodeExampleBlock
            title="Install PostgreSQL Client"
            code={`# Update package manager
sudo apt update

# Install PostgreSQL client
sudo apt install postgresql-client

# Verify installation
psql --version`}
          />

          <h3 className="text-lg font-bold text-foreground mb-4">Windows</h3>
          <CodeExampleBlock
            title="Install PostgreSQL"
            code={`# Download from https://www.postgresql.org/download/windows/
# Run the installer and select to install psql

# Or use Chocolatey
choco install postgresql

# Or use Windows Subsystem for Linux (WSL)
# See Linux instructions above`}
          />

          <h3 className="text-lg font-bold text-foreground mb-4">Verify Installation</h3>
          <CodeExampleBlock
            title="Check psql Version"
            code={`psql --version
# Output: psql (PostgreSQL) 15.2`}
          />
        </section>

        {/* Connecting */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">Connecting to Neon</h2>

          <h3 className="text-lg font-bold text-foreground mb-4">Get Your Connection String</h3>
          <p className="text-muted-foreground mb-4">
            In the Neon Console, click on your database and copy the connection string.
          </p>

          <h3 className="text-lg font-bold text-foreground mb-4">Basic Connection</h3>
          <CodeExampleBlock
            title="Connect to Neon Database"
            code={`psql 'postgresql://user:password@ep-cool-rain.us-east-2.aws.neon.tech/neondb'

# Or with environment variable
export DATABASE_URL='postgresql://user:password@ep-cool-rain.us-east-2.aws.neon.tech/neondb'
psql $DATABASE_URL`}
          />

          <h3 className="text-lg font-bold text-foreground mb-4">Using a .pgpass File</h3>
          <p className="text-muted-foreground mb-4">
            Store your connection credentials securely in a <code className="bg-muted px-2 py-1 rounded text-sm">~/.pgpass</code> file so you don&apos;t need to include the password in commands.
          </p>
          <CodeExampleBlock
            title="Create ~/.pgpass"
            description="One entry per line: hostname:port:database:user:password"
            code={`# ~/.pgpass
ep-cool-rain.us-east-2.aws.neon.tech:5432:neondb:user:password

# Set permissions (required)
chmod 600 ~/.pgpass

# Now connect without password
psql -h ep-cool-rain.us-east-2.aws.neon.tech -U user -d neondb`}
          />

          <h3 className="text-lg font-bold text-foreground mb-4">Break Down Connection String</h3>
          <Card className="p-4 border-blue-200 bg-blue-50">
            <code className="text-sm font-mono text-foreground block mb-3">
              postgresql://user:password@host:port/database
            </code>
            <div className="space-y-2 text-sm text-foreground">
              <div><strong>user:</strong> Your database user (default: neondb_owner)</div>
              <div><strong>password:</strong> Your password</div>
              <div><strong>host:</strong> Neon endpoint (e.g., ep-cool-rain.us-east-2.aws.neon.tech)</div>
              <div><strong>port:</strong> PostgreSQL port (default: 5432)</div>
              <div><strong>database:</strong> Database name (default: neondb)</div>
            </div>
          </Card>
        </section>

        {/* Basic Commands */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">Basic psql Commands</h2>

          <h3 className="text-lg font-bold text-foreground mb-4">Running Queries</h3>
          <CodeExampleBlock
            title="Execute SQL"
            code={`# Once connected, type SQL queries
psql> SELECT * FROM users;

# Run query and disconnect
psql $DATABASE_URL -c "SELECT * FROM users;"

# Run from file
psql $DATABASE_URL -f queries.sql`}
          />

          <h3 className="text-lg font-bold text-foreground mb-4">Meta-Commands (Backslash Commands)</h3>
          <p className="text-muted-foreground mb-4">
            Meta-commands start with a backslash (<code className="bg-muted px-1 rounded text-xs">\</code>) and control psql behavior.
          </p>

          <div className="space-y-3 mb-6">
            <Card className="p-4">
              <code className="text-sm font-mono text-foreground">\l</code>
              <p className="text-sm text-muted-foreground mt-1">List all databases</p>
            </Card>

            <Card className="p-4">
              <code className="text-sm font-mono text-foreground">\dt</code>
              <p className="text-sm text-muted-foreground mt-1">List tables in current database</p>
            </Card>

            <Card className="p-4">
              <code className="text-sm font-mono text-foreground">\d tablename</code>
              <p className="text-sm text-muted-foreground mt-1">Describe a table (show columns and types)</p>
            </Card>

            <Card className="p-4">
              <code className="text-sm font-mono text-foreground">\du</code>
              <p className="text-sm text-muted-foreground mt-1">List database users/roles</p>
            </Card>

            <Card className="p-4">
              <code className="text-sm font-mono text-foreground">\dn</code>
              <p className="text-sm text-muted-foreground mt-1">List schemas</p>
            </Card>

            <Card className="p-4">
              <code className="text-sm font-mono text-foreground">\df</code>
              <p className="text-sm text-muted-foreground mt-1">List functions</p>
            </Card>

            <Card className="p-4">
              <code className="text-sm font-mono text-foreground">\i filename</code>
              <p className="text-sm text-muted-foreground mt-1">Execute SQL from file</p>
            </Card>

            <Card className="p-4">
              <code className="text-sm font-mono text-foreground">\e</code>
              <p className="text-sm text-muted-foreground mt-1">Edit query in text editor</p>
            </Card>

            <Card className="p-4">
              <code className="text-sm font-mono text-foreground">\h commandname</code>
              <p className="text-sm text-muted-foreground mt-1">Get help on SQL command</p>
            </Card>

            <Card className="p-4">
              <code className="text-sm font-mono text-foreground">\x</code>
              <p className="text-sm text-muted-foreground mt-1">Toggle expanded display (for wide tables)</p>
            </Card>

            <Card className="p-4">
              <code className="text-sm font-mono text-foreground">\q</code>
              <p className="text-sm text-muted-foreground mt-1">Quit psql</p>
            </Card>
          </div>

          <CodeExampleBlock
            title="Example Meta-Commands Session"
            code={`$ psql $DATABASE_URL
neondb=> \\dt
                List of relations
 Schema |     Name      | Type  | Owner
--------+---------------+-------+-------
 public | users         | table | neondb_owner
 public | posts         | table | neondb_owner
 public | comments      | table | neondb_owner

neondb=> \\d users
            Table "public.users"
  Column   |  Type   | Collation | Nullable | Default
-----------+---------+-----------+----------+---------
 id        | integer |           | not null |
 name      | text    |           |          |
 email     | text    |           |          |
 created_at| timestamp|          |          |

neondb=> \\q`}
          />
        </section>

        {/* Advanced Usage */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">Advanced psql Usage</h2>

          <h3 className="text-lg font-bold text-foreground mb-4">Running Scripts</h3>
          <CodeExampleBlock
            title="Execute SQL File"
            code={`# Method 1: While connected
psql> \\i schema.sql

# Method 2: As command argument
psql $DATABASE_URL -f migrations/001_initial_schema.sql

# Method 3: Using bash pipeline
cat schema.sql | psql $DATABASE_URL`}
          />

          <h3 className="text-lg font-bold text-foreground mb-4">Output Formatting</h3>
          <CodeExampleBlock
            title="Different Output Formats"
            code={`# Default (aligned)
psql -c "SELECT * FROM users"

# CSV format (useful for importing)
psql -c "SELECT * FROM users" --csv

# Tab-separated (TSV)
psql -c "SELECT * FROM users" -F $'\\t'

# HTML format
psql -c "SELECT * FROM users" --html

# JSON format
psql -c "SELECT * FROM users" --json`}
          />

          <h3 className="text-lg font-bold text-foreground mb-4">Variables and Loops</h3>
          <CodeExampleBlock
            title="Using Variables in psql"
            code={`# Set a variable
psql> \\set userid 123

# Use the variable
psql> SELECT * FROM users WHERE id = :userid;

# Loop over values
psql> \\set id 1
psql> SELECT * FROM users WHERE id = :id;
psql> \\set id 2
psql> SELECT * FROM users WHERE id = :id;`}
          />

          <h3 className="text-lg font-bold text-foreground mb-4">Timing Queries</h3>
          <CodeExampleBlock
            title="Measure Query Performance"
            code={`# Enable timing
psql> \\timing on

# Run query (timing is displayed)
psql> SELECT COUNT(*) FROM users;
 count
-------
  1000
(1 row)

Time: 45.123 ms

# Disable timing
psql> \\timing off`}
          />

          <h3 className="text-lg font-bold text-foreground mb-4">Batch Operations</h3>
          <CodeExampleBlock
            title="Run Multiple Queries from Bash"
            code={`# Run multiple queries sequentially
psql $DATABASE_URL << EOF
\\dt
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM posts;
EOF

# Or with error handling
psql $DATABASE_URL -v ON_ERROR_STOP=1 << EOF
BEGIN;
INSERT INTO users (name, email) VALUES ('John', 'john@example.com');
INSERT INTO users (name, email) VALUES ('Jane', 'jane@example.com');
COMMIT;
EOF`}
          />
        </section>

        {/* Common Tasks */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">Common Tasks with psql</h2>

          <Card className="p-6 mb-4">
            <h3 className="text-lg font-bold text-foreground mb-4">Backup Your Database</h3>
            <CodeExampleBlock
              title="Create a Database Dump"
              code={`# Backup all data and schema
pg_dump $DATABASE_URL > backup.sql

# Backup schema only (no data)
pg_dump --schema-only $DATABASE_URL > schema.sql

# Backup with custom format (more efficient)
pg_dump --format=custom $DATABASE_URL > backup.dump`}
            />
          </Card>

          <Card className="p-6 mb-4">
            <h3 className="text-lg font-bold text-foreground mb-4">Restore from Backup</h3>
            <CodeExampleBlock
              title="Restore Database from Dump"
              code={`# Restore from SQL backup
psql $DATABASE_URL < backup.sql

# Restore from custom format backup
pg_restore --dbname=$DATABASE_URL backup.dump

# Restore to a different database
psql postgresql://user:password@host/other_db < backup.sql`}
            />
          </Card>

          <Card className="p-6 mb-4">
            <h3 className="text-lg font-bold text-foreground mb-4">Monitor Database Activity</h3>
            <CodeExampleBlock
              title="View Active Connections and Queries"
              code={`# Connect and run monitoring query
psql $DATABASE_URL -c "
  SELECT pid, usename, application_name, state, query
  FROM pg_stat_activity
  WHERE datname = 'neondb'
  ORDER BY query_start DESC;
"`}
            />
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">Run Migrations</h3>
            <CodeExampleBlock
              title="Apply Schema Changes"
              code={`# Run migration file
psql $DATABASE_URL -f migrations/001_add_users_table.sql
psql $DATABASE_URL -f migrations/002_add_posts_table.sql
psql $DATABASE_URL -f migrations/003_add_indexes.sql

# Or run all at once
for migration in migrations/*.sql; do
  echo "Running $migration..."
  psql $DATABASE_URL -f "$migration"
done`}
            />
          </Card>
        </section>

        {/* Tips and Tricks */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">Tips and Tricks</h2>
          <div className="space-y-4">
            <Card className="p-4 border-blue-200 bg-blue-50">
              <h4 className="font-semibold text-foreground mb-2">Use Aliases for Common Connections</h4>
              <CodeExampleBlock
                title="Add to ~/.bashrc or ~/.zshrc"
                code={`alias psql-neon="psql \\
  postgresql://user:password@ep-cool-rain.us-east-2.aws.neon.tech/neondb"

# Now you can just type
psql-neon`}
              />
            </Card>

            <Card className="p-4 border-green-200 bg-green-50">
              <h4 className="font-semibold text-foreground mb-2">Set PAGER for Long Output</h4>
              <p className="text-sm text-foreground mb-2">
                Control how psql displays results that span multiple screens.
              </p>
              <CodeExampleBlock
                code={`# Use 'less' for pagination
psql> \\pset pager on

# Disable paging (output all at once)
psql> \\pset pager off`}
              />
            </Card>

            <Card className="p-4 border-purple-200 bg-purple-50">
              <h4 className="font-semibold text-foreground mb-2">View Query History</h4>
              <CodeExampleBlock
                code={`# psql uses bash history
# Press up arrow to see previous queries
# Or search history with Ctrl+R`}
              />
            </Card>

            <Card className="p-4 border-amber-200 bg-amber-50">
              <h4 className="font-semibold text-foreground mb-2">Suppress Output</h4>
              <CodeExampleBlock
                code={`# Run query silently (useful in scripts)
psql $DATABASE_URL -q -c "INSERT INTO users VALUES (...)"`}
              />
            </Card>
          </div>
        </section>

        {/* Troubleshooting */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">Troubleshooting</h2>

          <Card className="p-4 border-amber-200 bg-amber-50 mb-4">
            <h4 className="font-semibold text-foreground mb-2">Connection Refused</h4>
            <p className="text-sm text-foreground mb-2">
              <strong>Error:</strong> "psql: could not translate host name to address"
            </p>
            <p className="text-sm text-foreground">
              <strong>Solution:</strong> Check your hostname is correct and you have internet connectivity.
            </p>
          </Card>

          <Card className="p-4 border-amber-200 bg-amber-50 mb-4">
            <h4 className="font-semibold text-foreground mb-2">Password Authentication Failed</h4>
            <p className="text-sm text-foreground mb-2">
              <strong>Error:</strong> "password authentication failed for user"
            </p>
            <p className="text-sm text-foreground">
              <strong>Solution:</strong> Verify your password is correct. Check Neon Console for the correct connection string.
            </p>
          </Card>

          <Card className="p-4 border-amber-200 bg-amber-50">
            <h4 className="font-semibold text-foreground mb-2">SSL Error</h4>
            <p className="text-sm text-foreground mb-2">
              <strong>Error:</strong> "SSL/TLS required"
            </p>
            <p className="text-sm text-foreground">
              <strong>Solution:</strong> Your connection string should include <code className="bg-white px-1 rounded text-xs">?sslmode=require</code>. Make sure you're using HTTPS/SSL.
            </p>
          </Card>
        </section>

        {/* Resources */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">Resources</h2>
          <Card className="p-4 border-blue-200 bg-blue-50 mb-4">
            <h4 className="font-semibold text-foreground mb-2">Official psql Documentation</h4>
            <p className="text-sm text-foreground">
              <a href="https://www.postgresql.org/docs/current/app-psql.html" className="text-blue-700 hover:underline">
                PostgreSQL psql Manual
              </a>
            </p>
          </Card>

          <Card className="p-4 border-blue-200 bg-blue-50">
            <h4 className="font-semibold text-foreground mb-2">PostgreSQL Command Reference</h4>
            <p className="text-sm text-foreground">
              <a href="https://www.postgresql.org/docs/current/sql-commands.html" className="text-blue-700 hover:underline">
                SQL Commands Reference
              </a>
            </p>
          </Card>
        </section>
      </div>
    </GuideLayout>
  )
}
