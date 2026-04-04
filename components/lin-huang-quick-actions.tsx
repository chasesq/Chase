'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowDownLeft, Eye, Bell, Settings, RefreshCw, Smartphone } from 'lucide-react'

interface LinHuangQuickActionsProps {
  onReceiveTransfer?: () => void
  onViewDetails?: () => void
  onNotifications?: () => void
  onSettings?: () => void
}

export function LinHuangQuickActions({
  onReceiveTransfer,
  onViewDetails,
  onNotifications,
  onSettings,
}: LinHuangQuickActionsProps) {
  return (
    <Card className="bg-gradient-to-r from-slate-50 to-gray-50 border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button
            variant="outline"
            className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-blue-50 border-blue-200"
            onClick={onReceiveTransfer}
          >
            <ArrowDownLeft className="w-5 h-5 text-blue-600" />
            <span className="text-xs font-medium text-center">Receive Transfer</span>
          </Button>

          <Button
            variant="outline"
            className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-green-50 border-green-200"
            onClick={onViewDetails}
          >
            <Eye className="w-5 h-5 text-green-600" />
            <span className="text-xs font-medium text-center">View Details</span>
          </Button>

          <Button
            variant="outline"
            className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-purple-50 border-purple-200"
            onClick={onNotifications}
          >
            <Bell className="w-5 h-5 text-purple-600" />
            <span className="text-xs font-medium text-center">Notifications</span>
          </Button>

          <Button
            variant="outline"
            className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-orange-50 border-orange-200"
            onClick={onSettings}
          >
            <Settings className="w-5 h-5 text-orange-600" />
            <span className="text-xs font-medium text-center">Settings</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
