'use client'

import { useEffect, useState } from 'react'
import { Credential, CredentialInput } from '@/lib/credentials-management'

export default function CredentialsPage() {
  const [activeTab, setActiveTab] = useState<'admin' | 'user'>('admin')
  const [credentials, setCredentials] = useState<Credential[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [formData, setFormData] = useState<CredentialInput>({
    email: '',
    password: '',
    full_name: '',
    status: 'active',
  })

  // Fetch credentials
  useEffect(() => {
    fetchCredentials()
  }, [activeTab, searchQuery])

  const fetchCredentials = async () => {
    try {
      setLoading(true)
      const url = new URL(`/api/credentials/${activeTab}`, window.location.origin)
      if (searchQuery) {
        url.searchParams.append('query', searchQuery)
      }

      const response = await fetch(url)
      const data = await response.json()
      setCredentials(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching credentials:', error)
      setMessage({ type: 'error', text: 'Failed to fetch credentials' })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (editingId) {
        const response = await fetch(`/api/credentials/${activeTab}/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to update credential')
        }

        setMessage({ type: 'success', text: 'Credential updated successfully' })
        setEditingId(null)
      } else {
        const response = await fetch(`/api/credentials/${activeTab}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to create credential')
        }

        setMessage({ type: 'success', text: 'Credential created successfully' })
      }

      setFormData({ email: '', password: '', full_name: '', status: 'active' })
      setShowForm(false)
      fetchCredentials()
    } catch (error) {
      const errorText = error instanceof Error ? error.message : 'An error occurred'
      setMessage({ type: 'error', text: errorText })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (credential: Credential) => {
    setEditingId(credential.id)
    setFormData({
      email: credential.email,
      password: '',
      full_name: credential.full_name,
      status: credential.status,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this credential?')) return

    try {
      setLoading(true)
      const response = await fetch(`/api/credentials/${activeTab}/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete credential')
      }

      setMessage({ type: 'success', text: 'Credential deleted successfully' })
      fetchCredentials()
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to delete credential',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({ email: '', password: '', full_name: '', status: 'active' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Credentials Management</h1>
          <p className="text-gray-600 mt-2">Manage admin and user login credentials</p>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-4 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => {
                setActiveTab('admin')
                setShowForm(false)
                setEditingId(null)
              }}
              className={`flex-1 px-6 py-4 text-sm font-medium text-center transition ${
                activeTab === 'admin'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Admin Credentials ({credentials.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('user')
                setShowForm(false)
                setEditingId(null)
              }}
              className={`flex-1 px-6 py-4 text-sm font-medium text-center transition ${
                activeTab === 'user'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              User Credentials ({credentials.length})
            </button>
          </div>

          <div className="p-6">
            {/* Search and Add Button */}
            <div className="flex gap-4 mb-6">
              <input
                type="text"
                placeholder="Search by email or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => {
                  if (showForm) {
                    handleCancel()
                  } else {
                    setShowForm(true)
                  }
                }}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  showForm
                    ? 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {showForm ? 'Cancel' : '+ Add Credential'}
              </button>
            </div>

            {/* Form */}
            {showForm && (
              <div className="mb-6 p-6 border border-gray-200 rounded-lg bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {editingId ? 'Edit' : 'Create New'} {activeTab === 'admin' ? 'Admin' : 'User'} Credential
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      disabled={editingId !== null}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password {editingId && '(leave blank to keep current)'}
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required={!editingId}
                      placeholder={editingId ? 'Leave blank to keep current password' : 'Enter password'}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char (!@#$%^&*)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value as 'active' | 'inactive',
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
                    >
                      {loading ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Credentials Table */}
            {loading && !showForm ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Loading credentials...</p>
              </div>
            ) : credentials.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">
                  No {activeTab} credentials found. {!searchQuery && 'Create one to get started.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Email</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Created</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {credentials.map((credential) => (
                      <tr key={credential.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-900">{credential.email}</td>
                        <td className="py-3 px-4 text-gray-900">{credential.full_name}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              credential.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {credential.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {new Date(credential.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleEdit(credential)}
                            className="text-blue-600 hover:text-blue-800 font-medium text-xs mr-3"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(credential.id)}
                            className="text-red-600 hover:text-red-800 font-medium text-xs"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
