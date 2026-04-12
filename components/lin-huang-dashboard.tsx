'use client'

import { useEffect, useState } from 'react'
import { LinHuangWelcomeCard } from '@/components/lin-huang-welcome-card'
import { LinHuangAccountsHighlight } from '@/components/lin-huang-accounts-highlight'
import { LinHuangQuickActions } from '@/components/lin-huang-quick-actions'
import { LinHuangActivityTracker } from '@/components/lin-huang-activity-tracker'
import { useBanking } from '@/hooks/use-banking'

export function LinHuangDashboard() {
  const { userProfile } = useBanking()
  const [userEmail, setUserEmail] = useState<string>('')
  const [userName, setUserName] = useState<string>('Lin Huang')

  useEffect(() => {
    const email = localStorage.getItem('userEmail')
    const profile = localStorage.getItem('user_profile')
    
    if (email) {
      setUserEmail(email)
    }

    if (profile) {
      try {
        const parsedProfile = JSON.parse(profile)
        if (parsedProfile.full_name) {
          setUserName(parsedProfile.full_name)
        }
      } catch (error) {
        console.error('Failed to parse user profile')
      }
    }
  }, [userProfile])

  // Check if this is Lin Huang
  const isLinHuang = userEmail === 'linhuang011@gmail.com' || userProfile?.email === 'linhuang011@gmail.com'

  if (!isLinHuang) {
    return null
  }

  const userAccounts = userProfile?.accounts || [
    {
      id: 'acc-lin-checking-001',
      name: 'Checking Account',
      type: 'checking',
      number: 'CHK-****7890',
      balance: 0,
      currency: 'USD',
    },
    {
      id: 'acc-lin-savings-001',
      name: 'Savings Account',
      type: 'savings',
      number: 'SAV-****7891',
      balance: 0,
      currency: 'USD',
    },
  ]

  const demoActivities = [
    {
      id: '1',
      type: 'transfer_in' as const,
      amount: userProfile?.balance || 0,
      description: 'Recent Transfer',
      timestamp: new Date(),
      status: 'completed' as const,
    },
  ]

  return (
    <div className="w-full space-y-6 p-4 md:p-6">
      {/* Welcome Card */}
      <LinHuangWelcomeCard userName={userName} />

      {/* Account Balance & Status */}
      <LinHuangAccountsHighlight accounts={userAccounts} />

      {/* Quick Actions */}
      <LinHuangQuickActions
        onReceiveTransfer={() => console.log('Receive transfer clicked')}
        onViewDetails={() => console.log('View details clicked')}
        onNotifications={() => console.log('Notifications clicked')}
        onSettings={() => console.log('Settings clicked')}
      />

      {/* Activity Tracker */}
      <LinHuangActivityTracker activities={demoActivities} />
    </div>
  )
}
