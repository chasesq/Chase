"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  Zap,
  Code,
  BarChart3,
  Briefcase,
  Search,
  Trash2,
  Edit2,
  Play,
  ChevronRight,
  Loader2
} from "lucide-react"
import { AgentsList } from "@/components/agents/agents-list"
import { CreateAgentDialog } from "@/components/agents/create-agent-dialog"

interface Agent {
  id: string
  name: string
  description?: string
  agent_type: string
  trigger_type: string
  status: string
  created_at: string
  updated_at: string
  totalExecutions?: number
}

const agentTypeIcons: Record<string, any> = {
  financial_transaction: Zap,
  admin_task: Briefcase,
  code_execution: Code,
  data_analysis: BarChart3,
}

const agentTypeLabels: Record<string, string> = {
  financial_transaction: "Financial Transaction",
  admin_task: "Admin Task",
  code_execution: "Code Execution",
  data_analysis: "Data Analysis",
}

export default function AgentsPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  const [agents, setAgents] = useState<Agent[]>([])
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [agentsLoading, setAgentsLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedType, setSelectedType] = useState<string | null>(null)

  // Check authentication
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login")
    }
  }, [isAuthenticated, isLoading, router])

  // Fetch agents
  useEffect(() => {
    if (isAuthenticated) {
      fetchAgents()
    }
  }, [isAuthenticated])

  // Filter agents
  useEffect(() => {
    let filtered = agents

    if (selectedType) {
      filtered = filtered.filter(a => a.agent_type === selectedType)
    }

    if (searchTerm) {
      filtered = filtered.filter(a =>
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredAgents(filtered)
  }, [agents, searchTerm, selectedType])

  async function fetchAgents() {
    try {
      setAgentsLoading(true)
      const response = await fetch("/api/agents")
      if (!response.ok) throw new Error("Failed to fetch agents")
      const data = await response.json()
      setAgents(data)
    } catch (error) {
      console.error("Error fetching agents:", error)
    } finally {
      setAgentsLoading(false)
    }
  }

  async function deleteAgent(agentId: string) {
    if (!confirm("Are you sure you want to delete this agent?")) return

    try {
      const response = await fetch(`/api/agents/${agentId}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete agent")
      setAgents(agents.filter(a => a.id !== agentId))
    } catch (error) {
      console.error("Error deleting agent:", error)
    }
  }

  if (isLoading || !isAuthenticated) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Cloud Agents</h1>
              <p className="text-muted-foreground mt-2">
                Create and manage automated agents for financial transactions, data analysis, and more
              </p>
            </div>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="gap-2"
              size="lg"
            >
              <Plus className="w-4 h-4" />
              New Agent
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-4 flex-col sm:flex-row">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search agents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(agentTypeLabels).map(([type, label]) => (
              <Button
                key={type}
                variant={selectedType === type ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType(selectedType === type ? null : type)}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Agents Grid */}
        {agentsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredAgents.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                {agents.length === 0 ? "No agents yet. Create one to get started." : "No agents match your search."}
              </p>
              {agents.length === 0 && (
                <Button onClick={() => setShowCreateDialog(true)} variant="outline" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create Agent
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredAgents.map((agent) => {
              const Icon = agentTypeIcons[agent.agent_type]
              return (
                <Card key={agent.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {Icon && <Icon className="w-4 h-4 text-primary" />}
                          <CardTitle className="text-lg">{agent.name}</CardTitle>
                        </div>
                        <CardDescription className="line-clamp-2">
                          {agent.description || "No description"}
                        </CardDescription>
                      </div>
                      <Badge variant={agent.status === "active" ? "default" : "secondary"}>
                        {agent.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Type: {agentTypeLabels[agent.agent_type]}</span>
                        <span>Executions: {agent.totalExecutions || 0}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-2"
                          onClick={() => router.push(`/agents/${agent.id}`)}
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-2"
                          onClick={() => router.push(`/agents/${agent.id}/executions`)}
                        >
                          <ChevronRight className="w-4 h-4" />
                          Runs
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteAgent(agent.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <CreateAgentDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onAgentCreated={() => {
          setShowCreateDialog(false)
          fetchAgents()
        }}
      />
    </div>
  )
}
