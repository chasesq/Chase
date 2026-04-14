import { GuideLayout } from '@/components/guides/guide-layout'
import { GuideNavigation } from '@/components/guides/guide-navigation'
import { CodeExampleBlock } from '@/components/guides/code-example-block'
import { Card } from '@/components/ui/card'

export const metadata = {
  title: 'Client-Side Applications Guide | Neon Guides',
  description: 'Learn how to build browser-based apps with direct database access using Neon Data API.',
}

export default function ClientSidePage() {
  return (
    <GuideLayout
      title="Client-Side Applications"
      description="Build browser-based apps with direct database access using Neon Data API."
      breadcrumbs={[
        { label: 'Neon Connection Guide', href: '/guides/neon-connection-guide' },
        { label: 'Client-Side Applications' },
      ]}
      sidebar={<GuideNavigation />}
    >
      <div className="space-y-8">
        {/* Introduction */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">Overview</h2>
          <p className="text-muted-foreground mb-4">
            Browsers cannot open TCP connections to PostgreSQL. The Neon Data API provides a secure REST interface to your database over HTTP with built-in Row-Level Security (RLS) support. This allows you to query your database directly from the browser without a backend server.
          </p>
          <Card className="p-4 border-blue-200 bg-blue-50">
            <p className="text-sm text-foreground">
              <strong>Note:</strong> The Neon Data API is currently in beta. Check the official documentation for the latest status and features.
            </p>
          </Card>
        </section>

        {/* What is the Data API */}
        <section>
          <h3 className="text-xl font-bold text-foreground mb-4">What is the Neon Data API?</h3>
          <p className="text-muted-foreground mb-4">
            The Data API provides:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <h4 className="font-semibold text-foreground mb-2">REST Interface</h4>
              <p className="text-sm text-muted-foreground">
                Query your database using standard HTTP requests instead of TCP connections.
              </p>
            </Card>
            <Card className="p-4">
              <h4 className="font-semibold text-foreground mb-2">Row-Level Security</h4>
              <p className="text-sm text-muted-foreground">
                PostgreSQL RLS policies control which rows each user can access based on JWT claims.
              </p>
            </Card>
            <Card className="p-4">
              <h4 className="font-semibold text-foreground mb-2">JWT Authentication</h4>
              <p className="text-sm text-muted-foreground">
                Use JWT tokens from any authentication provider to control database access.
              </p>
            </Card>
            <Card className="p-4">
              <h4 className="font-semibold text-foreground mb-2">Browser-Compatible</h4>
              <p className="text-sm text-muted-foreground">
                Works in any JavaScript environment, including browsers and Node.js.
              </p>
            </Card>
          </div>
        </section>

        {/* Setup */}
        <section>
          <h3 className="text-xl font-bold text-foreground mb-4">Getting Started</h3>
          <p className="text-muted-foreground mb-4">
            To use the Neon Data API, you need to enable it in your Neon project settings.
          </p>

          <ol className="space-y-3 list-decimal list-inside text-muted-foreground mb-6">
            <li>Go to your Neon project settings</li>
            <li>Enable the Data API feature</li>
            <li>Get your API key from the Data API settings</li>
            <li>Configure Row-Level Security policies in your database</li>
            <li>Use the JavaScript SDK or direct HTTP calls to query</li>
          </ol>
        </section>

        {/* JavaScript SDK */}
        <section>
          <h3 className="text-xl font-bold text-foreground mb-4">Using the JavaScript SDK</h3>
          <p className="text-muted-foreground mb-4">
            The @neondatabase/neon-js SDK provides a convenient interface for Data API queries.
          </p>

          <CodeExampleBlock
            title="Basic Query"
            description="Simple SELECT query"
            code={`import { neon } from '@neondatabase/neon-js';

const sql = neon('https://your-api-endpoint.neon.tech/api/query');

// Query without authentication
const users = await sql('SELECT id, name FROM users LIMIT 10');
console.log(users);`}
          />

          <CodeExampleBlock
            title="Query with Parameters"
            description="Safe parameter binding"
            code={`import { neon } from '@neondatabase/neon-js';

const sql = neon(process.env.NEON_API_URL);

// Use parameters to prevent SQL injection
const userId = 123;
const user = await sql(
  'SELECT id, name, email FROM users WHERE id = $1',
  [userId]
);
console.log(user);`}
          />

          <CodeExampleBlock
            title="With JWT Authentication"
            description="Using Row-Level Security"
            code={`import { neon } from '@neondatabase/neon-js';

const sql = neon(
  process.env.NEON_API_URL,
  {
    authToken: process.env.JWT_TOKEN,
  }
);

// Queries are limited by RLS policies
// User can only see their own data
const myData = await sql(
  'SELECT * FROM user_documents WHERE user_id = auth.uid()'
);`}
          />
        </section>

        {/* Direct HTTP API */}
        <section>
          <h3 className="text-xl font-bold text-foreground mb-4">Direct HTTP API</h3>
          <p className="text-muted-foreground mb-4">
            If you prefer not to use the SDK, you can make direct HTTP requests to the Data API.
          </p>

          <CodeExampleBlock
            title="HTTP Request"
            description="Direct API call with fetch"
            code={`const response = await fetch(
  'https://your-api-endpoint.neon.tech/api/query',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${process.env.JWT_TOKEN}\`,
    },
    body: JSON.stringify({
      query: 'SELECT id, name FROM users WHERE id = $1',
      params: [123],
    }),
  }
);

const result = await response.json();
console.log(result);`}
          />
        </section>

        {/* Row-Level Security */}
        <section>
          <h3 className="text-xl font-bold text-foreground mb-4">Row-Level Security (RLS)</h3>
          <p className="text-muted-foreground mb-4">
            PostgreSQL RLS ensures users can only access data they&apos;re authorized to see. The Data API integrates with RLS by passing JWT claims to the database.
          </p>

          <h4 className="font-semibold text-foreground mb-3">Setting up RLS</h4>
          <CodeExampleBlock
            title="RLS Policy Setup"
            description="SQL example for user-specific data"
            code={`-- Enable RLS on the users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create a policy that only allows users to see their own data
CREATE POLICY user_isolation ON users
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- The 'auth.uid()' function gets the user ID from the JWT token`}
          />

          <h4 className="font-semibold text-foreground mb-3 mt-6">JWT Token Requirements</h4>
          <p className="text-muted-foreground mb-4">
            Your JWT token should include user information that RLS policies can use:
          </p>
          <CodeExampleBlock
            title="JWT Payload Example"
            description="User information in JWT claims"
            code={`{
  "iss": "https://your-auth-provider.com",
  "sub": "user_123",
  "aud": "neon",
  "iat": 1234567890,
  "exp": 1234571490,
  "email": "user@example.com",
  "app_metadata": {
    "roles": ["user"]
  }
}`}
          />
        </section>

        {/* React Integration */}
        <section>
          <h3 className="text-xl font-bold text-foreground mb-4">React Integration</h3>
          <p className="text-muted-foreground mb-4">
            Use the Data API with React hooks for data fetching.
          </p>

          <CodeExampleBlock
            title="React Hook Example"
            description="Custom hook for Data API queries"
            code={`import { useState, useEffect } from 'react';
import { neon } from '@neondatabase/neon-js';

function useNeonQuery(query, params = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sql = neon(process.env.REACT_APP_NEON_URL, {
          authToken: localStorage.getItem('jwtToken'),
        });
        const result = await sql(query, params);
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [query, params]);

  return { data, loading, error };
}

// Usage
export function UsersList() {
  const { data: users, loading, error } = useNeonQuery(
    'SELECT id, name FROM users'
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {users?.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}`}
          />
        </section>

        {/* Security Considerations */}
        <section>
          <h3 className="text-xl font-bold text-foreground mb-4">Security Considerations</h3>
          <div className="space-y-4">
            <Card className="p-4 border-red-200 bg-red-50">
              <h4 className="font-semibold text-foreground mb-2">Never Expose Credentials</h4>
              <p className="text-sm text-muted-foreground">
                Store API keys and JWT tokens securely. Never commit them to version control.
              </p>
            </Card>
            <Card className="p-4 border-yellow-200 bg-yellow-50">
              <h4 className="font-semibold text-foreground mb-2">Use JWT Tokens</h4>
              <p className="text-sm text-muted-foreground">
                Always authenticate with JWT tokens to leverage Row-Level Security policies.
              </p>
            </Card>
            <Card className="p-4 border-blue-200 bg-blue-50">
              <h4 className="font-semibold text-foreground mb-2">Validate RLS Policies</h4>
              <p className="text-sm text-muted-foreground">
                Ensure your RLS policies correctly restrict data access based on user identity.
              </p>
            </Card>
            <Card className="p-4 border-green-200 bg-green-50">
              <h4 className="font-semibold text-foreground mb-2">HTTPS Only</h4>
              <p className="text-sm text-muted-foreground">
                Always use HTTPS when making Data API calls. Never use HTTP in production.
              </p>
            </Card>
          </div>
        </section>

        {/* Limitations */}
        <section>
          <h3 className="text-xl font-bold text-foreground mb-4">Current Limitations</h3>
          <ul className="space-y-2 list-disc list-inside text-muted-foreground">
            <li>Beta feature - API may change</li>
            <li>No DDL operations (CREATE, ALTER, DROP)</li>
            <li>Limited to single statement per request</li>
            <li>No transaction support</li>
            <li>Maximum response size limits</li>
          </ul>
        </section>
      </div>
    </GuideLayout>
  )
}
