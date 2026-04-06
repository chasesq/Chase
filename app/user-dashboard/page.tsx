"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  CreditCard,
  Wallet,
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff,
  ArrowLeft,
  Clock,
  ChevronRight,
  Building2,
  Award,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  MoreHorizontal,
  Copy,
  CheckCircle2
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useBanking } from "@/lib/banking-context"

export default function UserDashboardPage() {
  const router = useRouter()
  const [showBalances, setShowBalances] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null)
  
  const { userProfile, accounts, transactions } = useBanking()

  useEffect(() => {
    const profile = localStorage.getItem("user_profile")
    if (!profile) {
      router.push("/")
      return
    }
    setIsLoading(false)
  }, [router])

  const totalBalance = accounts.reduce((acc, curr) => acc + (curr.balance || 0), 0)
  const totalAvailable = accounts.reduce((acc, curr) => acc + (curr.availableBalance || 0), 0)

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6)

  const formatBalance = (balance?: number) => {
    if (!showBalances) return "••••••"
    const safeBalance = balance ?? 0
    return safeBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    })
  }

  const getRelativeTime = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return "Yesterday"
    return formatDate(dateString)
  }

  const copyAccountNumber = (accountNumber: string) => {
    navigator.clipboard.writeText(accountNumber)
    setCopiedAccount(accountNumber)
    setTimeout(() => setCopiedAccount(null), 2000)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="flex flex-col items-center gap-4">
          <div className="chase-spinner" />
          <p className="text-white/60 text-sm font-medium">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white/70 hover:text-white hover:bg-white/10 rounded-full"
                onClick={() => router.push("/")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-white">Dashboard</h1>
                <p className="text-xs text-white/50">Welcome back, {userProfile.name?.split(" ")[0] || "User"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-white/70 hover:text-white hover:bg-white/10 rounded-full gap-2"
                onClick={() => setShowBalances(!showBalances)}
              >
                {showBalances ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span className="hidden sm:inline">{showBalances ? "Hide" : "Show"}</span>
              </Button>
              <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10 rounded-full">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Net Account Value Card */}
        <Card className="border-0 bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1a] overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-white/50 text-sm font-medium mb-1">Net Account Value</p>
                <p className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                  ${formatBalance(totalBalance)}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className="bg-green-500/20 text-green-400 border-0 text-xs">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +2.5%
                  </Badge>
                  <span className="text-white/40 text-xs">Past Day</span>
                </div>
              </div>
              <Avatar className="h-14 w-14 border-2 border-white/20">
                <AvatarImage 
                  src={userProfile.profilePicture || userProfile.avatarUrl || "/placeholder.svg"} 
                  alt={userProfile.name || ""} 
                />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-700 text-white text-lg font-bold">
                  {(userProfile.name || "U")
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Mini Chart Placeholder */}
            <div className="h-24 w-full rounded-lg overflow-hidden mb-4">
              <svg viewBox="0 0 400 100" className="w-full h-full">
                <defs>
                  <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,80 Q50,70 100,60 T200,50 T300,30 T400,20 L400,100 L0,100 Z"
                  fill="url(#chartGradient)"
                />
                <path
                  d="M0,80 Q50,70 100,60 T200,50 T300,30 T400,20"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="2"
                />
              </svg>
            </div>

            <div className="flex items-center justify-between text-xs text-white/40">
              <span>1D</span>
              <span>1W</span>
              <span className="text-white">1M</span>
              <span>1Y</span>
              <span>All</span>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="border border-white/10 bg-white/5 backdrop-blur-xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Wallet className="h-4 w-4 text-blue-400" />
                <span className="text-xs text-green-400">+12%</span>
              </div>
              <p className="text-xs text-white/50 mb-1">Available</p>
              <p className="text-lg font-bold text-white">${formatBalance(totalAvailable)}</p>
            </CardContent>
          </Card>

          <Card className="border border-white/10 bg-white/5 backdrop-blur-xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <CreditCard className="h-4 w-4 text-purple-400" />
                <span className="text-xs text-white/40">{accounts.length}</span>
              </div>
              <p className="text-xs text-white/50 mb-1">Accounts</p>
              <p className="text-lg font-bold text-white">{accounts.length} Active</p>
            </CardContent>
          </Card>

          <Card className="border border-white/10 bg-white/5 backdrop-blur-xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span className="text-xs text-amber-400">+5,200</span>
              </div>
              <p className="text-xs text-white/50 mb-1">Rewards Points</p>
              <p className="text-lg font-bold text-white">
                {(userProfile.ultimateRewardsPoints || 0).toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card className="border border-white/10 bg-white/5 backdrop-blur-xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Shield className="h-4 w-4 text-emerald-400" />
                <Badge className="bg-emerald-500/20 text-emerald-400 border-0 text-[10px] px-1.5">Active</Badge>
              </div>
              <p className="text-xs text-white/50 mb-1">Account Status</p>
              <p className="text-lg font-bold text-white">{userProfile.tier || "Member"}</p>
            </CardContent>
          </Card>
        </div>

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Accounts List */}
          <Card className="border border-white/10 bg-white/5 backdrop-blur-xl">
            <CardHeader className="pb-3 border-b border-white/10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-base font-semibold">Your Accounts</CardTitle>
                <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 hover:bg-white/5 text-xs">
                  Manage
                  <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-white/5">
                {accounts.map((account) => (
                  <div 
                    key={account.id} 
                    className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                        account.type === "checking" 
                          ? "bg-blue-500/20 text-blue-400" 
                          : account.type === "savings"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-purple-500/20 text-purple-400"
                      }`}>
                        {account.type === "credit" ? (
                          <CreditCard className="h-5 w-5" />
                        ) : (
                          <Wallet className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-white text-sm">{account.name}</p>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs text-white/40">{account.accountNumber}</p>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation()
                              copyAccountNumber(account.accountNumber || "")
                            }}
                            className="text-white/30 hover:text-white/60 transition-colors"
                          >
                            {copiedAccount === account.accountNumber ? (
                              <CheckCircle2 className="h-3 w-3 text-green-400" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-white">${formatBalance(account.balance)}</p>
                      <p className="text-[10px] text-white/40">
                        Avail: ${formatBalance(account.availableBalance)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card className="border border-white/10 bg-white/5 backdrop-blur-xl">
            <CardHeader className="pb-3 border-b border-white/10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-base font-semibold">Profile Information</CardTitle>
                <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 hover:bg-white/5 text-xs">
                  Edit
                  <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {/* User ID Display */}
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center">
                  <Shield className="h-4 w-4 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-white/40 uppercase tracking-wider">User ID</p>
                  <div className="flex items-center gap-2">
                    <p className="font-mono font-medium text-white text-sm truncate">{userProfile.id || "Not set"}</p>
                    <button 
                      onClick={() => copyAccountNumber(userProfile.id || "")}
                      className="text-white/30 hover:text-white/60 transition-colors"
                    >
                      {copiedAccount === userProfile.id ? (
                        <CheckCircle2 className="h-3 w-3 text-green-400" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <User className="h-4 w-4 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-white/40 uppercase tracking-wider">Full Name</p>
                  <p className="font-medium text-white text-sm truncate">{userProfile.name || "Not set"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                <div className="h-8 w-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Mail className="h-4 w-4 text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-white/40 uppercase tracking-wider">Email</p>
                  <p className="font-medium text-white text-sm truncate">{userProfile.email || "Not set"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Phone className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-white/40 uppercase tracking-wider">Phone</p>
                  <p className="font-medium text-white text-sm truncate">{userProfile.phone || "Not set"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                <div className="h-8 w-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-white/40 uppercase tracking-wider">Address</p>
                  <p className="font-medium text-white text-sm truncate">{userProfile.address || "Not set"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <div className="h-8 w-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-white/40 uppercase tracking-wider">Member Since</p>
                    <p className="font-medium text-white text-xs">{formatDate(userProfile.memberSince || new Date().toISOString())}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <div className="h-8 w-8 rounded-full bg-rose-500/20 flex items-center justify-center">
                    <Award className="h-4 w-4 text-rose-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-white/40 uppercase tracking-wider">Tier</p>
                    <p className="font-medium text-white text-xs">{userProfile.tier || "Standard"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card className="border border-white/10 bg-white/5 backdrop-blur-xl">
          <CardHeader className="pb-3 border-b border-white/10">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-base font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-white/50" />
                Recent Transactions
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-blue-400 hover:text-blue-300 hover:bg-white/5 text-xs"
                onClick={() => router.push("/")}
              >
                View All
                <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-white/5">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((tx) => (
                  <div 
                    key={tx.id} 
                    className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                        tx.type === "credit" ? "bg-emerald-500/20" : "bg-red-500/20"
                      }`}>
                        {tx.type === "credit" ? (
                          <ArrowDownLeft className="h-5 w-5 text-emerald-400" />
                        ) : (
                          <ArrowUpRight className="h-5 w-5 text-red-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-white text-sm truncate max-w-[200px]">{tx.description}</p>
                        <p className="text-xs text-white/40">{getRelativeTime(tx.date)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${tx.type === "credit" ? "text-emerald-400" : "text-white"}`}>
                        {tx.type === "credit" ? "+" : "-"}${tx.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </p>
                      <Badge 
                        variant="secondary" 
                        className={`text-[10px] border-0 ${
                          tx.status === "completed" 
                            ? "bg-emerald-500/20 text-emerald-400" 
                            : tx.status === "pending"
                            ? "bg-amber-500/20 text-amber-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {tx.status}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center">
                  <Clock className="h-12 w-12 mx-auto mb-3 text-white/20" />
                  <p className="text-white/40 text-sm">No recent transactions</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Rewards Banner */}
        <Card className="border-0 bg-gradient-to-r from-blue-600 to-blue-800 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-5 w-5 text-amber-300" />
                  <span className="text-white/80 font-medium text-sm">Chase Ultimate Rewards</span>
                </div>
                <p className="text-3xl font-bold text-white mb-1">
                  {(userProfile.ultimateRewardsPoints || 0).toLocaleString()}
                </p>
                <p className="text-white/60 text-xs">points available for redemption</p>
              </div>
              <Button 
                variant="secondary" 
                size="sm" 
                className="bg-white text-blue-700 hover:bg-white/90 font-semibold"
              >
                Redeem Now
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Authentication Info Card */}
        <Card className="border border-white/10 bg-white/5 backdrop-blur-xl">
          <CardHeader className="pb-3 border-b border-white/10">
            <CardTitle className="text-white text-base font-semibold flex items-center gap-2">
              <Shield className="h-4 w-4 text-white/50" />
              Authentication with Supabase
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {/* Supabase Auth Info */}
            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <p className="text-xs font-bold text-emerald-400 uppercase tracking-wide mb-3">Secure Authentication</p>
              <div className="space-y-2 text-sm">
                <p className="text-white/80">This app uses Supabase for secure authentication with:</p>
                <ul className="text-white/70 text-xs space-y-1 ml-4 list-disc">
                  <li>Secure password hashing (bcrypt)</li>
                  <li>Unique User IDs for each account</li>
                  <li>Email verification support</li>
                  <li>Password recovery options</li>
                  <li>Row Level Security (RLS) for data protection</li>
                </ul>
              </div>
            </div>

            {/* Sign Up Instructions */}
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p className="text-xs font-bold text-blue-400 uppercase tracking-wide mb-3">Create Your Account</p>
              <div className="space-y-1.5 text-sm">
                <p className="text-white/80">Sign up at <a href="/auth/sign-up" className="text-blue-400 underline">/auth/sign-up</a> to create your account.</p>
                <p className="text-white/60 text-xs mt-2">Your unique User ID will be automatically generated upon registration.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back Button */}
        <Button 
          className="w-full bg-white/10 hover:bg-white/15 text-white border border-white/10 h-12"
          onClick={() => router.push("/")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        {/* Bottom Spacer */}
        <div className="h-6" />
      </main>
    </div>
  )
}
