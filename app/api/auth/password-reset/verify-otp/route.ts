import { neon } from '@neondatabase/serverless'
import { NextRequest, NextResponse } from 'next/server'

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json()

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

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully',
    })
  } catch (error) {
    console.error('OTP verification error:', error)
    return NextResponse.json(
      { error: 'Failed to verify OTP' },
      { status: 500 }
    )
  }
}
