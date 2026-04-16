import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export const metadata = {
  title: 'Guides | Enterprise Financial System',
  description: 'Learning resources and tutorials for connecting to Neon and building with our platform',
}

export default function GuidesPage() {
  const guides = [
    {
      title: 'Neon Connection Guide',
      description: 'Learn how to choose the right connection method for your deployment platform and understand authentication flows.',
      href: '/guides/neon-connection-guide',
      topics: ['Connection Methods', 'Authentication', 'Pooling', 'Tools'],
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Guides & Tutorials
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Comprehensive resources to help you build and deploy applications with Neon and our platform.
            </p>
          </div>

          {/* Guides Grid */}
          <div className="grid gap-6">
            {guides.map((guide) => (
              <Link key={guide.href} href={guide.href}>
                <Card className="p-6 sm:p-8 hover:shadow-lg hover:border-primary transition-all cursor-pointer">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-foreground mb-2">
                        {guide.title}
                      </h2>
                      <p className="text-muted-foreground mb-4 max-w-2xl">
                        {guide.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {guide.topics.map((topic) => (
                          <span
                            key={topic}
                            className="inline-block px-3 py-1 bg-muted text-muted-foreground text-xs rounded-full"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-primary mt-2">
                      <ArrowRight className="w-6 h-6" />
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {/* Coming Soon Section */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-foreground mb-6">Coming Soon</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                'Security Best Practices',
                'Performance Optimization',
                'Monitoring & Debugging',
                'CI/CD Integration',
              ].map((topic) => (
                <Card
                  key={topic}
                  className="p-6 opacity-50 cursor-not-allowed border-dashed"
                >
                  <h3 className="font-semibold text-foreground">{topic}</h3>
                  <p className="text-sm text-muted-foreground mt-2">Coming soon...</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
