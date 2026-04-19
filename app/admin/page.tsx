/**
 * Admin Dashboard - Real-time fund transfer management
 * Only accessible to admin users
 */

'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ProtectedAdminRoute } from '@/lib/auth/protected-admin'
import AdminTransferForm from '@/components/admin/admin-transfer-form'
import AdminUsersList from '@/components/admin/admin-users-list'
import AdminTransferHistory from '@/components/admin/admin-transfer-history'
import { FinancialAccountsDashboard } from '@/components/admin/financial-accounts-dashboard'
import { PayoutScheduler } from '@/components/admin/payout-scheduler'
import { CreateUserForm } from '@/components/admin/create-user-form'
import { CardholdFormComponent } from '@/components/issuing/cardholder-form'
import { CardIssuanceForm } from '@/components/issuing/card-issuance-form'
import { CreditPolicyForm } from '@/components/credit/credit-policy-form'
import { TestUtilitiesPanel } from '@/components/admin/test-utilities-panel'

interface NewUser {
  id: string
  email: string
  name: string
  created_at: string
  accounts: any[]
}

interface AdminTransfer {
  id: string
  user_id: string
  account_id: string
  amount: number
  status: string
  created_at: string
  confirmed_at?: string
  users?: { id: string; email: string; name: string }
  accounts?: { id: string; name: string; type: string }
}

export default function AdminDashboardPage() {
  return (
    <ProtectedAdminRoute>
      <AdminDashboardContent />
    </ProtectedAdminRoute>
  )
}

interface UserWithBalance {
  id: string
  email: string
  full_name: string | null
  role: string
  created_at: string
  account_count: number
  total_balance: number
}

