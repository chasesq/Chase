import { neon } from '@neondatabase/serverless'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    // Validate email exists
    const users = await sql`
      SELECT id FROM users WHERE email = ${email}
    `

    if (users.length === 0) {
      // Don't reveal if email exists (security best practice)
      return NextResponse.json({
        success: true,
        message: 'If an account exists, you will receive an email with reset instructions',
      })
    }

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    // Store OTP in database
    await sql`
      INSERT INTO password_reset_tokens (user_id, token, expires_at)
      VALUES (${users[0].id}, ${otp}, ${expiresAt})
      ON CONFLICT (user_id) DO UPDATE
      SET token = ${otp}, expires_at = ${expiresAt}
    `

    // In a real app, send email here with the OTP
    console.log(`Password reset OTP for ${email}: ${otp}`)

    return NextResponse.json({
      success: true,
      message: 'If an account exists, you will receive an email with reset instructions',
    })
  } catch (error) {
    console.error('Password reset request error:', error)
    return NextResponse.json(
      { error: 'Failed to process reset request' },
      { status: 500 }
    )
  }
}
