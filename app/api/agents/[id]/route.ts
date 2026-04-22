import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getSession } from '@/lib/session-helper';

/**
 * GET /api/agents/[id]
 * Get agent details
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

    return NextResponse.json(agent[0]);
  } catch (error) {
    console.error('[Agent GET] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agent' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/agents/[id]
 * Update an agent
 */
export async function PUT(
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

    const { name, description, code, triggerType, triggerConfig, status } = body;

    // Update agent
    const result = await sql`
      UPDATE public.agents
      SET
        name = COALESCE(${name || null}::text, name),
        description = COALESCE(${description || null}::text, description),
        code = COALESCE(${code || null}::text, code),
        trigger_type = COALESCE(${triggerType || null}::text, trigger_type),
        trigger_config = COALESCE(${triggerConfig ? JSON.stringify(triggerConfig) : null}::jsonb, trigger_config),
        status = COALESCE(${status || null}::text, status),
        updated_at = NOW()
      WHERE id = ${agentId} AND user_id = ${userId}
      RETURNING *
    `;

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('[Agent PUT] Error:', error);
    return NextResponse.json(
      { error: 'Failed to update agent' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/agents/[id]
 * Delete an agent
 */
export async function DELETE(
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

    // Delete agent (cascade will delete executions and logs)
    await sql`
      DELETE FROM public.agents
      WHERE id = ${agentId} AND user_id = ${userId}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Agent DELETE] Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete agent' },
      { status: 500 }
    );
  }
}
