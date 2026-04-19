'use client'

import { useState, useEffect } from 'react'
import { useRBAC } from '@/lib/hooks/useRBAC'

interface User {
  id: string
  email: string
  full_name: string
  role: 'user' | 'admin'
  created_at: string
}

export function UsersList() {
  const { isAdmin } = useRBAC()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingRole, setUpdatingRole] = useState<string | null>(null)

  useEffect(() => {
    if (!isAdmin) return

    const fetchUsers = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/admin/users')

        if (!response.ok) {
          throw new Error('Failed to fetch users')
        }

        const data = await response.json()
        setUsers(data.users || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch users')
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [isAdmin])

  const updateUserRole = async (userId: string, newRole: 'user' | 'admin') => {
    try {
      setUpdatingRole(userId)
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          role: newRole,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update user role')
      }

      const data = await response.json()
      setUsers(users.map(u => (u.id === userId ? { ...u, role: newRole } : u)))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update user role')
    } finally {
      setUpdatingRole(null)
    }
  }

  if (!isAdmin) {
    return <div className="text-red-600">Access Denied - Admin only</div>
  }

  if (loading) {
    return <div className="text-center py-8">Loading users...</div>
  }

  if (error) {
    return <div className="text-red-600">Error: {error}</div>
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Users ({users.length})</h2>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2 text-left">Email</th>
              <th className="border p-2 text-left">Name</th>
              <th className="border p-2 text-left">Role</th>
              <th className="border p-2 text-left">Joined</th>
              <th className="border p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="border p-2">{user.email}</td>
                <td className="border p-2">{user.full_name || '-'}</td>
                <td className="border p-2">
                  <span
                    className={`px-2 py-1 rounded text-sm font-medium ${
                      user.role === 'admin'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="border p-2 text-sm">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="border p-2">
                  <button
                    onClick={() =>
                      updateUserRole(user.id, user.role === 'admin' ? 'user' : 'admin')
                    }
                    disabled={updatingRole === user.id}
                    className="px-3 py-1 rounded text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
                  >
                    {updatingRole === user.id
                      ? 'Updating...'
                      : user.role === 'admin'
                        ? 'Demote'
                        : 'Promote'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
