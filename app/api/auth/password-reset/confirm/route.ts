import { neon } from '@neondatabase/serverless'
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcrypt'

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const { email, otp, newPassword } = await request.json()

    // Validate password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    // Find user and verify OTP
    const result = await sql`
      SELECT u.id, prt.token, prt.expires_at
      FROM users u
      LEFT JOIN password_reset_tokens prt ON u.id = prt.user_id
      WHERE u.email = ${email}
    `

    if (result.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const user = result[0]

    // Verify OTP
    if (!user.token || user.token !== otp) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 })
    }

    // Check if OTP is expired
    if (new Date(user.expires_at) < new Date()) {
      return NextResponse.json({ error: 'OTP has expired' }, { status: 400 })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Update password and clear OTP
    await sql`
      UPDATE users
      SET password_hash = ${hashedPassword}
      WHERE id = ${user.id}
    `

    await sql`
      DELETE FROM password_reset_tokens
      WHERE user_id = ${user.id}
    `

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully',
    })
  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    )
  }
}
