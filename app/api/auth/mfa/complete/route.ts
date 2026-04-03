import { neon } from '@neondatabase/serverless'
import { NextRequest, NextResponse } from 'next/server'

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const { backupCodes } = await request.json()

    // Get user from session/auth header
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Store MFA settings in database
    // This is a simplified example - you'd want to hash the backup codes
    await sql`
      UPDATE users
      SET mfa_enabled = true,
          mfa_backup_codes = ${JSON.stringify(backupCodes)}
      WHERE id = ${authHeader}
    `

    return NextResponse.json({
      success: true,
      message: 'MFA setup completed',
    })
  } catch (error) {
    console.error('MFA completion error:', error)
    return NextResponse.json(
      { error: 'Failed to complete MFA setup' },
      { status: 500 }
    )
  }
}
