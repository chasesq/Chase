'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useNeonAuth } from '@/lib/auth/neon-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LogoutButton } from '@/components/logout-button'
import { Shield, Users, BarChart3, Settings, FileText } from 'lucide-react'

export default function AdminDashboard() {
  const { user, isAuthenticated } = useNeonAuth()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Check if user is authenticated and has admin role
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }

    // Check if user is admin by their email
    const adminEmails = ['admin@chase.com', 'manager@chase.com']
    if (user?.email && adminEmails.includes(user.email)) {
      setIsAdmin(true)
    } else {
      router.push('/')
    }
  }, [isAuthenticated, user, router])

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-destructive mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You do not have permission to access the admin panel</p>
          <Button className="mt-4" onClick={() => router.push('/')}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Chase Banking System</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right text-sm">
              <p className="text-foreground font-medium">{user?.name}</p>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
            <LogoutButton variant="outline" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2,543</div>
              <p className="text-xs text-muted-foreground">+180 this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">847</div>
              <p className="text-xs text-muted-foreground">Real-time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transactions</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12.5M</div>
              <p className="text-xs text-muted-foreground">Total volume</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Health</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">99.9%</div>
              <p className="text-xs text-muted-foreground">Uptime</p>
            </CardContent>
          </Card>
        </div>

        {/* Admin Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management
              </CardTitle>
              <CardDescription>Manage user accounts and permissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Quick Actions:</p>
                <div className="flex flex-col gap-2">
                  <Button variant="outline" className="w-full justify-start">
                    View All Users
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Create New User
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Manage Roles
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security & Compliance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security
              </CardTitle>
              <CardDescription>Monitor security and compliance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Security Actions:</p>
                <div className="flex flex-col gap-2">
                  <Button variant="outline" className="w-full justify-start">
                    View Audit Logs
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Security Settings
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    IP Whitelist
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reports */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Reports
              </CardTitle>
              <CardDescription>Generate and view system reports</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Available Reports:</p>
                <div className="flex flex-col gap-2">
                  <Button variant="outline" className="w-full justify-start">
                    User Activity Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Transaction Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    System Health Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                System Settings
              </CardTitle>
              <CardDescription>Configure system parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Configuration:</p>
                <div className="flex flex-col gap-2">
                  <Button variant="outline" className="w-full justify-start">
                    General Settings
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    API Configuration
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Notification Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent Admin Activity</CardTitle>
            <CardDescription>Last 5 administrative actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b">
                <div>
                  <p className="font-medium text-sm">User Authentication</p>
                  <p className="text-xs text-muted-foreground">Admin logged in</p>
                </div>
                <p className="text-xs text-muted-foreground">Just now</p>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <div>
                  <p className="font-medium text-sm">System Health Check</p>
                  <p className="text-xs text-muted-foreground">All systems operational</p>
                </div>
                <p className="text-xs text-muted-foreground">5 minutes ago</p>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <div>
                  <p className="font-medium text-sm">Database Backup</p>
                  <p className="text-xs text-muted-foreground">Backup completed successfully</p>
                </div>
                <p className="text-xs text-muted-foreground">1 hour ago</p>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-sm">User Registration</p>
                  <p className="text-xs text-muted-foreground">180 new users registered</p>
                </div>
                <p className="text-xs text-muted-foreground">Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
