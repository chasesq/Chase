import { GuideLayout } from '@/components/guides/guide-layout'
import { GuideNavigation } from '@/components/guides/guide-navigation'
import { CodeExampleBlock } from '@/components/guides/code-example-block'
import { Card } from '@/components/ui/card'

export const metadata = {
  title: 'JavaScript/TypeScript Connection Guide | Neon Guides',
  description: 'Learn how to connect to Neon from JavaScript and TypeScript applications.',
}

export default function JavaScriptTypeScriptPage() {
  return (
    <GuideLayout
      title="JavaScript & TypeScript"
      description="Connect to Neon from Node.js, Vercel, Cloudflare, and other JS/TS environments."
      breadcrumbs={[
        { label: 'Neon Connection Guide', href: '/guides/neon-connection-guide' },
        { label: 'JavaScript/TypeScript' },
      ]}
      sidebar={<GuideNavigation />}
    >
      <div className="space-y-8">
        {/* Introduction */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">Overview</h2>
          <p className="text-muted-foreground mb-4">
            JavaScript and TypeScript applications can connect to Neon using various drivers depending on your deployment environment. Choose your scenario below to find the recommended approach.
          </p>
        </section>

        {/* Long-Lived Servers */}
        <section>
          <h3 className="text-xl font-bold text-foreground mb-4">Long-Lived Servers (Railway, Render, VPS, Docker)</h3>
          <p className="text-muted-foreground mb-4">
            For applications deployed to persistent server environments, use standard TCP drivers with connection pooling. These drivers can maintain connections across requests for optimal performance.
          </p>
          
          <div className="space-y-4 mb-6">
            <h4 className="font-semibold text-foreground">Recommended Drivers:</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { name: 'node-postgres (pg)', desc: 'Most popular, full-featured' },
                { name: 'postgres.js', desc: 'Modern, minimal footprint' },
                { name: 'Bun.SQL', desc: 'Native Bun support' },
              ].map((driver) => (
                <Card key={driver.name} className="p-4">
                  <h5 className="font-semibold text-foreground">{driver.name}</h5>
                  <p className="text-sm text-muted-foreground">{driver.desc}</p>
                </Card>
              ))}
            </div>
          </div>

          <CodeExampleBlock
            title="Connecting with node-postgres"
            description="Basic connection setup using pg"
            code={`const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Pooling is handled automatically
  max: 20, // maximum number of connections
  idleTimeoutMillis: 30000,
});

// Query using the pool
const result = await pool.query('SELECT NOW()');
console.log(result.rows);`}
          />
        </section>

        {/* Vercel */}
        <section>
          <h3 className="text-xl font-bold text-foreground mb-4">Vercel (Fluid Compute)</h3>
          <p className="text-muted-foreground mb-4">
            Vercel Fluid keeps functions warm long enough to reuse TCP connections, making standard TCP drivers the best choice. Use node-postgres (pg) with @vercel/functions for optimal performance.
          </p>

          <CodeExampleBlock
            title="Vercel + Neon Setup"
            description="Connecting from Vercel Fluid compute"
            code={`import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(req, res) {
  try {
    const result = await pool.query('SELECT NOW()');
    res.status(200).json({ time: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}`}
          />

          <Card className="p-4 border-blue-200 bg-blue-50 mt-4">
            <p className="text-sm text-foreground">
              <strong>Tip:</strong> Set your DATABASE_URL in Vercel environment variables. Use the pooled connection string ending in <code className="bg-white px-2 py-1 rounded text-xs">-pooler</code>.
            </p>
          </Card>
        </section>

        {/* Cloudflare */}
        <section>
          <h3 className="text-xl font-bold text-foreground mb-4">Cloudflare Workers & Hyperdrive</h3>
          <p className="text-muted-foreground mb-4">
            Use node-postgres with Hyperdrive for connection pooling in Cloudflare Workers. Hyperdrive provides a TCP connection pool that works across requests.
          </p>

          <CodeExampleBlock
            title="Cloudflare Hyperdrive Setup"
            description="Using pg with Hyperdrive"
            code={`import { Pool } from 'pg';

export default {
  async fetch(request, env) {
    const pool = new Pool({
      connectionString: env.DATABASE_URL,
    });

    try {
      const result = await pool.query('SELECT NOW()');
      return new Response(
        JSON.stringify({ time: result.rows[0] })
      );
    } finally {
      await pool.end();
    }
  },
};`}
          />
        </section>

        {/* Serverless Platforms */}
        <section>
          <h3 className="text-xl font-bold text-foreground mb-4">Other Serverless Platforms (Netlify, Deno Deploy)</h3>
          <p className="text-muted-foreground mb-4">
            For serverless platforms without persistent connections, use the Neon serverless driver. It connects over HTTP or WebSocket, reducing connection setup latency.
          </p>

          <div className="space-y-4 mb-6">
            <h4 className="font-semibold text-foreground">Transport Options:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4 border-green-200 bg-green-50">
                <h5 className="font-semibold text-foreground mb-2">HTTP</h5>
                <p className="text-sm text-muted-foreground">
                  Use for single queries and non-interactive transactions. Faster for independent queries.
                </p>
              </Card>
              <Card className="p-4 border-blue-200 bg-blue-50">
                <h5 className="font-semibold text-foreground mb-2">WebSocket</h5>
                <p className="text-sm text-muted-foreground">
                  Use for interactive transactions and pg compatibility. Maintains persistent connections within a request.
                </p>
              </Card>
            </div>
          </div>

          <CodeExampleBlock
            title="Neon Serverless Driver (HTTP)"
            description="Lightweight HTTP connections for serverless"
            code={`import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  try {
    const result = await sql\`SELECT * FROM users WHERE id = \${1}\`;
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}`}
          />

          <CodeExampleBlock
            title="Neon Serverless Driver (WebSocket)"
            description="WebSocket for interactive transactions"
            code={`import { Pool } from '@neondatabase/serverless';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default async function handler(req, res) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('UPDATE users SET active = true WHERE id = 1');
    await client.query('COMMIT');
    res.json({ success: true });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
}`}
          />
        </section>

        {/* ORM Support */}
        <section>
          <h3 className="text-xl font-bold text-foreground mb-4">ORM Support</h3>
          <p className="text-muted-foreground mb-4">
            Popular JavaScript ORMs work with all Neon connection methods:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: 'Drizzle', drivers: ['pg', 'postgres.js', '@neondatabase/serverless'] },
              { name: 'Kysely', drivers: ['pg', 'postgres.js', '@neondatabase/serverless'] },
              { name: 'Prisma', drivers: ['pg', '@neondatabase/serverless'] },
              { name: 'TypeORM', drivers: ['pg'] },
            ].map((orm) => (
              <Card key={orm.name} className="p-4">
                <h5 className="font-semibold text-foreground mb-2">{orm.name}</h5>
                <div className="space-y-1">
                  {orm.drivers.map((driver) => (
                    <div key={driver} className="text-sm text-muted-foreground">
                      • {driver}
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Connection String */}
        <section>
          <h3 className="text-xl font-bold text-foreground mb-4">Getting Your Connection String</h3>
          <p className="text-muted-foreground mb-4">
            You can find your connection string in the Neon Console under your project settings.
          </p>
          <Card className="p-4 border-amber-200 bg-amber-50">
            <p className="text-sm text-foreground">
              <strong>Remember:</strong> For pooled connections (recommended), use the string with <code className="bg-white px-2 py-1 rounded text-xs">-pooler</code> in the hostname. For operations requiring direct connections (migrations, schema changes), use the standard connection string.
            </p>
          </Card>
        </section>
      </div>
    </GuideLayout>
  )
}
