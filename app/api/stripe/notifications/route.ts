import { NextRequest, NextResponse } from 'next/server'
import {
  sendPaymentNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '@/lib/stripe/event-notifications'

// GET /api/stripe/notifications - Get user notifications
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50')
    const unreadOnly = request.nextUrl.searchParams.get('unreadOnly') === 'true'

    const notifications = await getUserNotifications(userId, limit, unreadOnly)

    return NextResponse.json({
      notifications,
      count: notifications.length,
    })
  } catch (error: any) {
    console.error('[v0] Notifications fetch error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// POST /api/stripe/notifications - Mark notifications as read
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action, notificationId } = body

    if (action === 'mark-as-read') {
      if (notificationId) {
        const notification = await markNotificationAsRead(notificationId)
        return NextResponse.json({ success: true, data: notification })
      } else {
        await markAllNotificationsAsRead(userId)
        return NextResponse.json({ success: true, message: 'All notifications marked as read' })
      }
    }

    return NextResponse.json(
      { error: 'Unknown action' },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('[v0] Notifications update error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
