'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Zap } from 'lucide-react'

interface LinHuangWelcomeCardProps {
  userName?: string
}

export function LinHuangWelcomeCard({ userName = 'Lin Huang' }: LinHuangWelcomeCardProps) {
  return (
    <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-0 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-white">Welcome, {userName}!</CardTitle>
            <p className="text-blue-100 text-sm mt-1">Your account is ready to receive transfers</p>
          </div>
          <Badge className="bg-blue-500 text-white border-0">Premium Member</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-300" />
            <span className="text-sm">Account Verified</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-300" />
            <span className="text-sm">Real-time Updates</span>
          </div>
        </div>
        <div className="pt-3 border-t border-blue-500">
          <p className="text-sm text-blue-100">
            Your checking and savings accounts are ready. Transfers will appear instantly with notifications.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
