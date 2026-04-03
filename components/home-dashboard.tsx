'use client'

import { useRouter } from 'next/navigation'

interface HomeDashboardProps {
  user?: {
    email: string
    name: string
    accountName?: string
    role?: string
  }
  onLogout?: () => void
}

export function HomeDashboard({ user, onLogout }: HomeDashboardProps) {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/auth/sign-out', { method: 'POST' })
    if (onLogout) onLogout()
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Chase Banking</span>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
          >
            Sign Out
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-sm font-semibold text-gray-600 uppercase mb-2">Welcome</h2>
            <p className="text-3xl font-bold text-gray-900 mb-4">{user?.name || 'User'}</p>
            <p className="text-gray-600 text-sm">{user?.email}</p>
            {user?.accountName && (
              <p className="text-blue-600 text-sm font-medium mt-2">{user.accountName}</p>
            )}
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-8">
            <h3 className="text-sm font-semibold uppercase mb-2 opacity-90">Total Balance</h3>
            <p className="text-4xl font-bold mb-4">$24,582.50</p>
            <p className="text-blue-100 text-sm">3 accounts</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl shadow-lg p-8">
            <h3 className="text-sm font-semibold uppercase mb-2 opacity-90">Status</h3>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 bg-white rounded-full"></div>
              <span className="text-lg font-bold">Active</span>
            </div>
            <p className="text-green-100 text-sm">All systems operational</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Transactions</h3>
            <div className="space-y-4">
              {[
                { desc: 'Amazon Purchase', amount: '-$49.99', time: 'Today' },
                { desc: 'Salary Deposit', amount: '+$3,500.00', time: 'Yesterday' },
                { desc: 'Gas Station', amount: '-$35.50', time: '2 days ago' },
              ].map((tx, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0">
                  <div>
                    <p className="font-medium text-gray-900">{tx.desc}</p>
                    <p className="text-sm text-gray-500">{tx.time}</p>
                  </div>
                  <p className={`font-bold ${tx.amount.startsWith('-') ? 'text-red-600' : 'text-green-600'}`}>
                    {tx.amount}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition">
                Transfer Money
              </button>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition">
                Pay Bills
              </button>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition">
                View Statements
              </button>
              <button className="w-full bg-slate-600 hover:bg-slate-700 text-white font-medium py-3 rounded-lg transition">
                Account Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-gray-600 text-sm">
          <p>© 2024 Chase Banking. All rights reserved. Secure and Encrypted.</p>
        </div>
      </footer>
    </div>
  )
}
