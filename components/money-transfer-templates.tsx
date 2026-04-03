'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Star, Copy, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface TransferTemplate {
  id: string
  name: string
  recipient_name: string
  recipient_account: string
  recipient_type: 'internal' | 'external' | 'wire'
  is_favorite: boolean
  usage_count: number
  last_used_at?: string
}

export function MoneyTransferTemplates() {
  const { user } = useNeonAuth()
  const [templates, setTemplates] = useState<TransferTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    recipient_name: '',
    recipient_account: '',
    recipient_type: 'internal' as const,
  })

  useEffect(() => {
    if (user) {
      loadTemplates()
    }
  }, [user])

  const loadTemplates = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/transfers/templates', {
        headers: {
          'user-id': user?.id || '',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setTemplates(data)
      }
    } catch (error) {
      console.error('[v0] Error loading templates:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddTemplate = async () => {
    if (!formData.name || !formData.recipient_name || !formData.recipient_account) {
      alert('Please fill in all fields')
      return
    }

    try {
      const response = await fetch('/api/transfers/templates', {
        method: 'POST',
        headers: {
          'user-id': user?.id || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const newTemplate = await response.json()
        setTemplates([newTemplate, ...templates])
        setFormData({
          name: '',
          recipient_name: '',
          recipient_account: '',
          recipient_type: 'internal',
        })
        setShowForm(false)
      }
    } catch (error) {
      console.error('[v0] Error adding template:', error)
    }
  }

  const toggleFavorite = async (template: TransferTemplate) => {
    try {
      const response = await fetch('/api/transfers/templates', {
        method: 'PUT',
        headers: {
          'user-id': user?.id || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: template.id,
          is_favorite: !template.is_favorite,
        }),
      })

      if (response.ok) {
        setTemplates(
          templates.map((t) =>
            t.id === template.id ? { ...t, is_favorite: !t.is_favorite } : t
          )
        )
      }
    } catch (error) {
      console.error('[v0] Error toggling favorite:', error)
    }
  }

  const deleteTemplate = async (templateId: string) => {
    if (!confirm('Delete this template?')) return

    try {
      await fetch(`/api/transfers/templates?id=${templateId}`, {
        method: 'DELETE',
        headers: {
          'user-id': user?.id || '',
        },
      })

      setTemplates(templates.filter((t) => t.id !== templateId))
    } catch (error) {
      console.error('[v0] Error deleting template:', error)
    }
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
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Money Transfer Templates</CardTitle>
          <CardDescription>Save and reuse frequently used transfers</CardDescription>
        </div>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Template
        </Button>
      </CardHeader>

      <CardContent>
        {showForm && (
          <div className="mb-6 p-4 border rounded-lg space-y-4 bg-accent/20">
            <div>
              <Label>Template Name</Label>
              <Input
                placeholder="e.g., Monthly Rent"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Recipient Name</Label>
              <Input
                placeholder="e.g., John Doe"
                value={formData.recipient_name}
                onChange={(e) =>
                  setFormData({ ...formData, recipient_name: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Account Number</Label>
              <Input
                placeholder="••••••••"
                value={formData.recipient_account}
                onChange={(e) =>
                  setFormData({ ...formData, recipient_account: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Transfer Type</Label>
              <select
                className="w-full px-3 py-2 border rounded-md"
                value={formData.recipient_type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    recipient_type: e.target.value as 'internal' | 'external' | 'wire',
                  })
                }
              >
                <option value="internal">Internal Transfer</option>
                <option value="external">External Transfer</option>
                <option value="wire">Wire Transfer</option>
              </select>
            </div>

            <div className="flex gap-2">
              <Button size="sm" onClick={handleAddTemplate}>
                Save Template
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {templates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <ExternalLink className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No transfer templates yet</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {templates.map((template) => (
              <div
                key={template.id}
                className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold">{template.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {template.recipient_name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {template.recipient_account.slice(-4).padStart(template.recipient_account.length, '•')}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleFavorite(template)}
                    className="p-1 hover:bg-background rounded"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        template.is_favorite
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-muted-foreground'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                  <span>{template.recipient_type}</span>
                  <span>{template.usage_count} uses</span>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs"
                    onClick={() => {
                      navigator.clipboard.writeText(template.recipient_account)
                    }}
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Copy
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={() => deleteTemplate(template.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
