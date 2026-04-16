import { GuideLayout } from '@/components/guides/guide-layout'
import { GuideNavigation } from '@/components/guides/guide-navigation'
import { CodeExampleBlock } from '@/components/guides/code-example-block'
import { Card } from '@/components/ui/card'

export const metadata = {
  title: 'Serverless Platforms Connection Guide | Neon Guides',
  description: 'Learn how to connect to Neon from Netlify, Deno Deploy, Cloudflare Workers, and other serverless platforms.',
}

export default function ServerlessPage() {
  return (
    <GuideLayout
      title="Serverless Platforms"
      description="Deploy on Netlify, Deno Deploy, Cloudflare Workers, and other serverless platforms."
      breadcrumbs={[
        { label: 'Neon Connection Guide', href: '/guides/neon-connection-guide' },
        { label: 'Serverless Platforms' },
      ]}
      sidebar={<GuideNavigation />}
    >
      <div className="space-y-8">
        {/* Introduction */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">Overview</h2>
          <p className="text-muted-foreground mb-4">
            Serverless platforms cannot maintain persistent TCP connections across requests. Use the Neon serverless driver with HTTP or WebSocket transport for optimal performance and reliability.
          </p>
        </section>

        {/* HTTP vs WebSocket */}
        <section>
          <h3 className="text-xl font-bold text-foreground mb-4">HTTP vs. WebSocket</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card className="p-4 border-green-200 bg-green-50">
              <h4 className="font-semibold text-foreground mb-2">HTTP Transport</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Uses HTTP/HTTPS requests for each query.
              </p>
              <div className="space-y-1 text-xs text-muted-foreground mb-3">
                <p><strong>Best for:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Single, independent queries</li>
                  <li>Non-interactive transactions</li>
                  <li>Minimal latency on cold starts</li>
                </ul>
              </div>
              <p className="text-xs text-muted-foreground font-mono bg-white px-2 py-1 rounded">
                ~3 round trips total
              </p>
            </Card>

            <Card className="p-4 border-blue-200 bg-blue-50">
              <h4 className="font-semibold text-foreground mb-2">WebSocket Transport</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Maintains a persistent WebSocket connection.
              </p>
              <div className="space-y-1 text-xs text-muted-foreground mb-3">
                <p><strong>Best for:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Interactive transactions</li>
                  <li>pg/postgres.js compatibility</li>
                  <li>Prepared statements</li>
                </ul>
              </div>
              <p className="text-xs text-muted-foreground font-mono bg-white px-2 py-1 rounded">
                ~8 round trips total
              </p>
            </Card>
          </div>
        </section>

        {/* Netlify Functions */}
        <section>
          <h3 className="text-xl font-bold text-foreground mb-4">Netlify Functions</h3>
          <p className="text-muted-foreground mb-4">
            Use the Neon serverless driver in Netlify Functions for fast, serverless database connections.
          </p>

          <CodeExampleBlock
            title="Netlify Function (HTTP)"
            description="Using Neon HTTP transport"
            code={`import { neon } from '@neondatabase/serverless';

export default async (req, context) => {
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    const result = await sql\`
      SELECT * FROM posts 
      WHERE id = \${req.url.split('/').pop()}
    \`;
    
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};`}
          />

          <CodeExampleBlock
            title="Netlify Function (WebSocket)"
            description="For interactive transactions"
            code={`import { Pool } from '@neondatabase/serverless';
import ws from 'ws';

globalThis.WebSocket = ws;

export default async (req, context) => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Execute multiple queries in transaction
    await client.query('UPDATE posts SET views = views + 1 WHERE id = $1', [1]);
    await client.query('INSERT INTO analytics (action) VALUES ($1)', ['view']);
    
    await client.query('COMMIT');
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  } finally {
    client.release();
    await pool.end();
  }
};`}
          />
        </section>

        {/* Deno Deploy */}
        <section>
          <h3 className="text-xl font-bold text-foreground mb-4">Deno Deploy</h3>
          <p className="text-muted-foreground mb-4">
            Deploy Deno functions with Neon database access using the serverless driver.
          </p>

          <CodeExampleBlock
            title="Deno Deploy Function"
            description="Using Neon with Deno"
            code={`import { serve } from "https://deno.land/std@0.140.0/http/server.ts";
import { neon } from "npm:@neondatabase/serverless";

serve(async (req) => {
  const sql = neon(Deno.env.get("DATABASE_URL"));
  
  try {
    const result = await sql\`
      SELECT id, title, created_at 
      FROM posts 
      ORDER BY created_at DESC 
      LIMIT 10
    \`;
    
    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});`}
          />
        </section>

        {/* Cloudflare Workers (without Hyperdrive) */}
        <section>
          <h3 className="text-xl font-bold text-foreground mb-4">Cloudflare Workers (HTTP Transport)</h3>
          <p className="text-muted-foreground mb-4">
            If you&apos;re not using Hyperdrive, use the serverless driver with HTTP transport.
          </p>

          <CodeExampleBlock
            title="Cloudflare Worker (HTTP)"
            description="Serverless driver with HTTP transport"
            code={`import { neon } from '@neondatabase/serverless';

export default {
  async fetch(request, env) {
    const sql = neon(env.DATABASE_URL);
    
    try {
      const result = await sql\`
        SELECT version() as version
      \`;
      
      return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  },
};`}
          />

          <Card className="p-4 border-blue-200 bg-blue-50 mt-4">
            <p className="text-sm text-foreground">
              <strong>Tip:</strong> For Cloudflare Workers with persistent pooling, use Hyperdrive instead. It provides connection pooling at the edge with TCP support.
            </p>
          </Card>
        </section>

        {/* AWS Lambda */}
        <section>
          <h3 className="text-xl font-bold text-foreground mb-4">AWS Lambda</h3>
          <p className="text-muted-foreground mb-4">
            Connect to Neon from Lambda functions using the serverless driver.
          </p>

          <CodeExampleBlock
            title="AWS Lambda with Node.js"
            description="Using Neon serverless driver"
            code={`import { neon } from '@neondatabase/serverless';

export const handler = async (event) => {
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    const result = await sql\`
      SELECT * FROM users 
      WHERE email = \${event.queryStringParameters?.email}
    \`;
    
    return {
      statusCode: 200,
      body: JSON.stringify(result),
      headers: { 'Content-Type': 'application/json' }
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
};`}
          />
        </section>

        {/* Cold Start Optimization */}
        <section>
          <h3 className="text-xl font-bold text-foreground mb-4">Cold Start Optimization</h3>
          <p className="text-muted-foreground mb-4">
            Cold starts are a key concern in serverless. Here&apos;s how to minimize them:
          </p>

          <Card className="p-4 border-blue-200 bg-blue-50 mb-4">
            <h4 className="font-semibold text-foreground mb-2">HTTP Transport is Faster</h4>
            <p className="text-sm text-foreground">
              HTTP requires fewer round trips than WebSocket. Use HTTP for simple operations on cold starts.
            </p>
          </Card>

          <Card className="p-4 border-green-200 bg-green-50 mb-4">
            <h4 className="font-semibold text-foreground mb-2">Bundle Size Matters</h4>
            <p className="text-sm text-foreground">
              Keep your dependencies minimal. The serverless driver is lightweight (~50KB), while full ORMs can be larger.
            </p>
          </Card>

          <Card className="p-4 border-amber-200 bg-amber-50">
            <h4 className="font-semibold text-foreground mb-2">Connection Caching</h4>
            <p className="text-sm text-foreground">
              Some serverless platforms keep functions warm between requests. You can cache initialized clients in module scope.
            </p>
          </Card>
        </section>

        {/* Connection Pooling for Serverless */}
        <section>
          <h3 className="text-xl font-bold text-foreground mb-4">Connection Pooling in Serverless</h3>
          <p className="text-muted-foreground mb-4">
            Traditional connection pooling doesn&apos;t work well in serverless because each function instance is ephemeral. Instead, use PgBouncer with Neon&apos;s pooled connection string.
          </p>

          <CodeExampleBlock
            title="Using Neon Pooled Connection"
            description="Leverage Neon's built-in PgBouncer pooling"
            code={`// Use the pooled connection string (includes -pooler)
const connectionString = process.env.DATABASE_URL;
// postgresql://....-pooler.us-east-2.aws.neon.tech/dbname

// This automatically routes through Neon's PgBouncer
// No need for client-side pooling in serverless
const result = await sql\`SELECT * FROM users WHERE id = \${userId}\`;`}
          />
        </section>

        {/* Monitoring and Debugging */}
        <section>
          <h3 className="text-xl font-bold text-foreground mb-4">Monitoring & Debugging</h3>
          <p className="text-muted-foreground mb-4">
            Debugging database issues in serverless is different from traditional apps. Here are strategies:
          </p>

          <div className="space-y-4">
            <Card className="p-4 border-blue-200 bg-blue-50">
              <h4 className="font-semibold text-foreground mb-2">Use Structured Logging</h4>
              <p className="text-sm text-foreground">
                Log queries with context so you can trace issues across requests.
              </p>
            </Card>

            <Card className="p-4 border-green-200 bg-green-50">
              <h4 className="font-semibold text-foreground mb-2">Monitor Query Performance</h4>
              <p className="text-sm text-foreground">
                Track slow queries. Serverless functions have timeout limits, so slow queries can cause failures.
              </p>
            </Card>

            <Card className="p-4 border-purple-200 bg-purple-50">
              <h4 className="font-semibold text-foreground mb-2">Check Neon Logs</h4>
              <p className="text-sm text-foreground">
                Use Neon Console to view database activity and error logs when debugging issues.
              </p>
            </Card>

            <Card className="p-4 border-amber-200 bg-amber-50">
              <h4 className="font-semibold text-foreground mb-2">Test Locally</h4>
              <p className="text-sm text-foreground">
                Always test serverless code locally with the same connection string before deploying.
              </p>
            </Card>
          </div>
        </section>

        {/* Best Practices */}
        <section>
          <h3 className="text-xl font-bold text-foreground mb-4">Serverless Best Practices</h3>
          <div className="space-y-4">
            <Card className="p-4 border-amber-200 bg-amber-50">
              <h4 className="font-semibold text-foreground mb-2">1. Connection Lifecycle</h4>
              <p className="text-sm text-muted-foreground">
                Create connections within the request handler and close them properly. Don&apos;t reuse connections across different requests.
              </p>
            </Card>
            <Card className="p-4 border-green-200 bg-green-50">
              <h4 className="font-semibold text-foreground mb-2">2. Choose the Right Transport</h4>
              <p className="text-sm text-muted-foreground">
                Use HTTP for single queries (faster cold starts), WebSocket for transactions (better for sequential operations).
              </p>
            </Card>
            <Card className="p-4 border-blue-200 bg-blue-50">
              <h4 className="font-semibold text-foreground mb-2">3. Error Handling</h4>
              <p className="text-sm text-muted-foreground">
                Always handle connection errors gracefully. Network issues are common in serverless environments.
              </p>
            </Card>
            <Card className="p-4 border-purple-200 bg-purple-50">
              <h4 className="font-semibold text-foreground mb-2">4. Environment Variables</h4>
              <p className="text-sm text-muted-foreground">
                Store your DATABASE_URL as a secure environment variable. Never commit credentials to version control.
              </p>
            </Card>
            <Card className="p-4 border-red-200 bg-red-50">
              <h4 className="font-semibold text-foreground mb-2">5. Timeout Management</h4>
              <p className="text-sm text-muted-foreground">
                Set database query timeouts below your serverless function timeout. Avoid queries that take minutes to complete.
              </p>
            </Card>
          </div>
        </section>
      </div>
    </GuideLayout>
  )
}
