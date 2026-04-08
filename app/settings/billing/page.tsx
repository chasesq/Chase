'use client'

import { SettingsLayout } from '@/components/settings-layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, AlertCircle } from 'lucide-react'

export default function BillingSettingsPage() {
  return (
    <SettingsLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">Billing & Subscription</h2>
          <p className="text-muted-foreground mt-1">Manage your payment methods and subscription</p>
        </div>

        {/* Current Plan */}
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold">Pro Plan</h3>
              </div>
              <p className="text-sm text-muted-foreground">Active since March 15, 2024</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-[#0a4fa6]">$9.99</p>
              <p className="text-xs text-muted-foreground">per month</p>
            </div>
          </div>
        </Card>

        {/* Payment Method */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">VISA</span>
                </div>
                <div>
                  <p className="font-medium">Visa ending in 4242</p>
                  <p className="text-sm text-muted-foreground">Expires 12/2026</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Update
              </Button>
            </div>
          </Card>
        </div>

        {/* Billing History */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Billing History</h3>
          <div className="space-y-2">
            {[
              { date: 'March 15, 2024', amount: '$9.99', status: 'Paid' },
              { date: 'February 15, 2024', amount: '$9.99', status: 'Paid' },
              { date: 'January 15, 2024', amount: '$9.99', status: 'Paid' },
            ].map((invoice, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{invoice.date}</p>
                    <p className="text-sm text-muted-foreground">Monthly subscription</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{invoice.amount}</p>
                    <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400 rounded">
                      {invoice.status}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4">
            Download Invoice
          </Button>
        </div>

        {/* Subscription Actions */}
        <Card className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800 p-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">Manage Subscription</h4>
              <p className="text-sm text-amber-800 dark:text-amber-200 mb-3">
                You can upgrade, downgrade, or cancel your subscription at any time.
              </p>
              <div className="space-y-2">
                <Button variant="outline" className="w-full text-left justify-start">
                  Upgrade to Enterprise
                </Button>
                <Button variant="outline" className="w-full text-left justify-start text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950">
                  Cancel Subscription
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </SettingsLayout>
  )
}
