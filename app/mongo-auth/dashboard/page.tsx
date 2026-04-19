"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"

interface Account {
  userId: string
  balance: number
  accountNumber: string
}

interface Transaction {
  _id: string
  fromUserId: string
  toUserId: string
  amount: number
  type: string
  description: string
  date: string
}

interface UserData {
  id: string
  username: string
  email: string
  role: string
}

export default function MongoDashboardPage() {
  const router = useRouter()
  const [account, setAccount] = useState<Account | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [user, setUser] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  // Transfer state
  const [transferTo, setTransferTo] = useState("")
  const [transferAmount, setTransferAmount] = useState("")
  const [transferDescription, setTransferDescription] = useState("")
  const [transferLoading, setTransferLoading] = useState(false)
  const [transferMessage, setTransferMessage] = useState("")

  const fetchWithRefresh = useCallback(async (url: string, options?: RequestInit) => {
    let res = await fetch(url, options)

    // If 401, try refreshing the token
    if (res.status === 401) {
      const refreshRes = await fetch("/api/mongo/auth/refresh", { method: "POST" })
      if (refreshRes.ok) {
        // Retry the original request
        res = await fetch(url, options)
      } else {
        // Refresh failed, redirect to login
        router.push("/mongo-auth/login")
        throw new Error("Session expired")
      }
    }

    return res
  }, [router])

  const fetchData = useCallback(async () => {
    try {
      // Fetch account data
      const accountRes = await fetchWithRefresh("/api/mongo/account")
      const accountData = await accountRes.json()

      if (accountData.success) {
        setAccount(accountData.account)
        setUser(accountData.user)
      } else {
        setError("Failed to load account")
        return
      }

      // Fetch transactions
      const txRes = await fetchWithRefresh("/api/mongo/transactions")
      const txData = await txRes.json()

      if (txData.success) {
        setTransactions(txData.transactions)
      }
    } catch (err) {
      if (err instanceof Error && err.message !== "Session expired") {
        setError("An error occurred loading your data")
      }
    } finally {
      setIsLoading(false)
    }
  }, [fetchWithRefresh])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault()
    setTransferMessage("")
    setTransferLoading(true)

    try {
      const res = await fetchWithRefresh("/api/mongo/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toUserId: transferTo,
          amount: parseFloat(transferAmount),
          description: transferDescription || "Transfer",
        }),
      })

      const data = await res.json()

      if (data.success) {
        setTransferMessage("Transfer successful!")
        setTransferTo("")
        setTransferAmount("")
        setTransferDescription("")
        // Refresh data
        fetchData()
      } else {
        setTransferMessage(data.message || "Transfer failed")
      }
    } catch {
      setTransferMessage("An error occurred")
    } finally {
      setTransferLoading(false)
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <h1 className="text-xl font-bold text-foreground">Chase Bank</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {user?.username}
              {user?.role === "admin" && (
                <span className="ml-2 rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  Admin
                </span>
              )}
            </span>
            {user?.role === "admin" && (
              <button
                onClick={() => router.push("/mongo-auth/admin")}
                className="rounded-md bg-muted px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted/80"
              >
                Admin Panel
              </button>
            )}
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
        <div className="grid gap-8 md:grid-cols-2">
          {/* Account Balance */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground">
              Account Balance
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Account #{account?.accountNumber}
            </p>
            <p className="mt-4 text-4xl font-bold text-foreground">
              ${account?.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          </div>

          {/* Transfer Funds */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground">
              Transfer Funds
            </h2>
            <form onSubmit={handleTransfer} className="mt-4 space-y-4">
              {transferMessage && (
                <div
                  className={`rounded-md p-3 text-sm ${
                    transferMessage.includes("successful")
                      ? "bg-green-500/10 text-green-600"
                      : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {transferMessage}
                </div>
              )}
              <input
                type="text"
                placeholder="Recipient username"
                value={transferTo}
                onChange={(e) => setTransferTo(e.target.value)}
                required
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <input
                type="number"
                placeholder="Amount"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                required
                min="0.01"
                step="0.01"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <input
                type="text"
                placeholder="Description (optional)"
                value={transferDescription}
                onChange={(e) => setTransferDescription(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="submit"
                disabled={transferLoading}
                className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {transferLoading ? "Processing..." : "Send Transfer"}
              </button>
            </form>
          </div>
        </div>

        {/* Transaction History */}
        <div className="mt-8 rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">
            Recent Transactions
          </h2>
          <div className="mt-4 overflow-x-auto">
            {transactions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No transactions yet</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-3 font-medium text-muted-foreground">Date</th>
                    <th className="pb-3 font-medium text-muted-foreground">Description</th>
                    <th className="pb-3 font-medium text-muted-foreground">From/To</th>
                    <th className="pb-3 text-right font-medium text-muted-foreground">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => {
                    const isIncoming = tx.toUserId === user?.username
                    return (
                      <tr key={tx._id} className="border-b border-border/50">
                        <td className="py-3 text-foreground">
                          {new Date(tx.date).toLocaleDateString()}
                        </td>
                        <td className="py-3 text-foreground">{tx.description}</td>
                        <td className="py-3 text-muted-foreground">
                          {isIncoming ? `From: ${tx.fromUserId}` : `To: ${tx.toUserId}`}
                        </td>
                        <td
                          className={`py-3 text-right font-medium ${
                            isIncoming ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {isIncoming ? "+" : "-"}${tx.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
