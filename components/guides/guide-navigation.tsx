'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'

interface NavigationItem {
  label: string
  href: string
  description?: string
}

interface NavigationSection {
  title: string
  items: NavigationItem[]
}

const navigation: NavigationSection[] = [
  {
    title: 'Getting Started',
    items: [
      {
        label: 'Overview',
        href: '/guides/neon-connection-guide',
        description: 'Introduction to connection methods',
      },
    ],
  },
  {
    title: 'Connection Scenarios',
    items: [
      {
        label: 'JavaScript/TypeScript',
        href: '/guides/neon-connection-guide/scenarios/javascript-typescript',
        description: 'JS/TS deployment options',
      },
      {
        label: 'Other Languages',
        href: '/guides/neon-connection-guide/scenarios/other-languages',
        description: 'Python, Go, Rust, and more',
      },
      {
        label: 'Serverless Platforms',
        href: '/guides/neon-connection-guide/scenarios/serverless',
        description: 'Netlify, Deno, Cloudflare',
      },
      {
        label: 'Client-Side Apps',
        href: '/guides/neon-connection-guide/scenarios/client-side',
        description: 'Browser-based connections',
      },
    ],
  },
  {
    title: 'Authentication',
    items: [
      {
        label: 'Overview',
        href: '/guides/neon-connection-guide/authentication/overview',
        description: 'Neon Auth fundamentals',
      },
      {
        label: 'Auth Flow',
        href: '/guides/neon-connection-guide/authentication/flow',
        description: 'Complete authentication process',
      },
      {
        label: 'Branching & Auth',
        href: '/guides/neon-connection-guide/authentication/branching',
        description: 'Auth with database branches',
      },
    ],
  },
  {
    title: 'Tools & Configuration',
    items: [
      {
        label: 'Connection Pooling',
        href: '/guides/neon-connection-guide/tools/pooling',
        description: 'Pooled vs direct connections',
      },
      {
        label: 'psql',
        href: '/guides/neon-connection-guide/tools/psql',
        description: 'PostgreSQL command-line tool',
      },
    ],
  },
]

export function GuideNavigation() {
  const pathname = usePathname()

  return (
    <div className="sticky top-4 space-y-6">
      {navigation.map((section) => (
        <div key={section.title}>
          <h3 className="text-sm font-semibold text-foreground mb-3 px-2">{section.title}</h3>
          <div className="space-y-2">
            {section.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'block px-3 py-2 rounded-md text-sm transition-colors',
                  pathname === item.href
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                <div className="font-medium">{item.label}</div>
                {item.description && (
                  <div className="text-xs opacity-75 line-clamp-1">{item.description}</div>
                )}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
