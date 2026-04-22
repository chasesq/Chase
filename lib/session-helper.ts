import { sql } from '@/lib/db'

/**
 * Get user session from token
 * Used in API routes to validate authentication
 */
export async function getSession(token: string) {
  try {
    const result = await sql`
      SELECT s.*, u.id as user_id, u.email, u.full_name, u.role
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.token = ${token} AND s.expires_at > CURRENT_TIMESTAMP
    `
    return result[0] || null
  } catch (error) {
    console.error('[getSession] Error:', error)
    return null
  }
}

/**
 * Validate that a user owns an agent
 */
export async function validateAgentOwnership(agentId: string, userId: string) {
  try {
    const result = await sql`
      SELECT id FROM public.agents
      WHERE id = ${agentId} AND user_id = ${userId}
    `
    return !!result[0]
  } catch (error) {
    console.error('[validateAgentOwnership] Error:', error)
    return false
  }
}

/**
 * Validate that a user can access an execution
 */
export async function validateExecutionAccess(executionId: string, userId: string) {
  try {
    const result = await sql`
      SELECT id FROM public.agent_executions
      WHERE id = ${executionId} AND user_id = ${userId}
    `
    return !!result[0]
  } catch (error) {
    console.error('[validateExecutionAccess] Error:', error)
    return false
  }
}
