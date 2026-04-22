"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowLeft, Save, Play } from "lucide-react"

interface Agent {
  id: string
  name: string
  description?: string
  agent_type: string
  code: string
  trigger_type: string
  status: string
  created_at: string
  updated_at: string
}

const AGENT_TYPES = [
  { value: "financial_transaction", label: "Financial Transaction" },
  { value: "admin_task", label: "Admin Task" },
  { value: "code_execution", label: "Code Execution" },
  { value: "data_analysis", label: "Data Analysis" },
]

const TRIGGER_TYPES = [
  { value: "manual", label: "Manual" },
  { value: "scheduled", label: "Scheduled" },
  { value: "event", label: "Event-based" },
]

export default function AgentEditorPage() {
  const router = useRouter()
  const params = useParams()
  const { isAuthenticated, isLoading } = useAuth()
  const agentId = params.id as string

  const [agent, setAgent] = useState<Agent | null>(null)
  const [formData, setFormData] = useState<Partial<Agent>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [executing, setExecuting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Check authentication
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login")
    }
  }, [isAuthenticated, isLoading, router])

  // Fetch agent
  useEffect(() => {
    if (isAuthenticated && agentId) {
      fetchAgent()
    }
  }, [isAuthenticated, agentId])

  async function fetchAgent() {
    try {
      setLoading(true)
      const response = await fetch(`/api/agents/${agentId}`)
      if (!response.ok) throw new Error("Failed to fetch agent")
      const data = await response.json()
      setAgent(data)
      setFormData(data)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to fetch agent")
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!agent) return

    try {
      setSaving(true)
      setError("")
      setSuccess("")

      const response = await fetch(`/api/agents/${agentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          code: formData.code,
          agentType: formData.agent_type,
          triggerType: formData.trigger_type,
          status: formData.status,
        }),
      })

      if (!response.ok) throw new Error("Failed to save agent")
      const updated = await response.json()
      setAgent(updated)
      setFormData(updated)
      setSuccess("Agent saved successfully")
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to save agent")
    } finally {
      setSaving(false)
    }
  }

  async function handleExecute() {
    if (!agent) return

    try {
      setExecuting(true)
      setError("")

      const response = await fetch(`/api/agents/${agentId}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: {} }),
      })

      if (!response.ok) throw new Error("Failed to execute agent")
      const result = await response.json()
      router.push(`/agents/${agentId}/executions/${result.executionId}`)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to execute agent")
    } finally {
      setExecuting(false)
    }
  }

  if (isLoading || !isAuthenticated || loading) {
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
            onClick={() => router.push("/agents")}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{agent.name}</h1>
              <p className="text-muted-foreground mt-2">Edit and manage this agent</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleExecute}
                disabled={executing || saving || agent.status !== "active"}
                className="gap-2"
              >
                {executing && <Loader2 className="w-4 h-4 animate-spin" />}
                <Play className="w-4 h-4" />
                Execute
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || executing}
                className="gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                <Save className="w-4 h-4" />
                Save
              </Button>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-500/10 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        {/* Form */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Agent Name</Label>
                  <Input
                    id="name"
                    value={formData.name || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    disabled={saving || executing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    disabled={saving || executing}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Code Editor */}
            <Card>
              <CardHeader>
                <CardTitle>Agent Code</CardTitle>
                <CardDescription>
                  Write JavaScript code for your agent. Available: api.log(), api.error(), api.getAccountBalance(), api.listTransactions(), api.transferMoney(), api.input
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.code || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  disabled={saving || executing}
                  rows={15}
                  className="font-mono text-sm"
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={formData.agent_type || ""}
                    onValueChange={(value) =>
                      setFormData({ ...formData, agent_type: value })
                    }
                    disabled={saving || executing}
                  >
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AGENT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="trigger">Trigger Type</Label>
                  <Select
                    value={formData.trigger_type || ""}
                    onValueChange={(value) =>
                      setFormData({ ...formData, trigger_type: value })
                    }
                    disabled={saving || executing}
                  >
                    <SelectTrigger id="trigger">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TRIGGER_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status || ""}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value })
                    }
                    disabled={saving || executing}
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Created</p>
                  <p className="font-medium">
                    {new Date(agent.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Last Updated</p>
                  <p className="font-medium">
                    {new Date(agent.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
