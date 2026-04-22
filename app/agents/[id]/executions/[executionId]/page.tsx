"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Loader2, Copy, Check } from "lucide-react"

interface ExecutionDetail {
  id: string
  status: string
  input?: any
  output?: any
  error_message?: string
  error_stack?: string
  execution_time_ms?: number
  retry_count: number
  triggered_by: string
  triggered_at: string
  started_at?: string
  completed_at?: string
  created_at: string
  logs: Array<{
    id: string
    log_level: string
    message: string
    data?: any
    created_at: string
  }>
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  running: "bg-blue-100 text-blue-800",
  success: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  timeout: "bg-orange-100 text-orange-800",
}

export default function ExecutionDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { isAuthenticated, isLoading } = useAuth()
  const agentId = params.id as string
  const executionId = params.executionId as string

  const [execution, setExecution] = useState<ExecutionDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)

  // Check authentication
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login")
    }
  }, [isAuthenticated, isLoading, router])

  // Fetch execution details
  useEffect(() => {
    if (isAuthenticated && agentId && executionId) {
      fetchExecution()
    }
  }, [isAuthenticated, agentId, executionId])

  async function fetchExecution() {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/agents/${agentId}/executions/${executionId}`
      )
      if (!response.ok) throw new Error("Failed to fetch execution")
      const data = await response.json()
      setExecution(data)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to fetch execution")
    } finally {
      setLoading(false)
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isLoading || !isAuthenticated || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    )
  }

  if (!execution) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <p className="text-muted-foreground">Execution not found</p>
        <Button
          onClick={() => router.push(`/agents/${agentId}/executions`)}
          variant="outline"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Executions
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
            onClick={() => router.push(`/agents/${agentId}/executions`)}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Executions
          </Button>

          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Execution Details</h1>
              <p className="text-muted-foreground mt-2">
                {new Date(execution.created_at).toLocaleString()}
              </p>
            </div>
            <Badge className={statusColors[execution.status] || "bg-gray-100 text-gray-800"}>
              {execution.status}
            </Badge>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-lg">
            {error}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Execution Info */}
            <Card>
              <CardHeader>
                <CardTitle>Execution Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Execution ID</p>
                    <p className="font-mono text-sm break-all">{execution.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-medium">{execution.status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Triggered By</p>
                    <p className="font-medium">{execution.triggered_by}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Execution Time</p>
                    <p className="font-medium">
                      {execution.execution_time_ms ? `${execution.execution_time_ms}ms` : "—"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Input */}
            {execution.input && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Input</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(JSON.stringify(execution.input, null, 2))}
                    className="gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
                    {JSON.stringify(execution.input, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}

            {/* Output */}
            {execution.output && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Output</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(JSON.stringify(execution.output, null, 2))}
                    className="gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
                    {JSON.stringify(execution.output, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}

            {/* Error Details */}
            {execution.error_message && (
              <Card className="border-destructive">
                <CardHeader>
                  <CardTitle className="text-destructive">Error</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Error Message</p>
                    <p className="text-sm text-muted-foreground">{execution.error_message}</p>
                  </div>
                  {execution.error_stack && (
                    <div>
                      <p className="text-sm font-medium mb-2">Stack Trace</p>
                      <pre className="bg-muted p-4 rounded-lg overflow-auto text-xs text-destructive">
                        {execution.error_stack}
                      </pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Logs */}
            {execution.logs && execution.logs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Logs</CardTitle>
                  <CardDescription>{execution.logs.length} log entries</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 font-mono text-sm max-h-96 overflow-auto">
                    {execution.logs.map((log, index) => (
                      <div key={log.id} className="border-b pb-2 last:border-b-0">
                        <span className="text-muted-foreground">[{index + 1}]</span>
                        {" "}
                        <span
                          className={
                            log.log_level === "error"
                              ? "text-destructive"
                              : log.log_level === "warn"
                              ? "text-yellow-600"
                              : "text-green-600"
                          }
                        >
                          [{log.log_level.toUpperCase()}]
                        </span>
                        {" "}
                        {log.message}
                        {log.data && (
                          <>
                            {" "}
                            <span className="text-muted-foreground">
                              {JSON.stringify(log.data)}
                            </span>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Created</p>
                  <p className="text-sm">
                    {new Date(execution.created_at).toLocaleString()}
                  </p>
                </div>
                {execution.started_at && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Started</p>
                    <p className="text-sm">
                      {new Date(execution.started_at).toLocaleString()}
                    </p>
                  </div>
                )}
                {execution.completed_at && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Completed</p>
                    <p className="text-sm">
                      {new Date(execution.completed_at).toLocaleString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Metadata */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Retry Count</p>
                  <p className="font-medium">{execution.retry_count}</p>
                </div>
                {execution.execution_time_ms && (
                  <div>
                    <p className="text-muted-foreground">Duration</p>
                    <p className="font-medium">{execution.execution_time_ms}ms</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