function AdminDashboardContent() {
  const [newUsers, setNewUsers] = useState<NewUser[]>([])
  const [usersWithBalances, setUsersWithBalances] = useState<UserWithBalance[]>([])
  const [totalSystemBalance, setTotalSystemBalance] = useState(0)
  const [pendingTransfers, setPendingTransfers] = useState<AdminTransfer[]>([])
  const [transferHistory, setTransferHistory] = useState<AdminTransfer[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'users-balances' | 'new-users' | 'pending' | 'history' | 'financial-accounts' | 'payouts' | 'create-users' | 'issuing' | 'credit' | 'test-utilities'>('users-balances')
  const supabase = createClient()

  // Fetch initial data
  useEffect(() => {
    fetchDashboardData()
    setupRealtimeListeners()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      const adminHeaders = {
        'Content-Type': 'application/json',
        'x-user-id': 'admin',
        'x-user-role': 'admin',
      }

      // Fetch users with balances
      const balancesRes = await fetch('/api/admin/users-balances', {
        method: 'GET',
        headers: adminHeaders,
      })

      if (balancesRes.ok) {
        const data = await balancesRes.json()
        setUsersWithBalances(data.users || [])
        setTotalSystemBalance(data.totalBalance || 0)
      }

      // Fetch all users with their accounts (not just 24h)
      const allUsersRes = await fetch('/api/admin/users', {
        method: 'GET',
        headers: adminHeaders,
      })

      if (allUsersRes.ok) {
        const data = await allUsersRes.json()
        setNewUsers(data.users || [])
      }

      // Fetch pending transfers
      const pendingRes = await fetch('/api/admin/users', {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({ action: 'get-pending-transfers' }),
      })

      if (pendingRes.ok) {
        const data = await pendingRes.json()
        setPendingTransfers(data.transfers || [])
      }

      // Fetch transfer history
      const historyRes = await fetch('/api/admin/transfers', {
        headers: adminHeaders,
      })
      if (historyRes.ok) {
        const data = await historyRes.json()
        setTransferHistory(data.transfers || [])
      }
    } catch (error) {
      console.error('[v0] Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const setupRealtimeListeners = () => {
    // Subscribe to admin_transfers changes
    const transfersChannel = supabase
      .channel('admin_transfers_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'admin_transfers',
        },
        (payload: any) => {
          console.log('[v0] Transfer update:', payload)
          fetchDashboardData()
        }
      )
      .subscribe()

    // Subscribe to new users
    const usersChannel = supabase
      .channel('users_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'users',
        },
        (payload: any) => {
          console.log('[v0] New user registered:', payload)
          fetchDashboardData()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(transfersChannel)
      supabase.removeChannel(usersChannel)
    }
  }

  const handleTransferSuccess = () => {
    fetchDashboardData()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage user accounts and fund transfers</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{usersWithBalances.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Balance</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">${totalSystemBalance.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pending Transfers</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{pendingTransfers.length}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⏳</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Completed Transfers</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {transferHistory.filter((t) => t.status === 'completed').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            <button
              onClick={() => setActiveTab('users-balances')}
              className={`flex-1 px-6 py-4 text-sm font-medium text-center transition whitespace-nowrap ${
                activeTab === 'users-balances'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Users & Balances
            </button>
            <button
              onClick={() => setActiveTab('new-users')}
              className={`flex-1 px-6 py-4 text-sm font-medium text-center transition whitespace-nowrap ${
                activeTab === 'new-users'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              New Users ({newUsers.length})
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex-1 px-6 py-4 text-sm font-medium text-center transition ${
                activeTab === 'pending'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Pending Transfers ({pendingTransfers.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 px-6 py-4 text-sm font-medium text-center transition ${
                activeTab === 'history'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Transfer History
            </button>
            <button
              onClick={() => setActiveTab('financial-accounts')}
              className={`flex-1 px-6 py-4 text-sm font-medium text-center transition ${
                activeTab === 'financial-accounts'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Financial Accounts
            </button>
            <button
              onClick={() => setActiveTab('payouts')}
              className={`flex-1 px-6 py-4 text-sm font-medium text-center transition ${
                activeTab === 'payouts'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Payout Schedules
            </button>
            <button
              onClick={() => setActiveTab('create-users')}
              className={`flex-1 px-6 py-4 text-sm font-medium text-center transition ${
                activeTab === 'create-users'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Create Users
            </button>
            <button
              onClick={() => setActiveTab('issuing')}
              className={`flex-1 px-6 py-4 text-sm font-medium text-center transition ${
                activeTab === 'issuing'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Issuing & Cards
            </button>
            <button
              onClick={() => setActiveTab('credit')}
              className={`flex-1 px-6 py-4 text-sm font-medium text-center transition ${
                activeTab === 'credit'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Credit Management
            </button>
            <button
              onClick={() => setActiveTab('test-utilities')}
              className={`flex-1 px-6 py-4 text-sm font-medium text-center transition ${
                activeTab === 'test-utilities'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Test Utilities
            </button>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Loading dashboard data...</p>
              </div>
            ) : activeTab === 'users-balances' ? (
              <div>
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-900">System Summary</h3>
                  <p className="text-blue-700 mt-2">
                    Total System Balance: <span className="font-bold text-lg">${totalSystemBalance.toFixed(2)}</span>
                  </p>
                  <p className="text-blue-700">
                    Active Customers: <span className="font-bold">{usersWithBalances.length}</span>
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Role</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Accounts</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Balance</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersWithBalances.map((user) => (
                        <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{user.email}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{user.full_name || '-'}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.role === 'admin' 
                                ? 'bg-purple-100 text-purple-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{user.account_count}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-right text-gray-900">
                            ${user.total_balance.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : activeTab === 'new-users' ? (
              <>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Recently Registered Users
                </h2>
                <AdminUsersList users={newUsers} />
              </>
            ) : activeTab === 'pending' ? (
              <>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Transfer Funds to New Account
                </h2>
                <AdminTransferForm users={newUsers} onSuccess={handleTransferSuccess} />
                {pendingTransfers.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-sm font-medium text-gray-900 mb-4">
                      Pending Transfers Awaiting Confirmation
                    </h3>
                    <AdminTransferHistory transfers={pendingTransfers} />
                  </div>
                )}
              </>
            ) : activeTab === 'financial-accounts' ? (
              <>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Stripe Financial Accounts
                </h2>
                <FinancialAccountsDashboard adminId="admin-chase-bank" />
              </>
            ) : activeTab === 'payouts' ? (
              <>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Payout Schedule Management
                </h2>
                <PayoutScheduler adminId="admin-chase-bank" />
              </>
            ) : activeTab === 'create-users' ? (
              <>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  User Account Management
                </h2>
                <CreateUserForm />
              </>
            ) : activeTab === 'issuing' ? (
              <div className="space-y-8">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Create Cardholder
                  </h2>
                  <CardholdFormComponent />
                </div>
                <div className="border-t border-gray-200 pt-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Issue Card
                  </h2>
                  <CardIssuanceForm />
                </div>
              </div>
            ) : activeTab === 'credit' ? (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Create Credit Policy
                </h2>
                <CreditPolicyForm userId="admin-chase-bank" />
              </div>
            ) : activeTab === 'test-utilities' ? (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Test Utilities
                </h2>
                <TestUtilitiesPanel adminId="admin-chase-bank" />
              </div>
            ) : (
              <>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Transfer History
                </h2>
                <AdminTransferHistory transfers={transferHistory} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
