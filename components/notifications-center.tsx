'use client'

import { useState, useEffect } from 'react'
import { Bell, X, Settings, CheckCircle2, AlertCircle, Gift, DollarSign, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useNeonAuth } from '@/lib/auth/neon-context'

interface Notification {
  id: string
  title: string
  message: string
  type: 'transaction' | 'security' | 'promotion' | 'billing' | 'general'
  is_read: boolean
  created_at: string
  action_url?: string
  action_label?: string
}

const typeIcons = {
  transaction: <DollarSign className="w-4 h-4 text-blue-500" />,
  security: <AlertCircle className="w-4 h-4 text-red-500" />,
  promotion: <Gift className="w-4 h-4 text-purple-500" />,
  billing: <DollarSign className="w-4 h-4 text-orange-500" />,
  general: <Info className="w-4 h-4 text-gray-500" />,
}

const typeColors = {
  transaction: 'bg-blue-50 border-blue-200',
  security: 'bg-red-50 border-red-200',
  promotion: 'bg-purple-50 border-purple-200',
  billing: 'bg-orange-50 border-orange-200',
  general: 'bg-gray-50 border-gray-200',
}

export function NotificationsCenter() {
  const { user } = useNeonAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (user) {
      loadNotifications()
    }
  }, [user])

  const loadNotifications = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/notifications/get-all', {
        headers: {
          'user-id': user?.id || '',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
        setUnreadCount(data.filter((n: Notification) => !n.is_read).length)
      }
    } catch (error) {
      console.error('[v0] Error loading notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      setNotifications(
        notifications.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      )
      setUnreadCount(Math.max(0, unreadCount - 1))
    } catch (error) {
      console.error('[v0] Error marking notification as read:', error)
    }
  }

  const dismissNotification = (notificationId: string) => {
    setNotifications(notifications.filter((n) => n.id !== notificationId))
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-accent rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {isOpen && (
        <Card className="absolute right-0 top-12 w-96 shadow-lg z-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
            <div>
              <CardTitle className="text-lg">Notifications</CardTitle>
              <CardDescription>
                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </CardDescription>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-accent rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </CardHeader>

          {isLoading ? (
            <CardContent className="py-8">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            </CardContent>
          ) : notifications.length === 0 ? (
            <CardContent className="py-8">
              <div className="text-center text-muted-foreground">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No notifications</p>
              </div>
            </CardContent>
          ) : (
            <ScrollArea className="h-96">
              <CardContent className="space-y-2 p-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border-l-4 transition-colors ${
                      typeColors[notification.type]
                    } ${
                      !notification.is_read ? 'bg-opacity-60' : 'bg-opacity-40'
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 flex-1">
                        {typeIcons[notification.type]}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-sm truncate">
                              {notification.title}
                            </h4>
                            {!notification.is_read && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatTime(notification.created_at)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          dismissNotification(notification.id)
                        }}
                        className="p-1 hover:bg-background rounded"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>

                    {notification.action_url && notification.action_label && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2 w-full text-xs"
                        onClick={(e) => {
                          e.stopPropagation()
                          window.location.href = notification.action_url || '#'
                        }}
                      >
                        {notification.action_label}
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </ScrollArea>
          )}

          <div className="border-t p-3">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-center text-xs"
              onClick={() => {
                setIsOpen(false)
                // Navigate to settings
              }}
            >
              <Settings className="w-3 h-3 mr-1" />
              Notification Settings
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
