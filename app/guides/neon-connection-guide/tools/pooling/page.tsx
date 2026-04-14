import { GuideLayout } from '@/components/guides/guide-layout'
import { GuideNavigation } from '@/components/guides/guide-navigation'
import { CodeExampleBlock } from '@/components/guides/code-example-block'
import { Card } from '@/components/ui/card'
import { Activity, Zap, Lock } from 'lucide-react'

export const metadata = {
  title: 'Connection Pooling Guide | Neon Guides',
  description: 'Understand pooled vs. direct connections and how to configure connection pooling.',
}

export default function PoolingPage() {
  return (
    <GuideLayout
      title="Connection Pooling"
      description="Understand pooled vs. direct connections and how to configure connection pooling for optimal performance."
      breadcrumbs={[
        { label: 'Neon Connection Guide', href: '/guides/neon-connection-guide' },
        { label: 'Tools', href: '/guides/neon-connection-guide/tools/pooling' },
        { label: 'Connection Pooling' },
      ]}
      sidebar={<GuideNavigation />}
    >
      <div className="space-y-8">
        {/* Introduction */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">What is Connection Pooling?</h2>
          <p className="text-muted-foreground mb-4">
            Every time your application connects to PostgreSQL, it creates a new connection. Creating connections is expensive (network latency, authentication, memory). Connection pooling maintains a pool of idle connections ready to reuse, dramatically improving performance.
          </p>

          <div className="bg-muted p-6 rounded-lg mb-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Without Pooling:</h4>
                <div className="text-sm text-foreground space-y-1">
                  <div>Query 1: Create Connection (100ms) → Execute → Close</div>
                  <div>Query 2: Create Connection (100ms) → Execute → Close</div>
                  <div>Query 3: Create Connection (100ms) → Execute → Close</div>
                  <div className="font-bold text-amber-600">Total: 300ms+ for 3 queries</div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-2">With Pooling:</h4>
                <div className="text-sm text-foreground space-y-1">
                  <div>Setup: Create Pool with 10 connections (200ms)</div>
                  <div>Query 1: Reuse Connection → Execute → Return to pool (5ms)</div>
                  <div>Query 2: Reuse Connection → Execute → Return to pool (5ms)</div>
                  <div>Query 3: Reuse Connection → Execute → Return to pool (5ms)</div>
                  <div className="font-bold text-green-600">Total: 215ms for 3 queries (30% faster)</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pooled vs Direct */}
        <section>
          <h3 className="text-xl font-bold text-foreground mb-4">Pooled vs. Direct Connections</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="p-4 border-green-200 bg-green-50">
              <div className="flex items-start gap-3 mb-3">
                <Zap className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                <h4 className="font-semibold text-foreground">Pooled Connection</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Connections are managed by PgBouncer, a connection pool manager. Reuses connections across requests.
              </p>
              <div className="space-y-2 text-xs text-muted-foreground">
                <p><strong>✓ Benefits:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Handles up to 10,000 concurrent clients</li>
                  <li>Faster connection time (reuses existing connections)</li>
                  <li>Lower resource usage</li>
                  <li>Ideal for serverless and high-concurrency</li>
                </ul>
              </div>
              <div className="mt-3 pt-3 border-t border-green-200">
                <p className="text-xs font-mono text-green-700 bg-white px-2 py-1 rounded">
                  -pooler in hostname
                </p>
              </div>
            </Card>

            <Card className="p-4 border-blue-200 bg-blue-50">
              <div className="flex items-start gap-3 mb-3">
                <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                <h4 className="font-semibold text-foreground">Direct Connection</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Direct TCP connection to PostgreSQL. Each connection is independent.
              </p>
              <div className="space-y-2 text-xs text-muted-foreground">
                <p><strong>✓ Use When:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Schema migrations (CREATE, ALTER, DROP)</li>
                  <li>CREATE INDEX CONCURRENTLY</li>
                  <li>LISTEN/NOTIFY features</li>
                  <li>Temporary tables or prepared statements</li>
                </ul>
              </div>
              <div className="mt-3 pt-3 border-t border-blue-200">
                <p className="text-xs font-mono text-blue-700 bg-white px-2 py-1 rounded">
                  Standard hostname (no -pooler)
                </p>
              </div>
            </Card>
          </div>

          <Card className="p-4 border-amber-200 bg-amber-50">
            <h4 className="font-semibold text-foreground mb-2">Default Recommendation</h4>
            <p className="text-sm text-muted-foreground">
              Use pooled connections for most applications. Switch to direct connections only when you need specific PostgreSQL features that PgBouncer doesn&apos;t support.
            </p>
          </Card>
        </section>

        {/* Connection String */}
        <section>
          <h3 className="text-xl font-bold text-foreground mb-4">Connection String Format</h3>
          <p className="text-muted-foreground mb-4">
            The connection type is determined by the hostname in your connection string.
          </p>

          <CodeExampleBlock
            title="Pooled Connection String"
            description="Contains -pooler in the hostname"
            code={`postgresql://user:password@ep-cool-rain-123456-pooler.us-east-2.aws.neon.tech:5432/neondb?sslmode=require&channel_binding=require`}
          />

          <CodeExampleBlock
            title="Direct Connection String"
            description="Standard hostname without -pooler"
            code={`postgresql://user:password@ep-cool-rain-123456.us-east-2.aws.neon.tech:5432/neondb?sslmode=require&channel_binding=require`}
          />

          <Card className="p-4 border-blue-200 bg-blue-50 mt-4">
            <p className="text-sm text-foreground">
              <strong>Key Difference:</strong> The <code className="bg-white px-2 py-1 rounded text-xs">-pooler</code> in the hostname is the only difference. Pooled strings route through PgBouncer before reaching Postgres.
            </p>
          </Card>
        </section>

        {/* How Pooling Works */}
        <section>
          <h3 className="text-xl font-bold text-foreground mb-4">How Connection Pooling Works</h3>
          <p className="text-muted-foreground mb-4">
            Understanding the pooling process helps optimize your application.
          </p>

          <div className="bg-muted p-6 rounded-lg mb-6">
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center">1</div>
                <p className="text-muted-foreground">
                  <strong>Application requests connection:</strong> Your app asks for a database connection
                </p>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center">2</div>
                <p className="text-muted-foreground">
                  <strong>PgBouncer checks pool:</strong> If idle connections exist, one is assigned
                </p>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center">3</div>
                <p className="text-muted-foreground">
                  <strong>Connection is returned:</strong> App uses the pooled connection
                </p>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center">4</div>
                <p className="text-muted-foreground">
                  <strong>App releases connection:</strong> When done, connection returns to pool
                </p>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center">5</div>
                <p className="text-muted-foreground">
                  <strong>Connection is reused:</strong> Available for next request
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Configuration */}
        <section>
          <h3 className="text-xl font-bold text-foreground mb-4">Pooling Configuration</h3>
          <p className="text-muted-foreground mb-4">
            Key parameters that control pooling behavior.
          </p>

          <div className="space-y-4 mb-6">
            <Card className="p-4">
              <h4 className="font-semibold text-foreground text-sm mb-2">default_pool_size</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Maximum number of server connections per user/database pair (typically 10)
              </p>
              <p className="text-xs text-muted-foreground">
                Limited by your compute size. Contact support to increase.
              </p>
            </Card>

            <Card className="p-4">
              <h4 className="font-semibold text-foreground text-sm mb-2">max_connections</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Total maximum connections to your database (ranges from ~100 to 4,000 depending on compute)
              </p>
              <p className="text-xs text-muted-foreground">
                Limited by your compute size. Upgrade to raise this limit.
              </p>
            </Card>

            <Card className="p-4">
              <h4 className="font-semibold text-foreground text-sm mb-2">server_lifetime</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Maximum age of a pooled connection (default: 3600 seconds)
              </p>
              <p className="text-xs text-muted-foreground">
                Connections older than this are closed and recreated.
              </p>
            </Card>

            <Card className="p-4">
              <h4 className="font-semibold text-foreground text-sm mb-2">server_idle_timeout</h4>
              <p className="text-sm text-muted-foreground mb-2">
                How long a connection can be idle before closing (default: 600 seconds)
              </p>
              <p className="text-xs text-muted-foreground">
                Idle connections are closed to free resources.
              </p>
            </Card>
          </div>
        </section>

        {/* Client-Side Pooling */}
        <section>
          <h3 className="text-xl font-bold text-foreground mb-4">Client-Side Connection Pooling</h3>
          <p className="text-muted-foreground mb-4">
            For server-side applications (Node.js, Python, etc.), implement connection pooling in your application code.
          </p>

          <h4 className="font-semibold text-foreground mb-3">Node.js / TypeScript</h4>

          <CodeExampleBlock
            title="pg Library with Pooling"
            description="Built-in connection pooling"
            code={`import { Pool } from 'pg';

// Create a pool (default 10 connections)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum connections
  min: 2,  // Minimum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Use pool for queries
async function getUser(id) {
  const result = await pool.query(
    'SELECT * FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0];
}

// Close pool on shutdown
process.on('SIGINT', () => {
  pool.end(() => {
    process.exit(0);
  });
});`}
          />

          <CodeExampleBlock
            title="Prisma with Connection Pooling"
            description="Prisma ORM with pooling configuration"
            code={`// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // Add pooling directive
  directUrl = env("DIRECT_DATABASE_URL")
}

// In production, use pooled URL for standard queries
// DATABASE_URL="postgresql://....-pooler.us-east-2.aws.neon.tech/neondb"
// For migrations, use direct URL (one connection needed)
// DIRECT_DATABASE_URL="postgresql://....us-east-2.aws.neon.tech/neondb"`}
          />

          <CodeExampleBlock
            title="Drizzle with Connection Pooling"
            description="Drizzle ORM pooling setup"
            code={`import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
});

const db = drizzle(pool);

// Use db for queries
const users = await db.select().from(usersTable);`}
          />

          <h4 className="font-semibold text-foreground mb-3 mt-6">Python</h4>

          <CodeExampleBlock
            title="asyncpg Connection Pool"
            description="Python async connection pooling"
            code={`import asyncpg
import os

# Create connection pool
pool = await asyncpg.create_pool(
    os.environ['DATABASE_URL'],
    min_size=10,
    max_size=20,
    timeout=10,
)

# Use pool for queries
async def get_user(user_id):
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            'SELECT * FROM users WHERE id = $1',
            user_id
        )
        return row

# Close pool on shutdown
await pool.close()`}
          />

          <CodeExampleBlock
            title="SQLAlchemy Connection Pool"
            description="SQLAlchemy with connection pooling"
            code={`from sqlalchemy import create_engine, pool

# Create engine with pooling
engine = create_engine(
    os.environ['DATABASE_URL'],
    poolclass=pool.QueuePool,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
    pool_recycle=3600,
)

# Use engine for queries
with engine.connect() as conn:
    result = conn.execute(text('SELECT * FROM users'))`}
          />
        </section>

        {/* Pool Modes */}
        <section>
          <h3 className="text-xl font-bold text-foreground mb-4">PgBouncer Pool Modes</h3>
          <p className="text-muted-foreground mb-4">
            Neon uses PgBouncer which supports different pooling modes. Understanding them helps optimize for your use case.
          </p>

          <Card className="p-4 border-blue-200 bg-blue-50 mb-4">
            <h4 className="font-semibold text-foreground mb-2">Session Mode (Default)</h4>
            <p className="text-sm text-foreground mb-2">
              One server connection per client session. Server connection is held for the entire session.
            </p>
            <div className="text-sm text-foreground space-y-1">
              <p><strong>Best for:</strong> Traditional web apps, JDBC connections, persistent connections</p>
              <p><strong>Overhead:</strong> Lower (reuses same connection)</p>
            </div>
          </Card>

          <Card className="p-4 border-green-200 bg-green-50 mb-4">
            <h4 className="font-semibold text-foreground mb-2">Transaction Mode</h4>
            <p className="text-sm text-foreground mb-2">
              Server connection released after each transaction completes. Better connection reuse.
            </p>
            <div className="text-sm text-foreground space-y-1">
              <p><strong>Best for:</strong> Serverless functions, microservices, high connection churn</p>
              <p><strong>Overhead:</strong> Higher (connection negotiation per transaction)</p>
            </div>
          </Card>

          <Card className="p-4 border-purple-200 bg-purple-50">
            <h4 className="font-semibold text-foreground mb-2">Statement Mode</h4>
            <p className="text-sm text-foreground mb-2">
              Connection released after each statement. Maximum connection reuse but most overhead.
            </p>
            <div className="text-sm text-foreground space-y-1">
              <p><strong>Best for:</strong> Very high concurrency with short queries</p>
              <p><strong>Overhead:</strong> Highest (per-statement overhead)</p>
              <p className="text-red-700"><strong>Warning:</strong> Breaks some PostgreSQL features (prepared statements, temp tables)</p>
            </div>
          </Card>
        </section>

        {/* Common Pitfalls */}
        <section>
          <h3 className="text-xl font-bold text-foreground mb-4">Common Pooling Pitfalls</h3>
          <div className="space-y-4">
            <Card className="p-4 border-red-200 bg-red-50">
              <h4 className="font-semibold text-foreground mb-2">Double Pooling</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Using pooling on both Neon (PgBouncer) and in your client driver
              </p>
              <CodeExampleBlock
                title="❌ Wrong: Double Pooling"
                code={`// Using pooled Neon connection with client-side pooling
const pool = new Pool({
  connectionString: "...-pooler.neon.tech/...",
  max: 20, // Client-side pooling on top of Neon pooling!
});`}
              />
              <CodeExampleBlock
                title="✓ Right: Neon Pooling Only"
                code={`// Using pooled Neon connection WITHOUT client-side pooling
const pool = new Pool({
  connectionString: "...-pooler.neon.tech/...",
  // Let Neon handle pooling, no client-side pool config
});`}
              />
            </Card>

            <Card className="p-4 border-amber-200 bg-amber-50">
              <h4 className="font-semibold text-foreground mb-2">Releasing Connections</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Forgetting to release connections back to the pool
              </p>
              <CodeExampleBlock
                title="Always Release Connections"
                code={`const client = await pool.connect();
try {
  const result = await client.query('SELECT * FROM users');
  console.log(result);
} finally {
  client.release(); // CRITICAL: Always release!
}`}
              />
            </Card>

            <Card className="p-4 border-yellow-200 bg-yellow-50">
              <h4 className="font-semibold text-foreground mb-2">Understanding max_connections vs default_pool_size</h4>
              <p className="text-sm text-muted-foreground">
                <strong>max_connections</strong> is the total limit for your database. <strong>default_pool_size</strong> is per user/database pair. Increasing compute size increases max_connections, but contact support to increase default_pool_size.
              </p>
            </Card>
          </div>
        </section>

        {/* Best Practices */}
        <section>
          <h3 className="text-xl font-bold text-foreground mb-4">Pooling Best Practices</h3>
          <div className="space-y-4">
            <Card className="p-4 border-green-200 bg-green-50">
              <h4 className="font-semibold text-foreground mb-2">Use Pooled Connections by Default</h4>
              <p className="text-sm text-muted-foreground">
                Start with pooled connections (-pooler). Only use direct connections when needed for specific operations.
              </p>
            </Card>
            <Card className="p-4 border-blue-200 bg-blue-50">
              <h4 className="font-semibold text-foreground mb-2">Separate Connections for Migrations</h4>
              <p className="text-sm text-muted-foreground">
                Use direct connections for schema migrations. Use pooled connections for application queries.
              </p>
            </Card>
            <Card className="p-4 border-purple-200 bg-purple-50">
              <h4 className="font-semibold text-foreground mb-2">Monitor Connection Usage</h4>
              <p className="text-sm text-muted-foreground">
                Monitor active connections in your Neon dashboard to ensure you&apos;re not hitting limits.
              </p>
            </Card>
            <Card className="p-4 border-indigo-200 bg-indigo-50">
              <h4 className="font-semibold text-foreground mb-2">Set Appropriate Timeouts</h4>
              <p className="text-sm text-muted-foreground">
                Configure idle timeouts to release unused connections and keep the pool healthy.
              </p>
            </Card>
          </div>
        </section>

        {/* Troubleshooting */}
        <section>
          <h3 className="text-xl font-bold text-foreground mb-4">Troubleshooting Connection Pooling</h3>
          <div className="space-y-4">
            <Card className="p-4">
              <h4 className="font-semibold text-foreground text-sm mb-2">\"too many connections\" Error</h4>
              <p className="text-sm text-muted-foreground">
                You&apos;ve hit the max_connections limit. Options: (1) Close unused connections, (2) Release connections to the pool, (3) Upgrade compute tier.
              </p>
            </Card>
            <Card className="p-4">
              <h4 className="font-semibold text-foreground text-sm mb-2">Connection Pool Exhausted</h4>
              <p className="text-sm text-muted-foreground">
                All pooled connections are in use. Ensure you&apos;re releasing connections properly and not holding them longer than needed.
              </p>
            </Card>
            <Card className="p-4">
              <h4 className="font-semibold text-foreground text-sm mb-2">Slow Queries with Pooling</h4>
              <p className="text-sm text-muted-foreground">
                If queries are slower than expected, you may be hitting default_pool_size limits. Contact support to increase it.
              </p>
            </Card>
          </div>
        </section>
      </div>
    </GuideLayout>
  )
}
