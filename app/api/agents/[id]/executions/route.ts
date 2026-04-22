import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getSession } from '@/lib/session-helper';

/**
 * GET /api/agents/[id]/executions
 * Get execution history for an agent
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('session')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const session = await getSession(token);
    if (!session) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    const userId = session.user_id;
    const agentId = params.id;

    // Verify agent ownership
    const agent = await sql`
      SELECT id FROM public.agents
      WHERE id = ${agentId} AND user_id = ${userId}
    `;

    if (!agent[0]) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Get executions with pagination
    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);
    const offset = parseInt(url.searchParams.get('offset') || '0');

    const executions = await sql`
      SELECT
        id,
        status,
        input,
        output,
        error_message,
        execution_time_ms,
        retry_count,
        triggered_by,
        triggered_at,
        started_at,
        completed_at,
        created_at
      FROM public.agent_executions
      WHERE agent_id = ${agentId} AND user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    // Get total count
    const countResult = await sql`
      SELECT COUNT(*) as total FROM public.agent_executions
      WHERE agent_id = ${agentId} AND user_id = ${userId}
    `;

    return NextResponse.json({
      executions,
      total: parseInt(countResult[0]?.total || 0),
      limit,
      offset,
    });
  } catch (error) {
    console.error('[Executions GET] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch executions' },
      { status: 500 }
    );
  }
}
