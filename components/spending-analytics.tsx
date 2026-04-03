'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

interface SpendingAnalytic {
  id: string
  category: string
  total_spent: number
  transaction_count: number
  average_transaction: number
  budget_limit: number | null
  percent_of_budget: number | null
  trend_change: number | null
}

export function SpendingAnalytics() {
  const [analytics, setAnalytics] = useState<SpendingAnalytic[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalSpent, setTotalSpent] = useState(0)
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  useEffect(() => {
      loadAnalytics()
    }
  }, [user])

  const loadAnalytics = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(
        `/api/analytics/spending?month=${currentMonth}&year=${currentYear}`,
        {
          headers: {
            'user-id': user?.id || '',
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
        const total = data.reduce((sum: number, item: SpendingAnalytic) => sum + item.total_spent, 0)
        setTotalSpent(total)
      }
    } catch (error) {
      console.error('[v0] Error loading analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const categoryColors: Record<string, string> = {
    groceries: 'bg-green-100 text-green-800',
    dining: 'bg-orange-100 text-orange-800',
    entertainment: 'bg-purple-100 text-purple-800',
    transportation: 'bg-blue-100 text-blue-800',
    utilities: 'bg-yellow-100 text-yellow-800',
    healthcare: 'bg-red-100 text-red-800',
    shopping: 'bg-pink-100 text-pink-800',
    other: 'bg-gray-100 text-gray-800',
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending Analytics</CardTitle>
        <CardDescription>
          {currentMonth}/{currentYear} - Total: ${totalSpent.toFixed(2)}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {analytics.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No spending data available</p>
          </div>
        ) : (
          <div className="space-y-6">
            {analytics.map((item) => {
              const percentage = item.budget_limit
                ? (item.total_spent / item.budget_limit) * 100
                : 0
              const isOverBudget = percentage > 100
              const trendIsPositive = (item.trend_change || 0) > 0

              return (
                <div key={item.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={categoryColors[item.category.toLowerCase()] || categoryColors.other}>
                        {item.category}
                      </Badge>
                      <span className="font-semibold">
                        ${item.total_spent.toFixed(2)}
                      </span>
                      {item.trend_change !== null && (
                        <div
                          className={`flex items-center gap-1 text-sm ${
                            trendIsPositive ? 'text-red-600' : 'text-green-600'
                          }`}
                        >
                          {trendIsPositive ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          {Math.abs(item.trend_change).toFixed(1)}%
                        </div>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {item.transaction_count} transactions
                    </span>
                  </div>

                  {item.budget_limit && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          Budget: ${item.budget_limit.toFixed(2)}
                        </span>
                        <span
                          className={`font-semibold ${
                            isOverBudget ? 'text-red-600' : 'text-green-600'
                          }`}
                        >
                          {percentage.toFixed(0)}%
                        </span>
                      </div>
                      <Progress
                        value={Math.min(percentage, 100)}
                        className="h-2"
                      />
                      {isOverBudget && (
                        <p className="text-xs text-red-600">
                          Over budget by ${(item.total_spent - item.budget_limit).toFixed(2)}
                        </p>
                      )}
                    </div>
                  )}

                  {item.average_transaction && (
                    <p className="text-xs text-muted-foreground">
                      Avg: ${item.average_transaction.toFixed(2)} per transaction
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
