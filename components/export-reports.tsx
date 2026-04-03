'use client'

import { useState, useEffect } from 'react'
import { Download, FileText, Calendar, Clock, Plus, Trash2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useNeonAuth } from '@/lib/auth/neon-context'

interface Report {
  id: string
  report_type: 'transaction_history' | 'spending_summary' | 'tax_summary' | 'annual_summary'
  date_from: string
  date_to: string
  file_format: 'pdf' | 'csv'
  file_url?: string
  status: 'pending' | 'generated' | 'failed'
  created_at: string
}

const reportTypeLabels = {
  transaction_history: 'Transaction History',
  spending_summary: 'Spending Summary',
  tax_summary: 'Tax Summary',
  annual_summary: 'Annual Summary',
}

export function ExportReports() {
  const { user } = useNeonAuth()
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    report_type: 'spending_summary',
    date_from: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    date_to: new Date().toISOString().split('T')[0],
    file_format: 'pdf',
  })

  useEffect(() => {
    if (user) {
      loadReports()
    }
  }, [user])

  const loadReports = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/reports/generate', {
        headers: {
          'user-id': user?.id || '',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setReports(data)
      }
    } catch (error) {
      console.error('[v0] Error loading reports:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateReport = async () => {
    try {
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: {
          'user-id': user?.id || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const newReport = await response.json()
        setReports([newReport, ...reports])
        setShowForm(false)
      }
    } catch (error) {
      console.error('[v0] Error generating report:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'generated':
        return <Badge className="bg-green-100 text-green-800">Ready</Badge>
      case 'pending':
        return <Badge variant="secondary">Generating...</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge>Unknown</Badge>
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
          <CardTitle>Reports & Exports</CardTitle>
          <CardDescription>Generate and download financial reports</CardDescription>
        </div>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Generate Report
        </Button>
      </CardHeader>

      <CardContent>
        {showForm && (
          <div className="mb-6 p-4 border rounded-lg space-y-4 bg-accent/20">
            <div>
              <Label>Report Type</Label>
              <select
                className="w-full px-3 py-2 border rounded-md"
                value={formData.report_type}
                onChange={(e) =>
                  setFormData({ ...formData, report_type: e.target.value as any })
                }
              >
                <option value="transaction_history">Transaction History</option>
                <option value="spending_summary">Spending Summary</option>
                <option value="tax_summary">Tax Summary</option>
                <option value="annual_summary">Annual Summary</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>From Date</Label>
                <Input
                  type="date"
                  value={formData.date_from}
                  onChange={(e) =>
                    setFormData({ ...formData, date_from: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>To Date</Label>
                <Input
                  type="date"
                  value={formData.date_to}
                  onChange={(e) =>
                    setFormData({ ...formData, date_to: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <Label>File Format</Label>
              <select
                className="w-full px-3 py-2 border rounded-md"
                value={formData.file_format}
                onChange={(e) =>
                  setFormData({ ...formData, file_format: e.target.value as any })
                }
              >
                <option value="pdf">PDF</option>
                <option value="csv">CSV</option>
              </select>
            </div>

            <div className="flex gap-2">
              <Button size="sm" onClick={handleGenerateReport}>
                Generate
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

        {reports.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No reports generated yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <div
                key={report.id}
                className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">
                        {reportTypeLabels[report.report_type]}
                      </h4>
                      {getStatusBadge(report.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(report.date_from)} to {formatDate(report.date_to)} • {report.file_format.toUpperCase()}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(report.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex gap-2 mt-3">
                  {report.status === 'generated' && report.file_url && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs"
                      onClick={() => {
                        // Download file
                        window.location.href = report.file_url || '#'
                      }}
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                  )}
                  {report.status === 'pending' && (
                    <div className="flex-1 px-3 py-2 text-xs text-muted-foreground flex items-center gap-2">
                      <Clock className="w-3 h-3 animate-spin" />
                      Generating report...
                    </div>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={() => {
                      setReports(reports.filter((r) => r.id !== report.id))
                    }}
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
