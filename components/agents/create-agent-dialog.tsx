"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"

interface CreateAgentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAgentCreated: () => void
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

export function CreateAgentDialog({
  open,
  onOpenChange,
  onAgentCreated,
}: CreateAgentDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    agentType: "code_execution",
    triggerType: "manual",
    code: "",
  })
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!formData.name.trim()) {
      setError("Agent name is required")
      return
    }

    if (!formData.code.trim()) {
      setError("Agent code is required")
      return
    }

    try {
      setLoading(true)
      const response = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
          agentType: formData.agentType,
          triggerType: formData.triggerType,
          code: formData.code,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create agent")
      }

      setFormData({
        name: "",
        description: "",
        agentType: "code_execution",
        triggerType: "manual",
        code: "",
      })
      onOpenChange(false)
      onAgentCreated()
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to create agent")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Agent</DialogTitle>
          <DialogDescription>
            Set up a new agent to automate tasks asynchronously
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-destructive/10 text-destructive rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Agent Name</Label>
            <Input
              id="name"
              placeholder="e.g., Daily Balance Transfer"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe what this agent does..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              disabled={loading}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Agent Type</Label>
              <Select
                value={formData.agentType}
                onValueChange={(value) =>
                  setFormData({ ...formData, agentType: value })
                }
                disabled={loading}
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
                value={formData.triggerType}
                onValueChange={(value) =>
                  setFormData({ ...formData, triggerType: value })
                }
                disabled={loading}
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">Agent Code (JavaScript)</Label>
            <Textarea
              id="code"
              placeholder="// Write your agent logic here&#10;api.log('Starting agent')&#10;&#10;// Example: Get account balance&#10;// const balance = await api.getAccountBalance('account-id')&#10;&#10;return { message: 'Agent executed successfully' }"
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value })
              }
              disabled={loading}
              rows={8}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Available functions: api.log(), api.error(), api.getAccountBalance(), api.listTransactions(), api.transferMoney(), api.input
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Agent
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
