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
  Award
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useBanking } from "@/lib/banking-context"

export default function UserDashboardPage() {
  const router = useRouter()
  const [showBalances, setShowBalances] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  
  const { userProfile, accounts, transactions } = useBanking()

  useEffect(() => {
    // Check authentication
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
    .slice(0, 5)

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a4fa6]/5 to-white">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-[#0a4fa6] animate-spin" />
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#0a4fa6] to-[#117aca] text-white">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/10"
              onClick={() => router.push("/")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">User Dashboard</h1>
          </div>
          
          {/* User Profile Card */}
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-4 border-white/30">
              <AvatarImage 
                src={userProfile.profilePicture || userProfile.avatarUrl || "/placeholder.svg"} 
                alt={userProfile.name || ""} 
              />
              <AvatarFallback className="bg-white text-[#0a4fa6] text-2xl font-bold">
                {(userProfile.name || "U")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{userProfile.name || "User"}</h2>
              <p className="text-white/80 text-sm">{userProfile.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge className="bg-white/20 text-white border-0">
                  <Award className="h-3 w-3 mr-1" />
                  {userProfile.tier || "Member"}
                </Badge>
                <Badge className="bg-green-500/20 text-green-100 border-0">
                  <Shield className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Total Balance Card */}
        <Card className="border-0 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-[#0a4fa6] to-[#117aca] p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/80 text-sm font-medium">Total Account Balance</span>
              <Button
                variant="ghost"
                size="sm"
                className="text-white/80 hover:text-white hover:bg-white/10 gap-1"
                onClick={() => setShowBalances(!showBalances)}
              >
                {showBalances ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showBalances ? "Hide" : "Show"}
              </Button>
            </div>
            <p className="text-4xl font-bold">${formatBalance(totalBalance)}</p>
            <p className="text-white/70 text-sm mt-1">
              Available: ${formatBalance(totalAvailable)}
            </p>
          </div>
        </Card>

        {/* User Information */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-[#0a4fa6]" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="h-10 w-10 rounded-full bg-[#0a4fa6]/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-[#0a4fa6]" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Full Name</p>
                  <p className="font-semibold">{userProfile.name || "Not set"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="h-10 w-10 rounded-full bg-[#0a4fa6]/10 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-[#0a4fa6]" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Email Address</p>
                  <p className="font-semibold text-sm">{userProfile.email || "Not set"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="h-10 w-10 rounded-full bg-[#0a4fa6]/10 flex items-center justify-center">
                  <Phone className="h-5 w-5 text-[#0a4fa6]" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Phone Number</p>
                  <p className="font-semibold">{userProfile.phone || "Not set"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="h-10 w-10 rounded-full bg-[#0a4fa6]/10 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-[#0a4fa6]" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Address</p>
                  <p className="font-semibold text-sm">{userProfile.address || "Not set"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="h-10 w-10 rounded-full bg-[#0a4fa6]/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-[#0a4fa6]" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Member Since</p>
                  <p className="font-semibold">{formatDate(userProfile.memberSince || new Date().toISOString())}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="h-10 w-10 rounded-full bg-[#0a4fa6]/10 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-[#0a4fa6]" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Account Tier</p>
                  <p className="font-semibold">{userProfile.tier || "Standard"}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Accounts Overview */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Wallet className="h-5 w-5 text-[#0a4fa6]" />
              Accounts Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {accounts.map((account) => (
                <div 
                  key={account.id} 
                  className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      account.type === "checking" 
                        ? "bg-blue-100 text-blue-600" 
                        : account.type === "savings"
                        ? "bg-green-100 text-green-600"
                        : "bg-purple-100 text-purple-600"
                    }`}>
                      {account.type === "credit" ? (
                        <CreditCard className="h-5 w-5" />
                      ) : (
                        <Wallet className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">{account.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {account.type === "credit" ? "Credit Card" : account.type.charAt(0).toUpperCase() + account.type.slice(1)} 
                        {" · "}{account.accountNumber}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">${formatBalance(account.balance)}</p>
                    <p className="text-xs text-muted-foreground">
                      Available: ${formatBalance(account.availableBalance)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5 text-[#0a4fa6]" />
                Recent Transactions
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-[#0a4fa6]"
                onClick={() => router.push("/")}
              >
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((tx) => (
                  <div 
                    key={tx.id} 
                    className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        tx.type === "credit" ? "bg-green-100" : "bg-red-50"
                      }`}>
                        {tx.type === "credit" ? (
                          <TrendingUp className="h-5 w-5 text-green-600" />
                        ) : (
                          <TrendingDown className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm truncate max-w-[200px]">{tx.description}</p>
                        <p className="text-xs text-muted-foreground">{getRelativeTime(tx.date)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${tx.type === "credit" ? "text-green-600" : "text-foreground"}`}>
                        {tx.type === "credit" ? "+" : "-"}${tx.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </p>
                      <Badge 
                        variant="secondary" 
                        className={`text-[10px] ${
                          tx.status === "completed" 
                            ? "bg-green-100 text-green-700" 
                            : tx.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {tx.status}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No recent transactions</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Rewards Card */}
        <Card className="border-0 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-[#0a4fa6] to-[#117aca] p-6 text-white">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/90 font-medium">Chase Ultimate Rewards</span>
              <Badge className="bg-white/20 text-white border-0">
                {userProfile.tier || "Member"}
              </Badge>
            </div>
            <p className="text-4xl font-bold">
              {userProfile.ultimateRewardsPoints?.toLocaleString() || "0"}
            </p>
            <p className="text-white/70 text-sm">points available</p>
            <Button 
              variant="secondary" 
              size="sm" 
              className="mt-4 bg-white text-[#0a4fa6] hover:bg-white/90"
            >
              Redeem Points
            </Button>
          </div>
        </Card>

        {/* Back to Home Button */}
        <Button 
          className="w-full bg-[#0a4fa6] hover:bg-[#083d85] h-12"
          onClick={() => router.push("/")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home Dashboard
        </Button>
      </main>
    </div>
  )
}
