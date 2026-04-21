"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { User, FileText, Database, Settings, Bell, Shield } from "lucide-react"
import { cn } from "@/lib/utils"

const activities = [
  {
    id: 1,
    type: "user",
    title: "New user registered",
    description: "john.doe@example.com created an account",
    time: "2 minutes ago",
    icon: User,
    status: "success",
  },
  {
    id: 2,
    type: "record",
    title: "Record updated",
    description: "Invoice #1234 was modified by admin",
    time: "15 minutes ago",
    icon: FileText,
    status: "info",
  },
  {
    id: 3,
    type: "database",
    title: "Database backup completed",
    description: "Automated backup finished successfully",
    time: "1 hour ago",
    icon: Database,
    status: "success",
  },
  {
    id: 4,
    type: "security",
    title: "Security alert",
    description: "Unusual login attempt blocked",
    time: "2 hours ago",
    icon: Shield,
    status: "warning",
  },
  {
    id: 5,
    type: "settings",
    title: "Settings updated",
    description: "Email notifications enabled",
    time: "3 hours ago",
    icon: Settings,
    status: "info",
  },
  {
    id: 6,
    type: "notification",
    title: "System notification",
    description: "Scheduled maintenance in 24 hours",
    time: "5 hours ago",
    icon: Bell,
    status: "info",
  },
]

const statusStyles = {
  success: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  info: "bg-primary/10 text-primary border-primary/20",
  error: "bg-red-500/10 text-red-600 border-red-500/20",
}

export function ActivityFeed() {
  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
          <Badge variant="secondary" className="text-xs">
            Live
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="space-y-1 p-4 pt-0">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50"
              >
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border",
                    statusStyles[activity.status as keyof typeof statusStyles]
                  )}
                >
                  <activity.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    {activity.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activity.description}
                  </p>
                  <p className="text-xs text-muted-foreground/60">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
