import { NextRequest, NextResponse } from 'next/server'
import { getUserAuditLogs, getSecurityAuditLogs } from '@/lib/audit/logging'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email')
    const type = request.nextUrl.searchParams.get('type') || 'all' // 'all' or 'security'
    const limit = Math.min(parseInt(request.nextUrl.searchParams.get('limit') || '50'), 100)
    const offset = parseInt(request.nextUrl.searchParams.get('offset') || '0')

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Get user ID from email
    const supabase = createServiceClient()
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    let logs: any[] = []
    let total = 0

    if (type === 'security') {
      logs = await getSecurityAuditLogs(user.id, limit)
      total = logs.length
    } else {
      const result = await getUserAuditLogs(user.id, limit, offset)
      logs = result.logs
      total = result.total
    }

    return NextResponse.json({
      logs: logs.map((log) => ({
        id: log.id,
        action: log.action,
        details: log.details,
        ipAddress: log.ip_address,
        userAgent: log.user_agent,
        createdAt: log.created_at,
      })),
      pagination: {
        limit,
        offset,
        total,
      },
    })
  } catch (error) {
    console.error('[v0] Audit logs GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
