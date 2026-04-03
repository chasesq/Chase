import { NextRequest, NextResponse } from 'next/server'
import { totp } from 'speakeasy'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { code, secret } = await request.json()

    // Verify TOTP code
    const isValid = totp.verify({
      secret,
      encoding: 'base32',
      token: code,
      window: 2, // Allow 30 seconds window on both sides
    })

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      )
    }

    // Generate backup codes
    const backupCodes = Array.from({ length: 10 }, () =>
      crypto.randomBytes(4).toString('hex').toUpperCase()
    )

    return NextResponse.json({
      backupCodes,
      verified: true,
    })
  } catch (error) {
    console.error('MFA verification error:', error)
    return NextResponse.json(
      { error: 'Failed to verify code' },
      { status: 500 }
    )
  }
}
