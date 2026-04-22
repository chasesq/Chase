"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Zap,
  Code,
  BarChart3,
  Briefcase,
  Trash2,
  Edit2,
  ChevronRight,
  Loader2,
} from "lucide-react"
import { useState } from "react"

interface Agent {
  id: string
  name: string
  description?: string
  agent_type: string
  trigger_type: string
  status: string
  created_at: string
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

interface AgentsListProps {
  agents: Agent[]
  onEdit: (agent: Agent) => void
  onExecute: (agent: Agent) => void
  onDelete: (agentId: string) => void
  isLoading?: boolean
}

export function AgentsList({
  agents,
  onEdit,
  onExecute,
  onDelete,
  isLoading = false,
}: AgentsListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(agentId: string) {
    if (!confirm("Are you sure you want to delete this agent?")) return

    try {
      setDeletingId(agentId)
      await onDelete(agentId)
    } finally {
      setDeletingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (agents.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No agents found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {agents.map((agent) => {
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
                  <span>{agentTypeLabels[agent.agent_type]}</span>
                  <span>Runs: {agent.totalExecutions || 0}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={() => onEdit(agent)}
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={() => onExecute(agent)}
                  >
                    <ChevronRight className="w-4 h-4" />
                    Details
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={deletingId === agent.id}
                    onClick={() => handleDelete(agent.id)}
                  >
                    {deletingId === agent.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4 text-destructive" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
