import { createServiceClient } from '@/lib/supabase/server'

export interface AuditLogEntry {
  id?: string
  userId: string
  action: string
  details?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  createdAt?: string
}

/**
 * Log an audit entry to the database
 */
export async function logAuditEntry(entry: AuditLogEntry) {
  try {
    const supabase = createServiceClient()

    const { data, error } = await supabase.from('audit_logs').insert({
      user_id: entry.userId,
      action: entry.action,
      details: entry.details || {},
      ip_address: entry.ipAddress,
      user_agent: entry.userAgent,
      created_at: entry.createdAt || new Date().toISOString(),
    })

    if (error) {
      console.error('[Audit] Failed to log entry:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('[Audit] Error logging entry:', error)
    return null
  }
}

/**
 * Get audit logs for a user
 */
export async function getUserAuditLogs(
  userId: string,
  limit: number = 50,
  offset: number = 0
) {
  try {
    const supabase = createServiceClient()

    const { data, error, count } = await supabase
      .from('audit_logs')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('[Audit] Failed to get logs:', error)
      return { logs: [], total: 0 }
    }

    return {
      logs: data || [],
      total: count || 0,
    }
  } catch (error) {
    console.error('[Audit] Error getting logs:', error)
    return { logs: [], total: 0 }
  }
}

/**
 * Get recent security-related audit logs
 */
export async function getSecurityAuditLogs(userId: string, limit: number = 20) {
  try {
    const supabase = createServiceClient()

    const securityActions = [
      'profile_updated',
      'password_changed',
      '2fa_enabled',
      '2fa_disabled',
      'login_success',
      'login_failed',
      'session_terminated',
    ]

    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', userId)
      .in('action', securityActions)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('[Audit] Failed to get security logs:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('[Audit] Error getting security logs:', error)
    return []
  }
}

/**
 * Clean up old audit logs (older than 90 days)
 */
export async function cleanupOldAuditLogs() {
  try {
    const supabase = createServiceClient()
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()

    const { error } = await supabase
      .from('audit_logs')
      .delete()
      .lt('created_at', ninetyDaysAgo)

    if (error) {
      console.error('[Audit] Failed to clean up logs:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('[Audit] Error cleaning up logs:', error)
    return false
  }
}
