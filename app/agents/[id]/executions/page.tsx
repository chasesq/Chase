"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Loader2, ChevronRight } from "lucide-react"

interface Execution {
  id: string
  status: string
  input?: any
  output?: any
  error_message?: string
  execution_time_ms?: number
  retry_count: number
  triggered_by: string
  triggered_at: string
  completed_at?: string
  created_at: string
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  running: "bg-blue-100 text-blue-800",
  success: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  timeout: "bg-orange-100 text-orange-800",
}

export default function ExecutionsPage() {
  const router = useRouter()
  const params = useParams()
  const { isAuthenticated, isLoading } = useAuth()
  const agentId = params.id as string

  const [agent, setAgent] = useState<any>(null)
  const [executions, setExecutions] = useState<Execution[]>([])
  const [pageLoading, setPageLoading] = useState(true)
  const [executionsLoading, setExecutionsLoading] = useState(true)
  const [error, setError] = useState("")
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const limit = 20

  // Check authentication
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login")
    }
  }, [isAuthenticated, isLoading, router])

  // Fetch agent and executions
  useEffect(() => {
    if (isAuthenticated && agentId) {
      fetchAgent()
      fetchExecutions()
    }
  }, [isAuthenticated, agentId, offset])

  async function fetchAgent() {
    try {
      setPageLoading(true)
      const response = await fetch(`/api/agents/${agentId}`)
      if (!response.ok) throw new Error("Failed to fetch agent")
      const data = await response.json()
      setAgent(data)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to fetch agent")
    } finally {
      setPageLoading(false)
    }
  }

  async function fetchExecutions() {
    try {
      setExecutionsLoading(true)
      const response = await fetch(
        `/api/agents/${agentId}/executions?limit=${limit}&offset=${offset}`
      )
      if (!response.ok) throw new Error("Failed to fetch executions")
      const data = await response.json()
      setExecutions(data.executions)
      setTotal(data.total)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to fetch executions")
    } finally {
      setExecutionsLoading(false)
    }
  }

  if (isLoading || !isAuthenticated || pageLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    )
  }

  if (!agent) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <p className="text-muted-foreground">Agent not found</p>
        <Button onClick={() => router.push("/agents")} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Agents
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            className="mb-4 gap-2"
            onClick={() => router.push(`/agents/${agentId}`)}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Agent
          </Button>

          <div>
            <h1 className="text-3xl font-bold text-foreground">Execution History</h1>
            <p className="text-muted-foreground mt-2">{agent.name}</p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-lg">
            {error}
          </div>
        )}

        {/* Stats */}
        {total > 0 && (
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Executions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{total}</p>
              </CardContent>
            </Card>
            {/* Add more stats cards as needed */}
          </div>
        )}

        {/* Executions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Executions</CardTitle>
            <CardDescription>
              {total === 0 ? "No executions yet" : `Showing ${executions.length} of ${total} executions`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {executionsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : executions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No executions yet. Run the agent to see results here.
              </p>
            ) : (
              <div className="space-y-2">
                {executions.map((execution) => (
                  <button
                    key={execution.id}
                    onClick={() =>
                      router.push(`/agents/${agentId}/executions/${execution.id}`)
                    }
                    className="w-full p-4 border rounded-lg hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={statusColors[execution.status] || "bg-gray-100 text-gray-800"}>
                            {execution.status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {execution.triggered_by}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(execution.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        {execution.execution_time_ms && (
                          <p className="text-sm font-medium">
                            {execution.execution_time_ms}ms
                          </p>
                        )}
                        {execution.error_message && (
                          <p className="text-xs text-destructive line-clamp-1">
                            {execution.error_message}
                          </p>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {total > limit && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button
              variant="outline"
              disabled={offset === 0}
              onClick={() => setOffset(Math.max(0, offset - limit))}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {Math.floor(offset / limit) + 1} of {Math.ceil(total / limit)}
            </span>
            <Button
              variant="outline"
              disabled={offset + limit >= total}
              onClick={() => setOffset(offset + limit)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
