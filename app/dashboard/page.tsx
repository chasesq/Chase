"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  User, 
  Shield, 
  Settings, 
  LogOut, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard,
  Calendar,
  Edit2,
  Save,
  X,
  Copy,
  CheckCircle2,
  ArrowLeft,
  Key,
  Eye,
  EyeOff,
  Loader2
} from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const { user, profile, isLoading, isAuthenticated, signOut, updateProfile, updatePassword } = useAuth()
  
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    address: "",
    username: "",
  })
  
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  })
  
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login")
    }
  }, [isLoading, isAuthenticated, router])

  // Populate form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        address: profile.address || "",
        username: profile.username || "",
      })
    }
  }, [profile])

  const handleCopyUserId = async () => {
    if (user?.id) {
      await navigator.clipboard.writeText(user.id)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleSaveProfile = async () => {
    setIsSaving(true)
    setError(null)
    setSuccess(null)

    const { error } = await updateProfile(formData)
    
    if (error) {
      setError(error.message)
    } else {
      setSuccess("Profile updated successfully")
      setIsEditing(false)
    }
    
    setIsSaving(false)
  }

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (passwordData.newPassword.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    setPasswordLoading(true)
    setError(null)
    setSuccess(null)

    const { error } = await updatePassword(passwordData.newPassword)
    
    if (error) {
      setError(error.message)
    } else {
      setSuccess("Password updated successfully")
      setPasswordData({ newPassword: "", confirmPassword: "" })
      setShowPasswordForm(false)
    }
    
    setPasswordLoading(false)
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/auth/login")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Back to App</span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-white">{profile?.full_name || user.email}</p>
              <p className="text-xs text-white/50">{profile?.tier || "Member"}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-white/60 hover:text-white hover:bg-white/10"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Account Dashboard</h1>
          <p className="text-white/60 mt-1">Manage your profile and security settings</p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            {success}
          </div>
        )}

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-white/5 border border-white/10 p-1">
            <TabsTrigger value="profile" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/60">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/60">
              <Shield className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="account" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/60">
              <Settings className="h-4 w-4 mr-2" />
              Account
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            {/* User ID Card */}
            <Card className="border border-white/10 bg-white/5 backdrop-blur-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                  User ID
                </CardTitle>
                <CardDescription className="text-white/50">
                  Your unique identifier in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-black/20 border border-white/10">
                  <code className="flex-1 font-mono text-sm text-white/80 truncate">{user.id}</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyUserId}
                    className="text-white/60 hover:text-white shrink-0"
                  >
                    {copied ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Profile Information Card */}
            <Card className="border border-white/10 bg-white/5 backdrop-blur-xl">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-white text-lg">Profile Information</CardTitle>
                  <CardDescription className="text-white/50">
                    Update your personal details
                  </CardDescription>
                </div>
                {!isEditing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsEditing(false)
                        if (profile) {
                          setFormData({
                            full_name: profile.full_name || "",
                            phone: profile.phone || "",
                            address: profile.address || "",
                            username: profile.username || "",
                          })
                        }
                      }}
                      className="text-white/60 hover:text-white"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white/70 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Full Name
                    </Label>
                    {isEditing ? (
                      <Input
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        className="bg-black/20 border-white/10 text-white"
                      />
                    ) : (
                      <p className="text-white p-2">{profile?.full_name || "Not set"}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white/70 flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    <p className="text-white p-2">{user.email}</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white/70 flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone
                    </Label>
                    {isEditing ? (
                      <Input
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="bg-black/20 border-white/10 text-white"
                        placeholder="+1 (555) 000-0000"
                      />
                    ) : (
                      <p className="text-white p-2">{profile?.phone || "Not set"}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white/70 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Username
                    </Label>
                    {isEditing ? (
                      <Input
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className="bg-black/20 border-white/10 text-white"
                        placeholder="johndoe"
                      />
                    ) : (
                      <p className="text-white p-2">{profile?.username || "Not set"}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-white/70 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Address
                  </Label>
                  {isEditing ? (
                    <Input
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="bg-black/20 border-white/10 text-white"
                      placeholder="123 Main St, City, State 12345"
                    />
                  ) : (
                    <p className="text-white p-2">{profile?.address || "Not set"}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card className="border border-white/10 bg-white/5 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Change Password
                </CardTitle>
                <CardDescription className="text-white/50">
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!showPasswordForm ? (
                  <Button
                    variant="outline"
                    onClick={() => setShowPasswordForm(true)}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Change Password
                  </Button>
                ) : (
                  <div className="space-y-4 max-w-md">
                    <div className="space-y-2">
                      <Label className="text-white/70">New Password</Label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          className="bg-black/20 border-white/10 text-white pr-10"
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white/70">Confirm Password</Label>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          className="bg-black/20 border-white/10 text-white pr-10"
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setShowPasswordForm(false)
                          setPasswordData({ newPassword: "", confirmPassword: "" })
                        }}
                        className="text-white/60 hover:text-white"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleChangePassword}
                        disabled={passwordLoading}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {passwordLoading ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : null}
                        Update Password
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border border-white/10 bg-white/5 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white text-lg">Security Information</CardTitle>
                <CardDescription className="text-white/50">
                  Your account security details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/10">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-emerald-400" />
                    <div>
                      <p className="text-white font-medium">Email Verified</p>
                      <p className="text-xs text-white/50">{user.email}</p>
                    </div>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/10">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-blue-400" />
                    <div>
                      <p className="text-white font-medium">Account Created</p>
                      <p className="text-xs text-white/50">
                        {profile?.created_at 
                          ? new Date(profile.created_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric"
                            })
                          : "Unknown"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            <Card className="border border-white/10 bg-white/5 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white text-lg">Account Statistics</CardTitle>
                <CardDescription className="text-white/50">
                  Overview of your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-black/20 border border-white/10 text-center">
                    <p className="text-2xl font-bold text-white">{profile?.tier || "Standard"}</p>
                    <p className="text-xs text-white/50 mt-1">Account Tier</p>
                  </div>
                  <div className="p-4 rounded-lg bg-black/20 border border-white/10 text-center">
                    <p className="text-2xl font-bold text-emerald-400">
                      ${(profile?.balance || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-white/50 mt-1">Balance</p>
                  </div>
                  <div className="p-4 rounded-lg bg-black/20 border border-white/10 text-center">
                    <p className="text-2xl font-bold text-white">
                      {profile?.member_since 
                        ? new Date(profile.member_since).getFullYear()
                        : new Date().getFullYear()}
                    </p>
                    <p className="text-xs text-white/50 mt-1">Member Since</p>
                  </div>
                  <div className="p-4 rounded-lg bg-black/20 border border-white/10 text-center">
                    <p className="text-2xl font-bold text-blue-400">
                      {profile?.account_number ? "****" + profile.account_number.slice(-4) : "N/A"}
                    </p>
                    <p className="text-xs text-white/50 mt-1">Account</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-red-500/20 bg-red-500/5 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-red-400 text-lg">Danger Zone</CardTitle>
                <CardDescription className="text-white/50">
                  Irreversible account actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 rounded-lg bg-black/20 border border-red-500/20">
                  <div>
                    <p className="text-white font-medium">Sign Out</p>
                    <p className="text-xs text-white/50">Sign out of your account on this device</p>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={handleSignOut}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
