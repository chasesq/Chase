import 'server-only'

import { createServiceClient } from '@/lib/supabase/server'

/**
 * Notification types for payment events
 */
export type PaymentNotificationType =
  | 'payment_succeeded'
  | 'payment_failed'
  | 'payment_refunded'
  | 'payment_disputed'
  | 'account_updated'
  | 'reconciliation_alert'
  | 'account_verification'

/**
 * Send notification for payment event
 */
export async function sendPaymentNotification(
  userId: string,
  type: PaymentNotificationType,
  data: Record<string, any>
) {
  const supabase = createServiceClient()

  try {
    const notifications = generateNotifications(type, data)

    // Store in database
    for (const notification of notifications) {
      await supabase.from('notifications').insert({
        user_id: userId,
        title: notification.title,
        message: notification.message,
        type: type,
        category: 'payments',
        data: notification.data,
        read: false,
      })
    }

    // Send real-time updates via broadcast
    supabase.channel(`payments:${userId}`).send('broadcast', {
      event: type,
      data,
      timestamp: new Date().toISOString(),
    })

    console.log('[v0] Notification sent:', type, 'to user:', userId)
    return true
  } catch (error: any) {
    console.error('[v0] Error sending notification:', error)
    return false
  }
}

/**
 * Generate notification messages based on event type
 */
function generateNotifications(
  type: PaymentNotificationType,
  data: Record<string, any>
): Array<{ title: string; message: string; data: any }> {
  const notifications: Array<{ title: string; message: string; data: any }> = []

  switch (type) {
    case 'payment_succeeded':
      notifications.push({
        title: 'Payment Successful',
        message: `${data.amount?.toFixed(2)} ${data.currency} has been added to your account`,
        data: {
          amount: data.amount,
          currency: data.currency,
          paymentMethod: data.paymentMethod,
          timestamp: new Date().toISOString(),
        },
      })
      break

    case 'payment_failed':
      notifications.push({
        title: 'Payment Failed',
        message: data.failureMessage || 'Your payment could not be processed',
        data: {
          failureCode: data.failureCode,
          failureMessage: data.failureMessage,
          timestamp: new Date().toISOString(),
        },
      })
      break

    case 'payment_refunded':
      notifications.push({
        title: 'Refund Processed',
        message: `${data.refundAmount?.toFixed(2)} ${data.currency} has been refunded to you`,
        data: {
          originalAmount: data.originalAmount,
          refundAmount: data.refundAmount,
          currency: data.currency,
          timestamp: new Date().toISOString(),
        },
      })
      break

    case 'payment_disputed':
      notifications.push({
        title: 'Payment Disputed',
        message: `A dispute has been filed for a recent payment (ID: ${data.disputeId})`,
        data: {
          disputeId: data.disputeId,
          reason: data.reason,
          timestamp: new Date().toISOString(),
        },
      })
      break

    case 'account_updated':
      notifications.push({
        title: 'Account Status Updated',
        message: 'Your Stripe account status has changed',
        data: {
          chargesEnabled: data.chargesEnabled,
          payoutsEnabled: data.payoutsEnabled,
          timestamp: new Date().toISOString(),
        },
      })
      break

    case 'reconciliation_alert':
      notifications.push({
        title: 'Reconciliation Alert',
        message: `${data.discrepancyCount} payment discrepancies found and require review`,
        data: {
          discrepancyCount: data.discrepancyCount,
          logId: data.logId,
          timestamp: new Date().toISOString(),
        },
      })
      break

    case 'account_verification':
      notifications.push({
        title: 'Account Verification Required',
        message: 'Additional information needed to verify your account',
        data: {
          requiredFields: data.requiredFields,
          deadline: data.deadline,
          timestamp: new Date().toISOString(),
        },
      })
      break
  }

  return notifications
}

/**
 * Get notifications for a user
 */
export async function getUserNotifications(
  userId: string,
  limit: number = 50,
  unreadOnly: boolean = false
) {
  const supabase = createServiceClient()

  try {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)

    if (unreadOnly) {
      query = query.eq('read', false)
    }

    const { data: notifications, error } = await query
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw error
    }

    return notifications || []
  } catch (error: any) {
    console.error('[v0] Error fetching notifications:', error)
    throw error
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string) {
  const supabase = createServiceClient()

  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  } catch (error: any) {
    console.error('[v0] Error marking notification as read:', error)
    throw error
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(userId: string) {
  const supabase = createServiceClient()

  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('read', false)

    if (error) {
      throw error
    }

    return true
  } catch (error: any) {
    console.error('[v0] Error marking all notifications as read:', error)
    throw error
  }
}

/**
 * Subscribe to payment notifications in real-time
 */
export function subscribeToPaymentNotifications(
  supabase: any,
  userId: string,
  callback: (notification: any) => void
) {
  const subscription = supabase
    .channel(`payments:${userId}`)
    .on('broadcast', { event: 'payment_*' }, (payload: any) => {
      callback(payload)
    })
    .subscribe()

  return subscription
}
