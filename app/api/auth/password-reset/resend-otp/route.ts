import { neon } from '@neondatabase/serverless'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    // Find user
    const users = await sql`
      SELECT id FROM users WHERE email = ${email}
    `

    if (users.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists, you will receive a new OTP',
      })
    }

    // Generate new OTP
    const otp = crypto.randomInt(100000, 999999).toString()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

    // Update OTP in database
    await sql`
      UPDATE password_reset_tokens
      SET token = ${otp}, expires_at = ${expiresAt}
      WHERE user_id = ${users[0].id}
    `

    // In a real app, send email with new OTP
    console.log(`New password reset OTP for ${email}: ${otp}`)

    return NextResponse.json({
      success: true,
      message: 'If an account exists, you will receive a new OTP',
    })
  } catch (error) {
    console.error('Resend OTP error:', error)
    return NextResponse.json(
      { error: 'Failed to resend OTP' },
      { status: 500 }
    )
  }
}
