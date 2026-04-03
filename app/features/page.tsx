'use client'

import { useState, useEffect } from 'react'
import { useNeonAuth } from '@/lib/auth/neon-context'
import { useWaitForData } from '@/lib/hooks/use-data-loader'
import { NotificationsCenter } from '@/components/notifications-center'
import { SpendingAnalytics } from '@/components/spending-analytics'
import { MoneyTransferTemplates } from '@/components/money-transfer-templates'
import { BillPaymentReminders } from '@/components/bill-payment-reminders'
import { ExportReports } from '@/components/export-reports'
import { Card, CardContent } from '@/components/ui/card'

export default function FeaturesPage() {
  const { user, isAuthenticated } = useNeonAuth()
  const [dataLoaded, setDataLoaded] = useState({
    notifications: false,
    analytics: false,
    templates: false,
    bills: false,
    reports: false,
  })

  const allDataLoaded = useWaitForData(dataLoaded, 'features-page')

  useEffect(() => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      window.location.href = '/auth/login'
    }
  }, [isAuthenticated])

  // Simulate data loading with delays
  useEffect(() => {
    const timers = [
      setTimeout(() => setDataLoaded((p) => ({ ...p, notifications: true })), 800),
      setTimeout(() => setDataLoaded((p) => ({ ...p, analytics: true })), 1200),
      setTimeout(() => setDataLoaded((p) => ({ ...p, templates: true })), 1500),
      setTimeout(() => setDataLoaded((p) => ({ ...p, bills: true })), 1800),
      setTimeout(() => setDataLoaded((p) => ({ ...p, reports: true })), 2000),
    ]

    return () => timers.forEach((t) => clearTimeout(t))
  }, [])

  if (!allDataLoaded) {
    return null // Global loading overlay will show
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-40">
        <div className="flex items-center justify-between h-16 px-4 max-w-7xl mx-auto">
          <div>
            <h1 className="text-2xl font-bold">Banking Features</h1>
            <p className="text-sm text-muted-foreground">
              Welcome back, {user?.name?.split(' ')[0] || 'User'}
            </p>
          </div>
          <NotificationsCenter />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Top Row - Notifications and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardContent className="pt-6">
              <SpendingAnalytics />
            </CardContent>
          </Card>
        </div>

        {/* Money Transfer Templates */}
        <Card>
          <CardContent className="pt-6">
            <MoneyTransferTemplates />
          </CardContent>
        </Card>

        {/* Bill Reminders */}
        <Card>
          <CardContent className="pt-6">
            <BillPaymentReminders />
          </CardContent>
        </Card>

        {/* Reports */}
        <Card>
          <CardContent className="pt-6">
            <ExportReports />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
