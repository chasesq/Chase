'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, DollarSign, Loader2, Check, AlertCircle, Edit2, Save, X } from 'lucide-react'

interface PayoutAccount {
  id: string
  stripe_account_id: string
  account_name: string
  payout_schedule: {
    interval: 'daily' | 'weekly' | 'monthly' | 'manual'
    monthly_anchor?: number
    weekly_anchor?: string
    delay_days: number
  }
  pending_balance: number
  available_balance: number
  currency: string
}

interface PayoutSchedulerProps {
  adminId: string
}

const INTERVAL_OPTIONS = [
  { value: 'daily', label: 'Daily', description: 'Automatic payouts every day' },
  { value: 'weekly', label: 'Weekly', description: 'Automatic payouts once per week' },
  { value: 'monthly', label: 'Monthly', description: 'Automatic payouts once per month' },
  { value: 'manual', label: 'Manual', description: 'Only when you request a payout' },
]

const WEEKLY_DAYS = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
]

export function PayoutScheduler({ adminId }: PayoutSchedulerProps) {
  const [accounts, setAccounts] = useState<PayoutAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingSchedule, setEditingSchedule] = useState({
    interval: 'daily' as 'daily' | 'weekly' | 'monthly' | 'manual',
    weekly_anchor: 'monday',
    monthly_anchor: 1,
    delay_days: 1,
  })

  useEffect(() => {
    loadPayoutAccounts()
  }, [])

  const loadPayoutAccounts = async () => {
    try {
      setIsLoading(true)
      // Mock data for demonstration - in production, this would fetch from your API
      const mockAccounts: PayoutAccount[] = [
        {
          id: '1',
          stripe_account_id: 'acct_1234567890',
          account_name: 'Main Platform Account',
          payout_schedule: {
            interval: 'daily',
            delay_days: 1,
          },
          pending_balance: 5234.50,
          available_balance: 12456.75,
          currency: 'USD',
        },
        {
          id: '2',
          stripe_account_id: 'acct_0987654321',
          account_name: 'Secondary Account',
          payout_schedule: {
            interval: 'weekly',
            weekly_anchor: 'friday',
            delay_days: 2,
          },
          pending_balance: 1200.00,
          available_balance: 4567.25,
          currency: 'USD',
        },
      ]
      setAccounts(mockAccounts)
    } catch (err) {
      setError('Failed to load payout accounts')
      console.error('[v0] Error loading payout accounts:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditClick = (account: PayoutAccount) => {
    setEditingId(account.id)
    setEditingSchedule({
      interval: account.payout_schedule.interval,
      weekly_anchor: account.payout_schedule.weekly_anchor || 'monday',
      monthly_anchor: account.payout_schedule.monthly_anchor || 1,
      delay_days: account.payout_schedule.delay_days,
    })
  }

  const handleSaveSchedule = async (accountId: string) => {
    try {
      // In production, this would call an API endpoint to update the schedule
      const updatedAccounts = accounts.map(acc =>
        acc.id === accountId
          ? {
              ...acc,
              payout_schedule: {
                interval: editingSchedule.interval,
                weekly_anchor: editingSchedule.weekly_anchor,
                monthly_anchor: editingSchedule.monthly_anchor,
                delay_days: editingSchedule.delay_days,
              },
            }
          : acc
      )
      setAccounts(updatedAccounts)
      setEditingId(null)
      setSuccess('Payout schedule updated successfully')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError('Failed to update payout schedule')
    }
  }

  const getIntervalDisplay = (schedule: PayoutAccount['payout_schedule']) => {
    switch (schedule.interval) {
      case 'daily':
        return 'Daily'
      case 'weekly':
        return `Weekly (${schedule.weekly_anchor || 'Monday'})`
      case 'monthly':
        return `Monthly (Day ${schedule.monthly_anchor || 1})`
      case 'manual':
        return 'Manual Payouts Only'
      default:
        return schedule.interval
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Pending</p>
              <p className="text-2xl font-bold text-white mt-2">
                $
                {accounts
                  .reduce((sum, acc) => sum + acc.pending_balance, 0)
                  .toFixed(2)}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500 opacity-20" />
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Available</p>
              <p className="text-2xl font-bold text-white mt-2">
                $
                {accounts
                  .reduce((sum, acc) => sum + acc.available_balance, 0)
                  .toFixed(2)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-emerald-500 opacity-20" />
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Managed Accounts</p>
              <p className="text-2xl font-bold text-white mt-2">{accounts.length}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-500 opacity-20" />
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-4 bg-red-950/30 border border-red-700/30 rounded-lg text-sm text-red-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-950/30 border border-green-700/30 rounded-lg text-sm text-green-400 flex items-center gap-2">
          <Check className="w-4 h-4 flex-shrink-0" />
          {success}
        </div>
      )}

      {/* Payout Accounts */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : accounts.length === 0 ? (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-12 text-center">
          <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-2">No payout accounts configured</p>
          <p className="text-sm text-gray-500">
            Connect financial accounts to manage their payout schedules
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {accounts.map(account => (
            <div
              key={account.id}
              className="bg-gray-900 border border-gray-700 rounded-lg p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h4 className="text-lg font-semibold text-white">{account.account_name}</h4>
                  <p className="text-xs text-gray-400 mt-1">{account.stripe_account_id}</p>
                </div>
                {editingId !== account.id && (
                  <button
                    onClick={() => handleEditClick(account)}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Schedule
                  </button>
                )}
              </div>

              {/* Balance Info */}
              <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
                <div>
                  <p className="text-gray-400 text-xs mb-1">Pending Balance</p>
                  <p className="text-xl font-bold text-yellow-400">
                    ${account.pending_balance.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Available Balance</p>
                  <p className="text-xl font-bold text-emerald-400">
                    ${account.available_balance.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Schedule Edit/Display */}
              {editingId === account.id ? (
                <div className="space-y-4 p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Payout Frequency
                    </label>
                    <select
                      value={editingSchedule.interval}
                      onChange={(e) =>
                        setEditingSchedule({
                          ...editingSchedule,
                          interval: e.target.value as any,
                        })
                      }
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
                    >
                      {INTERVAL_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label} - {option.description}
                        </option>
                      ))}
                    </select>
                  </div>

                  {editingSchedule.interval === 'weekly' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Payout Day
                      </label>
                      <select
                        value={editingSchedule.weekly_anchor}
                        onChange={(e) =>
                          setEditingSchedule({
                            ...editingSchedule,
                            weekly_anchor: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
                      >
                        {WEEKLY_DAYS.map(day => (
                          <option key={day.value} value={day.value}>
                            {day.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {editingSchedule.interval === 'monthly' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Payout Day of Month
                      </label>
                      <select
                        value={editingSchedule.monthly_anchor}
                        onChange={(e) =>
                          setEditingSchedule({
                            ...editingSchedule,
                            monthly_anchor: parseInt(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
                      >
                        {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                          <option key={day} value={day}>
                            Day {day}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Delay (Days)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="7"
                      value={editingSchedule.delay_days}
                      onChange={(e) =>
                        setEditingSchedule({
                          ...editingSchedule,
                          delay_days: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Number of days to wait before automatically paying out
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveSchedule(account.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      Save Schedule
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm font-medium transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm mb-2">Current Schedule</p>
                      <p className="text-lg font-semibold text-white">
                        {getIntervalDisplay(account.payout_schedule)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {account.payout_schedule.delay_days}-day processing delay
                      </p>
                    </div>
                    <Calendar className="w-8 h-8 text-blue-500/30" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
