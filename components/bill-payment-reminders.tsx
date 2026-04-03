'use client'

import { useState, useEffect } from 'react'
import { Plus, Clock, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useNeonAuth } from '@/lib/auth/neon-context'

interface Bill {
  id: string
  payee_name: string
  amount: number
  due_date: string
  frequency: string
  status: 'active' | 'paid' | 'overdue' | 'canceled'
  reminder_days_before: number
  notes?: string
}

export function BillPaymentReminders() {
  const { user } = useNeonAuth()
  const [bills, setBills] = useState<Bill[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    payee_name: '',
    amount: '',
    due_date: '',
    frequency: 'monthly',
    reminder_days_before: '3',
  })

  useEffect(() => {
    if (user) {
      loadBills()
    }
  }, [user])

  const loadBills = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/bills', {
        headers: {
          'user-id': user?.id || '',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setBills(data)
      }
    } catch (error) {
      console.error('[v0] Error loading bills:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddBill = async () => {
    if (!formData.payee_name || !formData.amount || !formData.due_date) {
      alert('Please fill in all fields')
      return
    }

    try {
      const response = await fetch('/api/bills', {
        method: 'POST',
        headers: {
          'user-id': user?.id || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payee_name: formData.payee_name,
          amount: parseFloat(formData.amount),
          due_date: formData.due_date,
          frequency: formData.frequency,
          reminder_days_before: parseInt(formData.reminder_days_before),
        }),
      })

      if (response.ok) {
        const newBill = await response.json()
        setBills([newBill, ...bills])
        setFormData({
          payee_name: '',
          amount: '',
          due_date: '',
          frequency: 'monthly',
          reminder_days_before: '3',
        })
        setShowForm(false)
      }
    } catch (error) {
      console.error('[v0] Error adding bill:', error)
    }
  }

  const markPaid = async (bill: Bill) => {
    try {
      const response = await fetch('/api/bills', {
        method: 'PUT',
        headers: {
          'user-id': user?.id || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: bill.id,
          status: 'paid',
        }),
      })

      if (response.ok) {
        setBills(bills.map((b) => (b.id === bill.id ? { ...b, status: 'paid' } : b)))
      }
    } catch (error) {
      console.error('[v0] Error marking bill as paid:', error)
    }
  }

  const deleteBill = async (billId: string) => {
    if (!confirm('Delete this bill reminder?')) return

    try {
      await fetch(`/api/bills?id=${billId}`, {
        method: 'DELETE',
        headers: {
          'user-id': user?.id || '',
        },
      })

      setBills(bills.filter((b) => b.id !== billId))
    } catch (error) {
      console.error('[v0] Error deleting bill:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="outline" className="bg-green-50">Paid</Badge>
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>
      case 'active':
        return <Badge variant="secondary">Active</Badge>
      default:
        return <Badge>Canceled</Badge>
    }
  }

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate)
    const today = new Date()
    const days = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return days
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
          <CardTitle>Bill Reminders</CardTitle>
          <CardDescription>Schedule and track recurring bills</CardDescription>
        </div>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Bill
        </Button>
      </CardHeader>

      <CardContent>
        {showForm && (
          <div className="mb-6 p-4 border rounded-lg space-y-4 bg-accent/20">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Payee Name</Label>
                <Input
                  placeholder="e.g., Electric Company"
                  value={formData.payee_name}
                  onChange={(e) =>
                    setFormData({ ...formData, payee_name: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Amount</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) =>
                    setFormData({ ...formData, due_date: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Frequency</Label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.frequency}
                  onChange={(e) =>
                    setFormData({ ...formData, frequency: e.target.value })
                  }
                >
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-weekly</option>
                  <option value="yearly">Yearly</option>
                  <option value="once">One-time</option>
                </select>
              </div>
            </div>

            <div>
              <Label>Remind me (days before)</Label>
              <Input
                type="number"
                value={formData.reminder_days_before}
                onChange={(e) =>
                  setFormData({ ...formData, reminder_days_before: e.target.value })
                }
              />
            </div>

            <div className="flex gap-2">
              <Button size="sm" onClick={handleAddBill}>
                Add Bill
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

        {bills.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No bills scheduled</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bills.map((bill) => {
              const daysUntilDue = getDaysUntilDue(bill.due_date)
              const isUpcoming = daysUntilDue > 0 && daysUntilDue <= bill.reminder_days_before

              return (
                <div
                  key={bill.id}
                  className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold flex items-center gap-2">
                        {bill.payee_name}
                        {getStatusBadge(bill.status)}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        ${bill.amount.toFixed(2)} • {bill.frequency}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${bill.amount.toFixed(2)}</p>
                      <p
                        className={`text-sm ${
                          daysUntilDue < 0
                            ? 'text-red-600'
                            : isUpcoming
                              ? 'text-orange-600'
                              : 'text-green-600'
                        }`}
                      >
                        Due in {Math.abs(daysUntilDue)} day{Math.abs(daysUntilDue) !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3">
                    {bill.status !== 'paid' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs"
                        onClick={() => markPaid(bill)}
                      >
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Mark Paid
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={() => deleteBill(bill.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
