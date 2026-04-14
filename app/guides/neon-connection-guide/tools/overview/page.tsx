import { GuideLayout } from '@/components/guides/guide-layout'
import { GuideNavigation } from '@/components/guides/guide-navigation'
import { Card } from '@/components/ui/card'
import { Terminal, Database, Zap, Code2 } from 'lucide-react'

export const metadata = {
  title: 'Neon Tools Overview | Neon Guides',
  description: 'Learn about tools for managing Neon databases including CLI, migrations, and SQL editors.',
}

export default function ToolsOverviewPage() {
  return (
    <GuideLayout
      title="Tools Overview"
      description="Essential tools for developing with Neon databases."
      breadcrumbs={[
        { label: 'Neon Connection Guide', href: '/guides/neon-connection-guide' },
        { label: 'Tools', href: '/guides/neon-connection-guide/tools/overview' },
        { label: 'Overview' },
      ]}
      sidebar={<GuideNavigation />}
    >
      <div className="space-y-8">
        {/* Introduction */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">Neon Tools Ecosystem</h2>
          <p className="text-muted-foreground mb-4">
            Neon provides several tools to help you develop, manage, and deploy your databases effectively. From the command line to web consoles, these tools integrate with your development workflow.
          </p>
        </section>

        {/* Core Tools */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">Core Tools</h2>

          <div className="space-y-4">
            <Card className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <Terminal className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Neon CLI</h3>
                  <p className="text-muted-foreground mb-4">
                    Command-line interface for managing Neon projects, branches, databases, and more from your terminal.
                  </p>
                  <div className="space-y-2 text-sm text-foreground">
                    <p><strong>Key Features:</strong></p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Create and manage database branches</li>
                      <li>Run migrations and SQL scripts</li>
                      <li>Manage database users and roles</li>
                      <li>Query databases directly</li>
                      <li>List projects and databases</li>
                    </ul>
                  </div>
                  <a 
                    href="/guides/neon-connection-guide/tools/cli"
                    className="inline-block mt-4 text-primary hover:underline font-semibold"
                  >
                    Learn about Neon CLI →
                  </a>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <Database className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Neon Console (Web Dashboard)</h3>
                  <p className="text-muted-foreground mb-4">
                    Web interface for managing your Neon account, projects, and databases without using the CLI.
                  </p>
                  <div className="space-y-2 text-sm text-foreground">
                    <p><strong>Available Features:</strong></p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Project and database management</li>
                      <li>Branch creation and management</li>
                      <li>SQL editor for running queries</li>
                      <li>Connection string retrieval</li>
                      <li>Usage and billing information</li>
                      <li>User and role management</li>
                    </ul>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    Access at <code className="bg-muted px-2 py-1 rounded text-xs">console.neon.tech</code>
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <Code2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Migration Tools</h3>
                  <p className="text-muted-foreground mb-4">
                    Framework-specific and standalone tools for managing database schema migrations safely.
                  </p>
                  <div className="space-y-2 text-sm text-foreground">
                    <p><strong>Supported Frameworks:</strong></p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Prisma - Type-safe ORM with migrations</li>
                      <li>Drizzle ORM - Lightweight migrations</li>
                      <li>Liquibase - Version control for database changes</li>
                      <li>Flyway - Database version control</li>
                      <li>Raw SQL migrations - For custom workflows</li>
                    </ul>
                  </div>
                  <a 
                    href="/guides/neon-connection-guide/tools/migrations"
                    className="inline-block mt-4 text-primary hover:underline font-semibold"
                  >
                    Learn about migrations →
                  </a>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <Zap className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Neon API</h3>
                  <p className="text-muted-foreground mb-4">
                    REST API for programmatic access to Neon resources. Perfect for automation and CI/CD pipelines.
                  </p>
                  <div className="space-y-2 text-sm text-foreground">
                    <p><strong>API Capabilities:</strong></p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Manage projects programmatically</li>
                      <li>Create branches via API</li>
                      <li>Retrieve connection strings</li>
                      <li>Manage compute units and scaling</li>
                      <li>Monitor database usage</li>
                    </ul>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    Authentication via API keys in Neon Console settings.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* SQL Editors */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">SQL Editors & Clients</h2>
          <p className="text-muted-foreground mb-6">
            Use standard PostgreSQL tools and editors to connect to Neon databases.
          </p>

          <div className="space-y-3">
            <Card className="p-4">
              <h4 className="font-semibold text-foreground mb-2">pgAdmin</h4>
              <p className="text-sm text-muted-foreground">
                Web-based PostgreSQL management tool. Perfect for visual database browsing and query execution.
              </p>
            </Card>

            <Card className="p-4">
              <h4 className="font-semibold text-foreground mb-2">DBeaver</h4>
              <p className="text-sm text-muted-foreground">
                Desktop database client with rich features for query building, schema design, and data browsing.
              </p>
            </Card>

            <Card className="p-4">
              <h4 className="font-semibold text-foreground mb-2">TablePlus</h4>
              <p className="text-sm text-muted-foreground">
                Modern, native database client for macOS, Windows, and Linux with excellent UX.
              </p>
            </Card>

            <Card className="p-4">
              <h4 className="font-semibold text-foreground mb-2">psql (PostgreSQL CLI)</h4>
              <p className="text-sm text-muted-foreground">
                Official PostgreSQL command-line tool for running SQL queries and scripts.
              </p>
            </Card>

            <Card className="p-4">
              <h4 className="font-semibold text-foreground mb-2">Neon Console SQL Editor</h4>
              <p className="text-sm text-muted-foreground">
                Built-in SQL editor in Neon Console for quick queries without installing additional tools.
              </p>
            </Card>
          </div>
        </section>

        {/* Integration with Development Tools */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">Integration with Development Tools</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <h4 className="font-semibold text-foreground mb-2">VS Code Extensions</h4>
              <p className="text-sm text-muted-foreground">
                Use PostgreSQL extensions for VS Code to query Neon databases directly from your editor.
              </p>
            </Card>

            <Card className="p-4">
              <h4 className="font-semibold text-foreground mb-2">Docker Compose</h4>
              <p className="text-sm text-muted-foreground">
                Include Neon connection strings in docker-compose.yml for local development environments.
              </p>
            </Card>

            <Card className="p-4">
              <h4 className="font-semibold text-foreground mb-2">GitHub Actions</h4>
              <p className="text-sm text-muted-foreground">
                Automate migrations and branch creation/deletion in your CI/CD pipelines.
              </p>
            </Card>

            <Card className="p-4">
              <h4 className="font-semibold text-foreground mb-2">Vercel Integration</h4>
              <p className="text-sm text-muted-foreground">
                Automatic environment variable injection for Neon projects deployed on Vercel.
              </p>
            </Card>
          </div>
        </section>

        {/* Choosing the Right Tool */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">Choosing the Right Tool</h2>
          
          <div className="space-y-4">
            <Card className="p-4 border-blue-200 bg-blue-50">
              <h4 className="font-semibold text-foreground mb-2">For Project Management</h4>
              <p className="text-sm text-foreground">
                Use <strong>Neon Console</strong> for a visual interface or <strong>Neon CLI</strong> for scripting.
              </p>
            </Card>

            <Card className="p-4 border-green-200 bg-green-50">
              <h4 className="font-semibold text-foreground mb-2">For Running Migrations</h4>
              <p className="text-sm text-foreground">
                Use your ORM's migration tool (<strong>Prisma migrate</strong>, <strong>Drizzle migrations</strong>) for application changes, or <strong>Flyway</strong>/<strong>Liquibase</strong> for independent version control.
              </p>
            </Card>

            <Card className="p-4 border-purple-200 bg-purple-50">
              <h4 className="font-semibold text-foreground mb-2">For Ad-Hoc Queries</h4>
              <p className="text-sm text-foreground">
                Use <strong>Neon Console SQL Editor</strong> for quick checks or <strong>TablePlus</strong>/<strong>DBeaver</strong> for more powerful query tools.
              </p>
            </Card>

            <Card className="p-4 border-amber-200 bg-amber-50">
              <h4 className="font-semibold text-foreground mb-2">For Automation</h4>
              <p className="text-sm text-foreground">
                Use <strong>Neon CLI</strong> in scripts or <strong>Neon API</strong> for programmatic access in CI/CD pipelines.
              </p>
            </Card>
          </div>
        </section>

        {/* Next Steps */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">Next Steps</h2>
          <div className="space-y-3">
            <Card className="p-4 border-blue-200 bg-blue-50">
              <a href="/guides/neon-connection-guide/tools/cli" className="font-semibold text-foreground hover:text-primary transition-colors">
                → Learn about Neon CLI
              </a>
              <p className="text-sm text-muted-foreground mt-1">
                Master command-line management of Neon projects and databases.
              </p>
            </Card>

            <Card className="p-4 border-blue-200 bg-blue-50">
              <a href="/guides/neon-connection-guide/tools/migrations" className="font-semibold text-foreground hover:text-primary transition-colors">
                → Learn about Migrations
              </a>
              <p className="text-sm text-muted-foreground mt-1">
                Understand how to safely evolve your database schema.
              </p>
            </Card>
          </div>
        </section>
      </div>
    </GuideLayout>
  )
}
