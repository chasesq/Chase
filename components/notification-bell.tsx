'use client'

import { useEffect, useState } from 'react'
import { Bell, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Notification {
  id: number
  message: string
  type: string
  read: boolean
  created_at: string
  data?: any
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/notifications?limit=10')
      const data = await response.json()

      if (data.notifications) {
        setNotifications(data.notifications)
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (error) {
      console.error('[v0] Error fetching notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchNotifications()
  }, [])

  // Subscribe to real-time notifications
  useEffect(() => {
    const { data: { session } } = supabase.auth.getSession()

    if (!session?.user?.email) return

    // Get user ID first
    const getUserId = async () => {
      try {
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('email', session.user.email)
          .single()

        if (!userData) return

        const userId = userData.id

        // Subscribe to notifications
        const channel = supabase
          .channel('notifications')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'notifications',
              filter: `user_id=eq.${userId}`,
            },
            (payload) => {
              const newNotification = payload.new as Notification
              setNotifications((prev) => [newNotification, ...prev])
              setUnreadCount((prev) => prev + 1)

              // Auto-close after 5 seconds if not marked as read
              setTimeout(() => {
                fetchNotifications()
              }, 5000)
            }
          )
          .subscribe()

        return () => {
          supabase.removeChannel(channel)
        }
      } catch (error) {
        console.error('[v0] Error setting up real-time subscription:', error)
      }
    }

    getUserId()
  }, [])

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId }),
      })

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      )

      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error('[v0] Error marking notification as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllAsRead: true }),
      })

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true }))
      )

      setUnreadCount(0)
    } catch (error) {
      console.error('[v0] Error marking all as read:', error)
    }
  }

  const handleDelete = async (notificationId: number) => {
    try {
      await fetch(`/api/notifications?notificationId=${notificationId}`, {
        method: 'DELETE',
      })

      setNotifications((prev) =>
        prev.filter((n) => n.id !== notificationId)
      )
    } catch (error) {
      console.error('[v0] Error deleting notification:', error)
    }
  }

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl z-50 max-h-96 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="overflow-y-auto flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-gray-500">Loading...</div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-gray-500">No notifications yet</div>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`px-4 py-3 hover:bg-gray-50 transition-colors ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full mb-1" />
                        )}
                        <p className="text-sm text-gray-900 break-words">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notification.created_at).toLocaleDateString(
                            'en-US',
                            {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            }
                          )}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDelete(notification.id)}
                        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Delete notification"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    {!notification.read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="text-xs text-blue-600 hover:text-blue-800 mt-2"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <button
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40"
          aria-hidden="true"
        />
      )}
    </div>
  )
}
