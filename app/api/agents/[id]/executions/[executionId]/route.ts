import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getSession } from '@/lib/session-helper';

/**
 * GET /api/agents/[id]/executions/[executionId]
 * Get execution details with logs
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; executionId: string } }
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
    const executionId = params.executionId;

    // Get execution details
    const execution = await sql`
      SELECT *
      FROM public.agent_executions
      WHERE id = ${executionId} AND agent_id = ${agentId} AND user_id = ${userId}
    `;

    if (!execution[0]) {
      return NextResponse.json(
        { error: 'Execution not found' },
        { status: 404 }
      );
    }

    // Get logs for this execution
    const logs = await sql`
      SELECT
        id,
        log_level,
        message,
        data,
        created_at
      FROM public.agent_logs
      WHERE execution_id = ${executionId}
      ORDER BY created_at ASC
    `;

    return NextResponse.json({
      ...execution[0],
      logs,
    });
  } catch (error) {
    console.error('[Execution GET] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch execution details' },
      { status: 500 }
    );
  }
}
