'use client'

import React from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface Breadcrumb {
  label: string
  href?: string
}

interface GuideLayoutProps {
  title: string
  description?: string
  breadcrumbs?: Breadcrumb[]
  children: React.ReactNode
  sidebar?: React.ReactNode
}

export function GuideLayout({
  title,
  description,
  breadcrumbs,
  children,
  sidebar,
}: GuideLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb Navigation */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="border-b border-border px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto py-3 flex items-center gap-2 text-sm">
            <Link href="/guides" className="text-muted-foreground hover:text-foreground transition-colors">
              Guides
            </Link>
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                {crumb.href ? (
                  <Link href={crumb.href} className="text-muted-foreground hover:text-foreground transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-foreground font-medium">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </nav>
      )}

      {/* Header */}
      <div className="border-b border-border px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto py-8 sm:py-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">{title}</h1>
          {description && (
            <p className="text-lg text-muted-foreground max-w-3xl">{description}</p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 gap-8">
          {sidebar ? (
            <>
              <aside className="lg:col-span-1 lg:row-span-2">{sidebar}</aside>
              <main className="lg:col-span-2">{children}</main>
            </>
          ) : (
            <main>{children}</main>
          )}
        </div>
      </div>
    </div>
  )
}
