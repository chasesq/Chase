'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Smartphone, Monitor, Tablet, Globe, LogOut, MoreVertical, AlertCircle } from 'lucide-react'

interface Session {
  id: string
  device: string
  browser: string
  location: string
  ipAddress: string
  lastActive: string
  isCurrent: boolean
  createdAt: string
}

const mockSessions: Session[] = [
  {
    id: '1',
    device: 'MacBook Pro',
    browser: 'Chrome',
    location: 'San Francisco, CA',
    ipAddress: '192.168.1.100',
    lastActive: 'Just now',
    isCurrent: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    device: 'iPhone 15',
    browser: 'Safari',
    location: 'San Francisco, CA',
    ipAddress: '192.168.1.101',
    lastActive: '2 hours ago',
    isCurrent: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    device: 'Windows PC',
    browser: 'Firefox',
    location: 'New York, NY',
    ipAddress: '203.0.113.42',
    lastActive: '3 days ago',
    isCurrent: false,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

function getDeviceIcon(device: string) {
  if (device.toLowerCase().includes('iphone') || device.toLowerCase().includes('mobile')) {
    return <Smartphone className="w-5 h-5" />
  }
  if (device.toLowerCase().includes('ipad') || device.toLowerCase().includes('tablet')) {
    return <Tablet className="w-5 h-5" />
  }
  return <Monitor className="w-5 h-5" />
}

export function SessionManagement() {
  const [sessions, setSessions] = useState<Session[]>(mockSessions)
  const [isLoading, setIsLoading] = useState(false)

  const handleSignOutSession = async (sessionId: string) => {
    setIsLoading(true)
    try {
      // API call to sign out session
      await fetch('/api/auth/sessions/sign-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })

      setSessions(sessions.filter(s => s.id !== sessionId))
    } catch (error) {
      console.error('Error signing out session:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOutAllOthers = async () => {
    setIsLoading(true)
    try {
      await fetch('/api/auth/sessions/sign-out-all-others', {
        method: 'POST',
      })

      setSessions(sessions.filter(s => s.isCurrent))
    } catch (error) {
      console.error('Error signing out other sessions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Active Sessions</CardTitle>
            <CardDescription>Manage your active sessions across devices</CardDescription>
          </div>
          <Button
            onClick={handleSignOutAllOthers}
            variant="outline"
            size="sm"
            disabled={isLoading || sessions.filter(s => !s.isCurrent).length === 0}
          >
            Sign Out Others
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="flex items-start justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-start gap-4 flex-1">
              <div className="text-muted-foreground mt-1">
                {getDeviceIcon(session.device)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-foreground">{session.device}</p>
                  {session.isCurrent && (
                    <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 text-xs rounded-full">
                      Current session
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{session.browser}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    {session.location}
                  </span>
                  <span>{session.ipAddress}</span>
                  <span>{session.lastActive}</span>
                </div>
              </div>
            </div>
            {!session.isCurrent && (
              <Button
                onClick={() => handleSignOutSession(session.id)}
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                disabled={isLoading}
              >
                <LogOut className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}

        {sessions.length === 1 && (
          <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Only your current session is active. Add other devices for better security monitoring.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
