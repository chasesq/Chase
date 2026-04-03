'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LogoutButton } from '@/components/logout-button'
import { SessionManagement } from '@/components/session-management'
import { SecurityStatusDashboard } from '@/components/security-status-dashboard'
import { AuthorizedApplications } from '@/components/authorized-applications'
import { User, Mail, Calendar, Shield, LogOut, ArrowLeft, Copy, Check } from 'lucide-react'

interface UserProfile {
  id: string
  name: string | null
  email: string
  createdAt: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    // Check authentication on mount
    const checkAuth = async () => {
      try {
        const sessionCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith('session='))
        
        if (!sessionCookie) {
          router.push('/auth/login')
          return
        }
        
        const email = sessionCookie.split('=')[1]
        setUser({ email, name: email.split('@')[0] })
        setIsAuthenticated(true)
        setProfile({
          id: email.split('@')[0],
          name: email.split('@')[0],
          email: email,
          createdAt: new Date().toISOString(),
        })
      } catch (error) {
        console.error('[v0] Auth check failed:', error)
        router.push('/auth/login')
      } finally {
        setIsLoading(false)
      }
    }
    
    checkAuth()
  }, [router])
  const [copiedField, setCopiedField] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login')
      return
    }

    if (user) {
      setProfile({
        id: user.id || '',
        name: user.name || 'User',
        email: user.email || '',
        createdAt: new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
      })
      setEditName(user.name || '')
    }
  }, [user, isAuthenticated, isLoading, router])

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      alert('Name cannot be empty')
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName }),
      })

      if (!response.ok) throw new Error('Failed to update profile')

      setProfile(prev => prev ? { ...prev, name: editName } : null)
      setIsEditing(false)
      setSuccessMessage('Profile updated successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="animate-pulse text-center">
          <div className="h-12 w-12 bg-primary/20 rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !profile) {
    return null
  }

  return (
    <div className="min-h-screen bg-background scroll-container">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-foreground">My Profile</h1>
            <p className="text-sm text-muted-foreground">Manage your account settings</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-200">{successMessage}</p>
          </div>
        )}

        {/* Profile Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/50 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{profile.name}</CardTitle>
                  <CardDescription className="text-base">{profile.email}</CardDescription>
                </div>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <p>Member since</p>
                <p className="font-medium text-foreground">{profile.createdAt}</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Personal Information Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal Information
            </CardTitle>
            <CardDescription>Update your profile details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-base font-medium">Full Name</Label>
              {isEditing ? (
                <div className="flex gap-2">
                  <Input
                    id="name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Enter your name"
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="px-4"
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    onClick={() => {
                      setIsEditing(false)
                      setEditName(profile.name || '')
                    }}
                    variant="outline"
                    className="px-4"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <p className="text-foreground">{profile.name}</p>
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="ghost"
                    size="sm"
                  >
                    Edit
                  </Button>
                </div>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label className="text-base font-medium flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </Label>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <p className="text-foreground text-sm break-all">{profile.email}</p>
                <button
                  onClick={() => handleCopy(profile.email, 'email')}
                  className="p-2 hover:bg-background rounded transition-colors"
                  aria-label="Copy email"
                >
                  {copiedField === 'email' ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">Email address cannot be changed</p>
            </div>

            {/* User ID Field */}
            <div className="space-y-2">
              <Label className="text-base font-medium">User ID</Label>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg font-mono text-sm">
                <p className="text-foreground break-all">{profile.id}</p>
                <button
                  onClick={() => handleCopy(profile.id, 'id')}
                  className="p-2 hover:bg-background rounded transition-colors flex-shrink-0"
                  aria-label="Copy user ID"
                >
                  {copiedField === 'id' ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>

            {/* Account Created Date */}
            <div className="space-y-2">
              <Label className="text-base font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Account Created
              </Label>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-foreground">{profile.createdAt}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security
            </CardTitle>
            <CardDescription>Manage your account security settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start">
              Change Password
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Two-Factor Authentication
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Active Sessions
            </Button>
          </CardContent>
        </Card>

        {/* Security Status Dashboard */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Security Center</h2>
          <SecurityStatusDashboard />
        </div>

        {/* Authorized Applications */}
        <div className="mb-8">
          <AuthorizedApplications />
        </div>

        {/* Session Management */}
        <div className="mb-8">
          <SessionManagement />
        </div>

        {/* Danger Zone */}
        <Card className="border-destructive/20 mb-6">
          <CardHeader>
            <CardTitle className="text-lg text-destructive">Danger Zone</CardTitle>
            <CardDescription>Irreversible actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full text-destructive hover:text-destructive">
              Download My Data
            </Button>
            <Button variant="outline" className="w-full text-destructive hover:text-destructive">
              Delete Account
            </Button>
          </CardContent>
        </Card>

        {/* Sign Out Button */}
        <div className="flex gap-4">
          <LogoutButton className="flex-1" variant="outline" />
        </div>
      </div>
    </div>
  )
}
