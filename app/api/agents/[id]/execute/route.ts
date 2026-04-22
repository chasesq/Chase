import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getSession } from '@/lib/session-helper';
import { queueManager } from '@/lib/agents/queue-manager';

/**
 * POST /api/agents/[id]/execute
 * Execute an agent and queue the job
 */
export async function POST(
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
    const body = await request.json();
    const { input } = body;

    // Get agent
    const agent = await sql`
      SELECT * FROM public.agents
      WHERE id = ${agentId} AND user_id = ${userId}
    `;

    if (!agent[0]) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    if (agent[0].status !== 'active') {
      return NextResponse.json(
        { error: 'Agent is not active' },
        { status: 400 }
      );
    }

    // Create execution record
    const execution = await sql`
      INSERT INTO public.agent_executions (
        agent_id,
        user_id,
        status,
        input,
        triggered_by
      ) VALUES (
        ${agentId},
        ${userId},
        'pending',
        ${input ? JSON.stringify(input) : null},
        'manual'
      )
      RETURNING *
    `;

    const executionId = execution[0].id;

    // Queue the job
    try {
      await queueManager.enqueueJob({
        agentId,
        executionId,
        userId,
        code: agent[0].code,
        agentType: agent[0].agent_type,
        input,
        timestamp: Date.now(),
      });

      // Update execution status to queued
      await sql`
        UPDATE public.agent_executions
        SET status = 'running'
        WHERE id = ${executionId}
      `;

      return NextResponse.json(
        {
          success: true,
          executionId,
          message: 'Agent execution queued',
        },
        { status: 202 }
      );
    } catch (queueError) {
      // Mark execution as failed if queue fails
      await sql`
        UPDATE public.agent_executions
        SET 
          status = 'failed',
          error_message = 'Failed to queue execution'
        WHERE id = ${executionId}
      `;

      console.error('[Execute] Queue error:', queueError);
      return NextResponse.json(
        { error: 'Failed to queue execution' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[Execute] Error:', error);
    return NextResponse.json(
      { error: 'Failed to execute agent' },
      { status: 500 }
    );
  }
}
