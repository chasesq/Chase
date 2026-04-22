import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getSession } from '@/lib/session-helper';

/**
 * GET /api/agents
 * List all agents for the current user
 */
export async function GET(request: NextRequest) {
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

    // Get agents
    const agents = await sql`
      SELECT 
        id,
        name,
        description,
        agent_type,
        trigger_type,
        status,
        created_at,
        updated_at
      FROM public.agents
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;

    // Get execution counts for each agent
    const agentsWithCounts = await Promise.all(
      agents.map(async (agent: any) => {
        const executions = await sql`
          SELECT COUNT(*) as count FROM public.agent_executions
          WHERE agent_id = ${agent.id}
        `;

        return {
          ...agent,
          totalExecutions: parseInt(executions[0]?.count || 0),
        };
      })
    );

    return NextResponse.json(agentsWithCounts);
  } catch (error) {
    console.error('[Agents GET] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agents' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/agents
 * Create a new agent
 */
export async function POST(request: NextRequest) {
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
    const body = await request.json();

    const { name, description, agentType, code, triggerType, triggerConfig } = body;

    // Validate required fields
    if (!name || !agentType || !code) {
      return NextResponse.json(
        { error: 'Missing required fields: name, agentType, code' },
        { status: 400 }
      );
    }

    // Validate agent type
    const validAgentTypes = ['financial_transaction', 'admin_task', 'code_execution', 'data_analysis'];
    if (!validAgentTypes.includes(agentType)) {
      return NextResponse.json(
        { error: `Invalid agent type. Must be one of: ${validAgentTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Create agent
    const result = await sql`
      INSERT INTO public.agents (
        user_id,
        name,
        description,
        agent_type,
        code,
        trigger_type,
        trigger_config,
        status
      ) VALUES (
        ${userId},
        ${name},
        ${description || null},
        ${agentType},
        ${code},
        ${triggerType || 'manual'},
        ${triggerConfig ? JSON.stringify(triggerConfig) : null},
        'active'
      )
      RETURNING *
    `;

    const agent = result[0];

    return NextResponse.json(agent, { status: 201 });
  } catch (error) {
    console.error('[Agents POST] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create agent' },
      { status: 500 }
    );
  }
}
