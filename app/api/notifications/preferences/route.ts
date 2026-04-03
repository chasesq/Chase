/**
 * Notification Preferences API
 */

import { neon } from '@neondatabase/serverless'
import { NextRequest, NextResponse } from 'next/server'

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('user-id')

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const preferences = await sql`
      SELECT * FROM notification_preferences 
      WHERE user_id = ${userId}
    `

    if (preferences.length === 0) {
      // Return default preferences if none exist
      return NextResponse.json({
        user_id: userId,
        transaction_alerts: true,
        security_alerts: true,
        promotional: true,
        billing_reminders: true,
        email_notifications: true,
        sms_notifications: false,
        push_notifications: true,
        quiet_hours_enabled: false,
      })
    }

    return NextResponse.json(preferences[0])
  } catch (error) {
    console.error('[v0] Error fetching preferences:', error)
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('user-id')

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const preferences = await request.json()

    // Check if preferences exist
    const existing = await sql`
      SELECT id FROM notification_preferences 
      WHERE user_id = ${userId}
    `

    let result
    if (existing.length > 0) {
      // Update existing
      result = await sql`
        UPDATE notification_preferences 
        SET 
          transaction_alerts = ${preferences.transaction_alerts ?? true},
          security_alerts = ${preferences.security_alerts ?? true},
          promotional = ${preferences.promotional ?? true},
          billing_reminders = ${preferences.billing_reminders ?? true},
          email_notifications = ${preferences.email_notifications ?? true},
          sms_notifications = ${preferences.sms_notifications ?? false},
          push_notifications = ${preferences.push_notifications ?? true},
          quiet_hours_enabled = ${preferences.quiet_hours_enabled ?? false},
          quiet_hours_start = ${preferences.quiet_hours_start || null},
          quiet_hours_end = ${preferences.quiet_hours_end || null},
          updated_at = NOW()
        WHERE user_id = ${userId}
        RETURNING *
      `
    } else {
      // Create new
      result = await sql`
        INSERT INTO notification_preferences (
          user_id,
          transaction_alerts,
          security_alerts,
          promotional,
          billing_reminders,
          email_notifications,
          sms_notifications,
          push_notifications,
          quiet_hours_enabled
        ) VALUES (
          ${userId},
          ${preferences.transaction_alerts ?? true},
          ${preferences.security_alerts ?? true},
          ${preferences.promotional ?? true},
          ${preferences.billing_reminders ?? true},
          ${preferences.email_notifications ?? true},
          ${preferences.sms_notifications ?? false},
          ${preferences.push_notifications ?? true},
          ${preferences.quiet_hours_enabled ?? false}
        )
        RETURNING *
      `
    }

    console.log('[v0] Preferences saved for user:', userId)

    return NextResponse.json({
      message: 'Preferences updated successfully',
      preferences: result[0],
    })
  } catch (error) {
    console.error('[v0] Error saving preferences:', error)
    return NextResponse.json(
      { error: 'Failed to save preferences' },
      { status: 500 }
    )
  }
}
