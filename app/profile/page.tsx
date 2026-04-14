'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ProfileForm } from '@/components/profile-form'
import { StepUpAuthModal } from '@/components/stepup-auth-modal'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Lock, Mail, User, Briefcase, CreditCard } from 'lucide-react'
import { formatAccountNumberDisplay } from '@/lib/utils'

interface UserProfile {
  id: string
  email: string
  full_name?: string
  phone?: string
  accounts?: Array<{
    id: string
    account_type: string
    account_number: string
    balance: number
    currency: string
  }>
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [showStepUp, setShowStepUp] = useState(false)

  useEffect(() => {
    const getUserProfile = async () => {
      try {
        // Try to get user profile from session/auth endpoint
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
        } else {
          // Fallback to localStorage
          const storedEmail = localStorage.getItem('userEmail')
          if (storedEmail) {
            setUser({
              id: localStorage.getItem('userId') || '',
              email: storedEmail,
              full_name: localStorage.getItem('userName'),
            })
          }
        }
      } catch (error) {
        console.error('Failed to get user profile:', error)
        // Fallback to localStorage
        const storedEmail = localStorage.getItem('userEmail')
        if (storedEmail) {
          setUser({
            id: localStorage.getItem('userId') || '',
            email: storedEmail,
            full_name: localStorage.getItem('userName'),
          })
        }
      } finally {
        setLoading(false)
      }
    }

    getUserProfile()
  }, [])

  const handleStepUpRequired = () => {
    setShowStepUp(true)
  }

  const handleStepUpComplete = () => {
    setShowStepUp(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin">
          <Lock className="h-8 w-8 text-[#0a4fa6]" />
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4">
        <h1 className="text-2xl font-semibold">Access Required</h1>
        <p className="text-muted-foreground">Please log in to view your profile</p>
        <Button onClick={() => router.push('/auth/login')} className="bg-[#0a4fa6] hover:bg-[#083d80]">
          Go to Login
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background border-b">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="text-muted-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold flex-1">My Profile</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* User Information Card */}
        <Card className="p-6 bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-[#0a4fa6]" />
            Personal Information
          </h2>
          
          <div className="space-y-4">
            {/* Name */}
            {user.full_name && (
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="text-base font-medium text-foreground">{user.full_name}</p>
              </div>
            )}
            
            {/* Email */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Email Address</p>
              </div>
              <p className="text-base font-medium text-foreground">{user.email}</p>
            </div>
            
            {/* Phone */}
            {user.phone && (
              <div>
                <p className="text-sm text-muted-foreground">Phone Number</p>
                <p className="text-base font-medium text-foreground">{user.phone}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Accounts Overview */}
        {user.accounts && user.accounts.length > 0 && (
          <Card className="p-6 bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-[#0a4fa6]" />
              Your Accounts
            </h2>
            
            <div className="space-y-3">
              {user.accounts.map((account) => (
                <div key={account.id} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">{account.account_type} Account</p>
                      <p className="text-xs text-muted-foreground mt-1">{formatAccountNumberDisplay(account.account_number)}</p>
                    </div>
                    <CreditCard className="h-5 w-5 text-[#0a4fa6] flex-shrink-0" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    Balance: ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {account.currency}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Profile Form */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Edit Profile</h2>
          <ProfileForm email={user.email} onStepUpRequired={handleStepUpRequired} />
        </div>

        <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-600 dark:text-blue-400">
            💡 <strong>Tip:</strong> Changes to sensitive information may require additional verification for security.
          </p>
        </div>
      </div>

      {/* Step-Up Auth Modal */}
      <StepUpAuthModal
        isOpen={showStepUp}
        onClose={() => setShowStepUp(false)}
        onComplete={handleStepUpComplete}
        requirementReason="to update your profile information"
      />
    </div>
  )
}
