"use client"

import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Users, Activity, Database, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

const kpis = [
  {
    title: "Total Users",
    value: "12,847",
    change: "+12.5%",
    trend: "up",
    icon: Users,
    description: "vs last month",
  },
  {
    title: "Active Sessions",
    value: "1,284",
    change: "+8.2%",
    trend: "up",
    icon: Activity,
    description: "vs last hour",
  },
  {
    title: "Records Processed",
    value: "48.2K",
    change: "-2.4%",
    trend: "down",
    icon: Database,
    description: "vs last week",
  },
  {
    title: "Avg Response Time",
    value: "124ms",
    change: "-18.3%",
    trend: "up",
    icon: Clock,
    description: "vs last week",
  },
]

export function KPICards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <Card key={kpi.title} className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <kpi.icon className="h-5 w-5 text-primary" />
              </div>
              <div
                className={cn(
                  "flex items-center gap-1 text-sm font-medium",
                  kpi.trend === "up" ? "text-emerald-600" : "text-red-500"
                )}
              >
                {kpi.trend === "up" ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                {kpi.change}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
              <p className="text-sm text-muted-foreground">{kpi.title}</p>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{kpi.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
