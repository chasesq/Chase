'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowDownLeft, ArrowUpRight, Clock } from 'lucide-react'

interface Activity {
  id: string
  type: 'transfer_in' | 'transfer_out' | 'pending'
  amount?: number
  description: string
  timestamp: Date
  status: 'completed' | 'pending' | 'failed'
}

interface LinHuangActivityTrackerProps {
  activities?: Activity[]
}

export function LinHuangActivityTracker({
  activities = [
    {
      id: '1',
      type: 'transfer_in',
      amount: 500,
      description: 'Transfer from Admin',
      timestamp: new Date(Date.now() - 3600000),
      status: 'completed',
    },
    {
      id: '2',
      type: 'transfer_in',
      amount: 1000,
      description: 'Initial Funding',
      timestamp: new Date(Date.now() - 7200000),
      status: 'completed',
    },
    {
      id: '3',
      type: 'pending',
      amount: 250,
      description: 'Awaiting Transfer',
      timestamp: new Date(),
      status: 'pending',
    },
  ],
}: LinHuangActivityTrackerProps) {
  const formatCurrency = (amount?: number) => {
    if (!amount) return '$0.00'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / 3600000)
    const minutes = Math.floor((diff % 3600000) / 60000)

    if (hours > 24) return date.toLocaleDateString()
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'Just now'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700'
      case 'pending':
        return 'bg-yellow-100 text-yellow-700'
      case 'failed':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <Card className="border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.length === 0 ? (
            <p className="text-center text-gray-500 py-6">No transactions yet</p>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-full bg-white border-2 flex items-center justify-center">
                    {activity.type === 'transfer_in' ? (
                      <ArrowDownLeft className="w-5 h-5 text-green-600" />
                    ) : activity.type === 'transfer_out' ? (
                      <ArrowUpRight className="w-5 h-5 text-red-600" />
                    ) : (
                      <Clock className="w-5 h-5 text-yellow-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500">{formatTime(activity.timestamp)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-900">
                    {activity.type === 'transfer_out' ? '-' : '+'}{formatCurrency(activity.amount)}
                  </span>
                  <Badge className={`${getStatusColor(activity.status)} text-xs border-0`}>
                    {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
