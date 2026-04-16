import { ScenarioCard } from '@/components/guides/scenario-card'
import { GuideLayout } from '@/components/guides/guide-layout'
import { GuideNavigation } from '@/components/guides/guide-navigation'
import { Code, Shield, Zap, Globe } from 'lucide-react'

export const metadata = {
  title: 'Neon Connection Guide | Enterprise Financial System',
  description: 'Comprehensive guide to choosing the right connection method and authentication strategy for Neon.',
}

export default function NeonConnectionGuidePage() {
  const scenarios = [
    {
      title: 'JavaScript & TypeScript',
      description: 'Learn how to connect from Node.js applications, Vercel, Cloudflare, and other JS/TS environments.',
      href: '/guides/neon-connection-guide/scenarios/javascript-typescript',
      icon: '📦',
      features: ['node-postgres', '@neondatabase/serverless', 'Connection pooling'],
    },
    {
      title: 'Other Languages',
      description: 'Connect from Python, Go, Rust, Java, PHP, and other programming languages.',
      href: '/guides/neon-connection-guide/scenarios/other-languages',
      icon: '🔧',
      features: ['Native PostgreSQL drivers', 'Pooled connections', 'Language-specific guides'],
    },
    {
      title: 'Serverless Platforms',
      description: 'Deploy on Netlify, Deno Deploy, Cloudflare Workers, and other serverless platforms.',
      href: '/guides/neon-connection-guide/scenarios/serverless',
      icon: '⚡',
      features: ['HTTP transport', 'WebSocket support', 'Fast connection setup'],
    },
    {
      title: 'Client-Side Applications',
      description: 'Build browser-based apps with direct database access using Neon Data API.',
      href: '/guides/neon-connection-guide/scenarios/client-side',
      icon: '🌐',
      features: ['Row-Level Security', 'HTTP API', 'JWT authentication'],
    },
  ]

  const authTopics = [
    {
      title: 'Authentication Overview',
      description: 'Understand Neon Auth and how to integrate managed authentication.',
      href: '/guides/neon-connection-guide/authentication/overview',
    },
    {
      title: 'Authentication Flow',
      description: 'Complete walkthrough of sign-up, sign-in, and session management processes.',
      href: '/guides/neon-connection-guide/authentication/flow',
    },
    {
      title: 'Branching & Authentication',
      description: 'How to use database branches with authentication systems.',
      href: '/guides/neon-connection-guide/authentication/branching',
    },
  ]

  return (
    <GuideLayout
      title="Neon Connection Guide"
      description="Choose the right connection method and authentication strategy for your deployment platform."
      breadcrumbs={[
        { label: 'Neon Connection Guide' },
      ]}
      sidebar={<GuideNavigation />}
    >
      <div className="space-y-12">
        {/* Introduction */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">Getting Started</h2>
          <p className="text-muted-foreground mb-4">
            Your connection method depends on where your code runs. This guide helps you choose the right driver and connection type for your specific deployment platform.
          </p>
          <p className="text-muted-foreground">
            Whether you&apos;re using JavaScript, Python, Go, or any other language, you&apos;ll find detailed guidance on pooled vs. direct connections, HTTP vs. WebSocket transport, and platform-specific considerations.
          </p>
        </section>

        {/* Connection Scenarios */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">Connection Scenarios</h2>
          <p className="text-muted-foreground mb-8">
            Select your deployment platform to see recommended drivers and connection strategies.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {scenarios.map((scenario) => (
              <ScenarioCard key={scenario.href} {...scenario} />
            ))}
          </div>
        </section>

        {/* Authentication */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">Authentication</h2>
          <p className="text-muted-foreground mb-8">
            Understand how to implement secure authentication with Neon.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {authTopics.map((topic) => (
              <a
                key={topic.href}
                href={topic.href}
                className="block p-6 border border-border rounded-lg hover:border-primary hover:shadow-lg transition-all"
              >
                <h3 className="font-semibold text-foreground mb-2">{topic.title}</h3>
                <p className="text-sm text-muted-foreground">{topic.description}</p>
              </a>
            ))}
          </div>
        </section>

        {/* Key Concepts */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">Key Concepts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 border border-border rounded-lg">
              <div className="flex items-start gap-4">
                <Code className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Pooled vs. Direct Connections</h3>
                  <p className="text-sm text-muted-foreground">
                    Understand when to use connection pooling through PgBouncer and when direct connections are needed for specific operations.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 border border-border rounded-lg">
              <div className="flex items-start gap-4">
                <Zap className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground mb-2">HTTP vs. WebSocket</h3>
                  <p className="text-sm text-muted-foreground">
                    Learn about different transport options in the Neon serverless driver for serverless and edge environments.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 border border-border rounded-lg">
              <div className="flex items-start gap-4">
                <Shield className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Row-Level Security</h3>
                  <p className="text-sm text-muted-foreground">
                    Implement fine-grained access control directly in your database with PostgreSQL RLS policies.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 border border-border rounded-lg">
              <div className="flex items-start gap-4">
                <Globe className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Data API</h3>
                  <p className="text-sm text-muted-foreground">
                    Use a REST interface to query your database from browsers and edge runtimes securely.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tools */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">Tools & Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <a
              href="/guides/neon-connection-guide/tools/pooling"
              className="block p-6 border border-border rounded-lg hover:border-primary hover:shadow-lg transition-all"
            >
              <h3 className="font-semibold text-foreground mb-2">Connection Pooling</h3>
              <p className="text-sm text-muted-foreground">
                Detailed guide on pooled vs. direct connections and how to configure pooling.
              </p>
            </a>
            <a
              href="/guides/neon-connection-guide/tools/psql"
              className="block p-6 border border-border rounded-lg hover:border-primary hover:shadow-lg transition-all"
            >
              <h3 className="font-semibold text-foreground mb-2">psql Guide</h3>
              <p className="text-sm text-muted-foreground">
                Learn how to use the PostgreSQL command-line tool to connect to Neon.
              </p>
            </a>
          </div>
        </section>
      </div>
    </GuideLayout>
  )
}
