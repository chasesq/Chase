import { GuideLayout } from '@/components/guides/guide-layout'
import { GuideNavigation } from '@/components/guides/guide-navigation'
import { CodeExampleBlock } from '@/components/guides/code-example-block'
import { Card } from '@/components/ui/card'
import { Shield, Lock, Database, AlertCircle } from 'lucide-react'

export const metadata = {
  title: 'Client-Side Connection Guide | Neon Guides',
  description: 'Learn about safe patterns for database access from the browser using backend APIs and other secure approaches.',
}

export default function ClientSidePage() {
  return (
    <GuideLayout
      title="Client-Side Database Access"
      description="Best practices for accessing Neon from the browser safely."
      breadcrumbs={[
        { label: 'Neon Connection Guide', href: '/guides/neon-connection-guide' },
        { label: 'Scenarios', href: '/guides/neon-connection-guide/scenarios/overview' },
        { label: 'Client-Side' },
      ]}
      sidebar={<GuideNavigation />}
    >
      <div className="space-y-8">
        {/* Introduction */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">Client-Side Database Access</h2>
          <p className="text-muted-foreground mb-4">
            Connecting directly to your PostgreSQL database from the browser is powerful but requires careful security considerations. Never expose your database credentials in client-side code.
          </p>
          <p className="text-muted-foreground">
            This guide covers safe patterns for accessing your Neon database from the browser while protecting your data.
          </p>
        </section>

        {/* Critical Security Warning */}
        <section>
          <Card className="p-6 border-red-300 bg-red-50 border-2">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-red-900 mb-2">Critical Security Warning</h3>
                <p className="text-red-900 mb-3">
                  <strong>Never expose your database credentials in client-side code.</strong> Your database password would be visible in the browser and network requests, allowing anyone to access or modify your data.
                </p>
                <div className="bg-white p-3 rounded border border-red-200 text-sm text-red-900 font-mono">
                  ❌ UNSAFE: const conn = psycopg.connect(env.DATABASE_URL); // visible in browser!
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Recommended Approaches */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">Safe Patterns for Client-Side Access</h2>

          {/* Pattern 1: Backend API */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-foreground mb-4">Pattern 1: Backend API (Recommended)</h3>
            <p className="text-muted-foreground mb-4">
              The most secure approach: Your client calls a backend API, which connects to the database on the server.
            </p>

            <div className="bg-muted p-6 rounded-lg mb-4">
              <div className="space-y-3 text-sm text-foreground">
                <div>Browser (Client)</div>
                <div className="text-center">↓ HTTP Request</div>
                <div>API Server (Backend)</div>
                <div className="text-center">↓ Secure Database Connection</div>
                <div>Neon Database</div>
              </div>
            </div>

            <CodeExampleBlock
              title="Backend API Endpoint"
              description="Next.js API Route connecting to Neon"
              code={`// app/api/users/route.ts
import { sql } from '@neondatabase/serverless';

export async function GET(request: Request) {
  // Database connection happens server-side only
  const users = await sql\`SELECT id, name, email FROM users\`;
  
  return Response.json(users);
}

// Frontend can safely call this endpoint
// const response = await fetch('/api/users');
// const users = await response.json();`}
            />

            <Card className="p-4 border-green-200 bg-green-50">
              <h4 className="font-semibold text-foreground mb-2">✓ Advantages</h4>
              <ul className="space-y-1 text-sm text-foreground">
                <li>• Database credentials never leave the server</li>
                <li>• Full control over queries</li>
                <li>• Can implement authentication and authorization</li>
                <li>• Database logic centralized and versioned</li>
              </ul>
            </Card>
          </div>

          {/* Pattern 2: Supabase */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-foreground mb-4">Pattern 2: Supabase PostgREST API</h3>
            <p className="text-muted-foreground mb-4">
              Supabase provides a secure REST API layer on top of PostgreSQL. It handles authentication and Row-Level Security automatically.
            </p>

            <CodeExampleBlock
              title="Supabase Client-Side Access"
              description="Secure database queries from the browser"
              code={`// Install supabase client
// npm install @supabase/supabase-js

import { createClient } from '@supabase/supabase-js';

// Supabase credentials (anon key is safe to expose)
const supabase = createClient(
  'https://your-project.supabase.co',
  'your-anon-key' // This is safe - it's scoped by RLS policies
);

// Query database from browser
const { data: users } = await supabase
  .from('users')
  .select('id, name, email')
  .eq('status', 'active');`}
            />

            <Card className="p-4 border-green-200 bg-green-50">
              <h4 className="font-semibold text-foreground mb-2">✓ Advantages</h4>
              <ul className="space-y-1 text-sm text-foreground">
                <li>• Row-Level Security (RLS) enforces data access</li>
                <li>• Real-time subscriptions available</li>
                <li>• Automatic authentication integration</li>
                <li>• Built for direct client access</li>
              </ul>
            </Card>

            <Card className="p-4 border-amber-200 bg-amber-50 mt-4">
              <h4 className="font-semibold text-foreground mb-2">⚠ Important: RLS is Essential</h4>
              <p className="text-sm text-foreground">
                When using Supabase with client-side access, <strong>Row-Level Security policies are mandatory</strong>. Without RLS, any authenticated user could query any data. RLS ensures users can only access their own data.
              </p>
            </Card>
          </div>

          {/* Pattern 3: GraphQL */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-foreground mb-4">Pattern 3: GraphQL API</h3>
            <p className="text-muted-foreground mb-4">
              GraphQL provides a queryable interface to your database while controlling what clients can access.
            </p>

            <CodeExampleBlock
              title="GraphQL Query from Browser"
              description="Type-safe database queries"
              code={`// Frontend with Apollo or urql client
import { gql, useQuery } from '@apollo/client';

const GET_USERS = gql\`
  query GetUsers {
    users {
      id
      name
      email
    }
  }
\`;

function UserList() {
  const { data, loading } = useQuery(GET_USERS);
  
  return (
    <ul>
      {data?.users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}`}
            />

            <Card className="p-4 border-green-200 bg-green-50">
              <h4 className="font-semibold text-foreground mb-2">✓ Advantages</h4>
              <ul className="space-y-1 text-sm text-foreground">
                <li>• Only fetch fields you need</li>
                <li>• Schema documentation built-in</li>
                <li>• Type safety with code generation</li>
                <li>• Powerful for complex data relationships</li>
              </ul>
            </Card>
          </div>
        </section>

        {/* Row-Level Security */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">Row-Level Security (RLS)</h2>
          <p className="text-muted-foreground mb-4">
            If allowing client-side database access (Supabase, PostgREST), Row-Level Security is essential. RLS ensures users can only access data they own.
          </p>

          <CodeExampleBlock
            title="RLS Policy Example"
            description="Ensure users can only see their own data"
            code={`-- Enable RLS on the users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create a policy: users can only see their own row
CREATE POLICY "Users can see their own data"
  ON users
  FOR SELECT
  USING (id = auth.uid());

-- Create a policy: users can only update their own data
CREATE POLICY "Users can update their own data"
  ON users
  FOR UPDATE
  USING (id = auth.uid());

-- Create a policy: users cannot delete their own data
-- (if you want to prevent deletions entirely)
CREATE POLICY "No deletions"
  ON users
  FOR DELETE
  USING (FALSE);`}
          />

          <Card className="p-4 border-blue-200 bg-blue-50 mt-4">
            <h4 className="font-semibold text-foreground mb-2">How RLS Works</h4>
            <ol className="space-y-2 text-sm text-foreground">
              <li>1. Client authenticates with your app (gets JWT)</li>
              <li>2. Client calls database API with JWT token</li>
              <li>3. RLS policies check: is this user allowed to see this row?</li>
              <li>4. Database returns only authorized rows</li>
            </ol>
          </Card>
        </section>

        {/* Why Not Direct TCP */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">Why Not Direct TCP?</h2>
          <p className="text-muted-foreground mb-4">
            You might think: "Can&apos;t I just open a TCP connection to Neon from the browser?" The answer is: technically possible with libraries like PGlite, but not recommended for production.
          </p>

          <div className="space-y-4">
            <Card className="p-4 border-red-200 bg-red-50">
              <h4 className="font-semibold text-foreground mb-2">❌ Security Issues</h4>
              <ul className="space-y-1 text-sm text-foreground">
                <li>• Password must be embedded in client code</li>
                <li>• Every client creates a new connection (resource waste)</li>
                <li>• All queries visible in browser DevTools</li>
                <li>• No way to enforce fine-grained permissions</li>
              </ul>
            </Card>

            <Card className="p-4 border-amber-200 bg-amber-50">
              <h4 className="font-semibold text-foreground mb-2">⚠ Technical Issues</h4>
              <ul className="space-y-1 text-sm text-foreground">
                <li>• Browsers can&apos;t make raw TCP connections (security restriction)</li>
                <li>• WebSocket-to-TCP proxies add latency</li>
                <li>• Connection limits quickly exceeded</li>
              </ul>
            </Card>
          </div>
        </section>

        {/* Real-Time Updates */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">Real-Time Updates</h2>
          <p className="text-muted-foreground mb-4">
            Need real-time updates when data changes? Here are safe approaches:
          </p>

          <h3 className="text-lg font-bold text-foreground mb-4">Option 1: Polling</h3>
          <CodeExampleBlock
            title="Simple Polling"
            code={`// Poll server for updates every 5 seconds
useEffect(() => {
  const interval = setInterval(() => {
    fetch('/api/users')
      .then(r => r.json())
      .then(data => setUsers(data));
  }, 5000);
  
  return () => clearInterval(interval);
}, []);`}
          />

          <h3 className="text-lg font-bold text-foreground mb-4 mt-6">Option 2: WebSockets</h3>
          <CodeExampleBlock
            title="WebSocket for Real-Time"
            code={`// Backend sends updates via WebSocket
io.on('connection', (socket) => {
  // When database changes, notify all clients
  subscribeToChanges(async () => {
    const users = await getUsers();
    socket.emit('users:updated', users);
  });
});

// Frontend listens for updates
socket.on('users:updated', (users) => {
  setUsers(users);
});`}
          />

          <h3 className="text-lg font-bold text-foreground mb-4 mt-6">Option 3: Supabase Realtime</h3>
          <CodeExampleBlock
            title="Supabase Real-Time Subscriptions"
            code={`// Subscribe to changes on a table
const subscription = supabase
  .from('users')
  .on('*', payload => {
    console.log('Change received!', payload);
    setUsers([...users, payload.new]);
  })
  .subscribe();

// Cleanup on unmount
return () => subscription.unsubscribe();`}
          />
        </section>

        {/* Best Practices */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">Client-Side Best Practices</h2>
          <div className="space-y-4">
            <Card className="p-4 border-blue-200 bg-blue-50">
              <h4 className="font-semibold text-foreground mb-2">1. Always Use HTTPS</h4>
              <p className="text-sm text-foreground">
                Credentials and data must be encrypted in transit. Never use HTTP.
              </p>
            </Card>

            <Card className="p-4 border-green-200 bg-green-50">
              <h4 className="font-semibold text-foreground mb-2">2. Keep Secrets Server-Side</h4>
              <p className="text-sm text-foreground">
                Database password, API keys, and secrets never belong in browser-accessible code.
              </p>
            </Card>

            <Card className="p-4 border-purple-200 bg-purple-50">
              <h4 className="font-semibold text-foreground mb-2">3. Use RLS for Direct Client Access</h4>
              <p className="text-sm text-foreground">
                If using Supabase or PostgREST, enable RLS policies on all tables to enforce data access control.
              </p>
            </Card>

            <Card className="p-4 border-amber-200 bg-amber-50">
              <h4 className="font-semibold text-foreground mb-2">4. Validate on Backend</h4>
              <p className="text-sm text-foreground">
                Never trust data validation done only on the client. Always validate server-side.
              </p>
            </Card>

            <Card className="p-4 border-red-200 bg-red-50">
              <h4 className="font-semibold text-foreground mb-2">5. Rate Limit Client Requests</h4>
              <p className="text-sm text-foreground">
                Implement rate limiting to prevent abuse or accidental data exposure from rogue client code.
              </p>
            </Card>
          </div>
        </section>

        {/* Comparison Table */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">Approach Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 font-semibold text-foreground">Approach</th>
                  <th className="text-left p-3 font-semibold text-foreground">Security</th>
                  <th className="text-left p-3 font-semibold text-foreground">Complexity</th>
                  <th className="text-left p-3 font-semibold text-foreground">Best For</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="p-3 text-foreground font-semibold">Backend API</td>
                  <td className="p-3 text-green-700">Excellent</td>
                  <td className="p-3 text-amber-700">Medium</td>
                  <td className="p-3 text-foreground">Most applications</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-3 text-foreground font-semibold">Supabase + RLS</td>
                  <td className="p-3 text-green-700">Excellent</td>
                  <td className="p-3 text-blue-700">Low</td>
                  <td className="p-3 text-foreground">Real-time apps, rapid development</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-3 text-foreground font-semibold">GraphQL API</td>
                  <td className="p-3 text-green-700">Excellent</td>
                  <td className="p-3 text-red-700">High</td>
                  <td className="p-3 text-foreground">Complex data queries</td>
                </tr>
                <tr>
                  <td className="p-3 text-foreground font-semibold">Direct TCP</td>
                  <td className="p-3 text-red-700">Poor</td>
                  <td className="p-3 text-blue-700">Low</td>
                  <td className="p-3 text-foreground">Never for production</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Recommendation */}
        <section>
          <Card className="p-6 border-blue-200 bg-blue-50">
            <h3 className="text-lg font-bold text-foreground mb-3">Recommended Approach</h3>
            <p className="text-foreground mb-4">
              <strong>For most applications: Use a Backend API</strong> (Next.js, Express, Fastify, etc.)
            </p>
            <p className="text-foreground mb-4">
              This gives you:
            </p>
            <ul className="space-y-1 text-sm text-foreground">
              <li>✓ Maximum security (credentials stay on server)</li>
              <li>✓ Full control over queries and business logic</li>
              <li>✓ Easy to implement authentication and authorization</li>
              <li>✓ Simple to cache and optimize</li>
            </ul>
          </Card>
        </section>
      </div>
    </GuideLayout>
  )
}
