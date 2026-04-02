'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

export interface TestUtilitiesPanelProps {
  adminId: string
}

export function TestUtilitiesPanel({ adminId }: TestUtilitiesPanelProps) {
  const [activeTab, setActiveTab] = useState<'funds' | 'transactions' | 'obligations' | 'history'>('funds')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')
  const [operations, setOperations] = useState<any[]>([])

  const [testForm, setTestForm] = useState({
    operation: 'add_funds',
    financialAccountId: '',
    amount: '',
    cardId: '',
    merchantName: '',
    creditPolicyId: '',
  })

  // Load operation history
  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    try {
      const response = await fetch(`/api/test-helpers?adminId=${adminId}`)
      const data = await response.json()
      if (data.success) {
        setOperations(data.operations || [])
      }
    } catch (error) {
      console.error('Failed to load history:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setTestForm(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const showMessage = (msg: string, type: 'success' | 'error') => {
    setMessage(msg)
    setMessageType(type)
    setTimeout(() => setMessage(''), 5000)
  }

  const executeTest = async () => {
    if (!testForm.financialAccountId && testForm.operation !== 'simulate_card_auth') {
      showMessage('Please select a financial account', 'error')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/test-helpers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId,
          operation: testForm.operation,
          financialAccountId: testForm.financialAccountId,
          amount: testForm.amount ? parseFloat(testForm.amount) : undefined,
          cardId: testForm.cardId,
          merchantName: testForm.merchantName || 'Test Merchant',
          creditPolicyId: testForm.creditPolicyId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        showMessage(data.error || 'Operation failed', 'error')
        return
      }

      showMessage(`${testForm.operation} executed successfully!`, 'success')
      loadHistory()

      // Reset form
      setTestForm(prev => ({
        ...prev,
        amount: '',
        cardId: '',
        merchantName: '',
        creditPolicyId: '',
      }))
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'An error occurred', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {['funds', 'transactions', 'obligations', 'history'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 font-medium text-sm transition ${
              activeTab === tab
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab === 'funds' && 'Add Test Funds'}
            {tab === 'transactions' && 'Simulate Transactions'}
            {tab === 'obligations' && 'Simulate Obligations'}
            {tab === 'history' && 'Operation History'}
          </button>
        ))}
      </div>

      {/* Messages */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            messageType === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {message}
        </div>
      )}

      {/* Add Test Funds */}
      {activeTab === 'funds' && (
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Test Funds</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Financial Account ID *
              </label>
              <input
                type="text"
                name="financialAccountId"
                value={testForm.financialAccountId}
                onChange={handleInputChange}
                placeholder="fa_123456..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount (USD) *
              </label>
              <input
                type="number"
                name="amount"
                value={testForm.amount}
                onChange={handleInputChange}
                placeholder="10000"
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button
              onClick={() => {
                setTestForm(prev => ({ ...prev, operation: 'add_funds' }))
                executeTest()
              }}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition"
            >
              {loading ? 'Adding Funds...' : 'Add Test Funds'}
            </Button>
          </div>
        </div>
      )}

      {/* Simulate Transactions */}
      {activeTab === 'transactions' && (
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Simulate Card Transaction</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Card ID *
              </label>
              <input
                type="text"
                name="cardId"
                value={testForm.cardId}
                onChange={handleInputChange}
                placeholder="ic_123456..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Transaction Amount (USD) *
              </label>
              <input
                type="number"
                name="amount"
                value={testForm.amount}
                onChange={handleInputChange}
                placeholder="100"
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Merchant Name
              </label>
              <input
                type="text"
                name="merchantName"
                value={testForm.merchantName}
                onChange={handleInputChange}
                placeholder="e.g., Coffee Shop, Amazon"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button
              onClick={() => {
                setTestForm(prev => ({ ...prev, operation: 'simulate_card_auth' }))
                executeTest()
              }}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition"
            >
              {loading ? 'Simulating...' : 'Simulate Transaction'}
            </Button>
          </div>
        </div>
      )}

      {/* Simulate Obligations */}
      {activeTab === 'obligations' && (
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Simulate Funding Obligation</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Financial Account ID *
              </label>
              <input
                type="text"
                name="financialAccountId"
                value={testForm.financialAccountId}
                onChange={handleInputChange}
                placeholder="fa_123456..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Credit Policy ID *
              </label>
              <input
                type="text"
                name="creditPolicyId"
                value={testForm.creditPolicyId}
                onChange={handleInputChange}
                placeholder="credit_policy_..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Obligation Amount (USD) *
              </label>
              <input
                type="number"
                name="amount"
                value={testForm.amount}
                onChange={handleInputChange}
                placeholder="5000"
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button
              onClick={() => {
                setTestForm(prev => ({ ...prev, operation: 'simulate_obligation' }))
                executeTest()
              }}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition"
            >
              {loading ? 'Simulating...' : 'Simulate Obligation'}
            </Button>
          </div>
        </div>
      )}

      {/* Operation History */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Operations</h3>
            <Button
              onClick={loadHistory}
              className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-1 px-3 rounded-lg text-sm transition"
            >
              Refresh
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Operation</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Status</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Amount</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Created</th>
                </tr>
              </thead>
              <tbody>
                {operations.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-4 px-3 text-center text-gray-500">
                      No operations yet
                    </td>
                  </tr>
                ) : (
                  operations.map((op: any) => (
                    <tr key={op.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-3 font-medium text-gray-900">
                        {op.operation_type.replace(/_/g, ' ')}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            op.status === 'success'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {op.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-gray-700">
                        {op.amount ? `$${op.amount.toLocaleString()}` : '-'}
                      </td>
                      <td className="py-3 px-3 text-gray-500 text-xs">
                        {new Date(op.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
