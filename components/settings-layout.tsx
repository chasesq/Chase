'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  User,
  Lock,
  Bell,
  Eye,
  CreditCard,
  ChevronRight,
  Settings,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SettingsLayoutProps {
  children: React.ReactNode
}

const SETTINGS_SECTIONS = [
  {
    id: 'profile',
    label: 'Profile',
    description: 'Manage your personal information',
    icon: User,
    href: '/settings/profile',
    color: 'text-blue-600',
  },
  {
    id: 'security',
    label: 'Security',
    description: 'Password, 2FA, and sessions',
    icon: Lock,
    href: '/settings/security',
    color: 'text-red-600',
  },
  {
    id: 'notifications',
    label: 'Notifications',
    description: 'Email and push alerts',
    icon: Bell,
    href: '/settings/notifications',
    color: 'text-amber-600',
  },
  {
    id: 'privacy',
    label: 'Privacy',
    description: 'Data sharing and visibility',
    icon: Eye,
    href: '/settings/privacy',
    color: 'text-purple-600',
  },
  {
    id: 'billing',
    label: 'Billing',
    description: 'Payment methods and subscriptions',
    icon: CreditCard,
    href: '/settings/billing',
    color: 'text-green-600',
  },
]

export function SettingsLayout({ children }: SettingsLayoutProps) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Layout */}
      <div className="hidden md:grid grid-cols-3 gap-8 max-w-6xl mx-auto p-6">
        {/* Sidebar */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-4 py-2 mb-4">
            <Settings className="h-5 w-5 text-[#0a4fa6]" />
            <h1 className="text-xl font-semibold">Settings</h1>
          </div>

          {SETTINGS_SECTIONS.map((section) => {
            const Icon = section.icon
            const isActive = pathname.startsWith(section.href)

            return (
              <Link key={section.id} href={section.href}>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  className={cn(
                    'w-full justify-start gap-3 px-4 py-2.5',
                    isActive && 'bg-[#0a4fa6] hover:bg-[#083d80]'
                  )}
                >
                  <Icon className={cn('h-4 w-4', isActive ? 'text-white' : section.color)} />
                  <div className="flex-1 text-left">
                    <p className={cn('font-medium', isActive && 'text-white')}>
                      {section.label}
                    </p>
                    {!isActive && (
                      <p className="text-xs text-muted-foreground hidden sm:block">
                        {section.description}
                      </p>
                    )}
                  </div>
                  {isActive && <ChevronRight className="h-4 w-4 text-white" />}
                </Button>
              </Link>
            )
          })}
        </div>

        {/* Content */}
        <div className="col-span-2">{children}</div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        <div className="sticky top-0 z-40 bg-background border-b px-4 py-4">
          <h1 className="text-2xl font-semibold">Settings</h1>
        </div>

        <div className="px-4 py-6 space-y-3">
          {SETTINGS_SECTIONS.map((section) => {
            const Icon = section.icon
            const isActive = pathname.startsWith(section.href)

            return (
              <Link key={section.id} href={section.href}>
                <div
                  className={cn(
                    'flex items-center gap-4 p-4 rounded-lg border transition-colors',
                    isActive
                      ? 'bg-[#0a4fa6] border-[#0a4fa6] text-white'
                      : 'hover:bg-muted border-transparent'
                  )}
                >
                  <Icon className={cn('h-5 w-5', isActive ? 'text-white' : section.color)} />
                  <div className="flex-1">
                    <p className={cn('font-medium', isActive && 'text-white')}>
                      {section.label}
                    </p>
                    <p className={cn('text-xs', isActive ? 'text-white/70' : 'text-muted-foreground')}>
                      {section.description}
                    </p>
                  </div>
                  <ChevronRight className={cn('h-4 w-4', isActive && 'text-white')} />
                </div>
              </Link>
            )
          })}
        </div>

        <div className="px-4 py-6">{children}</div>
      </div>
    </div>
  )
}
