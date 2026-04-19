/**
 * Notifications API - Push, email, SMS notification management
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// GET /api/notifications - Fetch user notifications
export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    
    // Get user from Supabase session
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user ID from Neon by email
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userId = userData.id
    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unreadOnly') === 'true'
    const type = searchParams.get('type')
    const limit = Math.min(100, parseInt(searchParams.get('limit') || '20'))
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const offset = (page - 1) * limit

    let query = supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)

    if (unreadOnly) {
      query = query.eq('read', false)
    }

    if (type) {
      query = query.eq('type', type)
    }

    const { data: notifications, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const unreadCount = notifications?.filter(n => !n.read).length || 0

    return NextResponse.json({
      notifications: notifications || [],
      unreadCount,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('[v0] Notifications fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

// PATCH /api/notifications - Mark notification as read
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    
    // Get user from Supabase session
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user ID from Neon by email
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userId = userData.id
    const { notificationId, markAllAsRead } = await request.json()

    if (markAllAsRead) {
      // Mark all as read
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, updated_at: new Date().toISOString() })
        .eq('user_id', userId)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      return NextResponse.json({
        message: 'All notifications marked as read'
      })
    }

    if (notificationId) {
      // Mark specific notification as read
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, updated_at: new Date().toISOString() })
        .eq('id', notificationId)
        .eq('user_id', userId)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      return NextResponse.json({
        message: 'Notification marked as read'
      })
    }

    return NextResponse.json(
      { error: 'notificationId or markAllAsRead required' },
      { status: 400 }
    )
  } catch (error) {
    console.error('[v0] Notification update error:', error)
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    )
  }
}

// DELETE /api/notifications - Delete notification
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    
    // Get user from Supabase session
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user ID from Neon by email
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userId = userData.id
    const { searchParams } = new URL(request.url)
    const notificationId = searchParams.get('notificationId')

    if (!notificationId) {
      return NextResponse.json(
        { error: 'notificationId required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', userId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      message: 'Notification deleted'
    })
  } catch (error) {
    console.error('[v0] Notification delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    )
  }
}

// POST /api/notifications/preferences - Update notification preferences
export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    
    // Get user from Supabase session
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user ID from Neon by email
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userId = userData.id
    const {
      transaction_alerts,
      payment_confirmations,
      system_messages,
      push_notifications,
      email_notifications,
    } = await request.json()

    // Update user preferences
    const { error } = await supabase
      .from('notification_preferences')
      .upsert(
        {
          user_id: userId,
          transaction_alerts: transaction_alerts ?? true,
          payment_confirmations: payment_confirmations ?? true,
          system_messages: system_messages ?? true,
          push_notifications: push_notifications ?? true,
          email_notifications: email_notifications ?? false,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      message: 'Notification preferences updated successfully'
    })
  } catch (error) {
    console.error('[v0] Preferences update error:', error)
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    )
  }
}
