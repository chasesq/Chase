"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"

interface UserWithBalance {
  _id: string
  username: string
  email: string
  role: string
  balance: number
  accountNumber: string
  createdAt: string
}

export default function MongoAdminPage() {
  const router = useRouter()
  const [users, setUsers] = useState<UserWithBalance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [updateMessage, setUpdateMessage] = useState("")

  const fetchWithRefresh = useCallback(async (url: string, options?: RequestInit) => {
    let res = await fetch(url, options)

    if (res.status === 401) {
      const refreshRes = await fetch("/api/mongo/auth/refresh", { method: "POST" })
      if (refreshRes.ok) {
        res = await fetch(url, options)
      } else {
        router.push("/mongo-auth/login")
        throw new Error("Session expired")
      }
    }

    return res
  }, [router])

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetchWithRefresh("/api/mongo/admin/users")
      const data = await res.json()

      if (data.success) {
        setUsers(data.users)
      } else {
        if (res.status === 403) {
          setError("Access denied. Admins only.")
          setTimeout(() => router.push("/mongo-auth/dashboard"), 2000)
        } else {
          setError(data.message || "Failed to load users")
        }
      }
    } catch (err) {
      if (err instanceof Error && err.message !== "Session expired") {
        setError("An error occurred")
      }
    } finally {
      setIsLoading(false)
    }
  }, [fetchWithRefresh, router])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleRoleChange = async (username: string, newRole: string) => {
    setUpdateMessage("")
    try {
      const res = await fetchWithRefresh("/api/mongo/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, role: newRole }),
      })

      const data = await res.json()

      if (data.success) {
        setUpdateMessage(`Updated ${username} to ${newRole}`)
        fetchUsers()
      } else {
        setUpdateMessage(data.message || "Update failed")
      }
    } catch {
      setUpdateMessage("An error occurred")
    }
  }

  const handleLogout = async () => {
    await fetch("/api/mongo/auth/logout", { method: "POST" })
    router.push("/mongo-auth/login")
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-lg text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-lg text-destructive">{error}</div>
      </div>
    )
  }

  const totalBalance = users.reduce((sum, user) => sum + user.balance, 0)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
            <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              MongoDB
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/mongo-auth/dashboard")}
              className="rounded-md bg-muted px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted/80"
            >
              My Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="rounded-md bg-destructive/10 px-3 py-1.5 text-sm font-medium text-destructive hover:bg-destructive/20"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">Total Users</p>
            <p className="mt-1 text-3xl font-bold text-foreground">{users.length}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">Total Deposits</p>
            <p className="mt-1 text-3xl font-bold text-foreground">
              ${totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">Admin Users</p>
            <p className="mt-1 text-3xl font-bold text-foreground">
              {users.filter((u) => u.role === "admin").length}
            </p>
          </div>
        </div>

        {/* Update Message */}
        {updateMessage && (
          <div
            className={`mt-6 rounded-md p-4 text-sm ${
              updateMessage.includes("Updated")
                ? "bg-green-500/10 text-green-600"
                : "bg-destructive/10 text-destructive"
            }`}
          >
            {updateMessage}
          </div>
        )}

        {/* Users Table */}
        <div className="mt-8 rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">All Users</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-3 font-medium text-muted-foreground">Username</th>
                  <th className="pb-3 font-medium text-muted-foreground">Email</th>
                  <th className="pb-3 font-medium text-muted-foreground">Account #</th>
                  <th className="pb-3 text-right font-medium text-muted-foreground">Balance</th>
                  <th className="pb-3 font-medium text-muted-foreground">Role</th>
                  <th className="pb-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-b border-border/50">
                    <td className="py-3 font-medium text-foreground">{user.username}</td>
                    <td className="py-3 text-muted-foreground">{user.email}</td>
                    <td className="py-3 text-muted-foreground">{user.accountNumber}</td>
                    <td className="py-3 text-right text-foreground">
                      ${user.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3">
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-medium ${
                          user.role === "admin"
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.username, e.target.value)}
                        className="rounded border border-input bg-background px-2 py-1 text-xs text-foreground"
                      >
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
