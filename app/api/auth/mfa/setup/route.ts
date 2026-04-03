import { NextResponse } from 'next/server'
import { totp } from 'speakeasy'
import QRCode from 'qrcode'

export async function POST() {
  try {
    // Generate TOTP secret
    const secret = totp.generateSecret({
      name: 'Chase Banking App',
      issuer: 'Chase',
      length: 32,
    })

    if (!secret.otpauth_url) {
      throw new Error('Failed to generate OTP URL')
    }

    // Generate QR code
    const qrCode = await QRCode.toDataURL(secret.otpauth_url)

    return NextResponse.json({
      secret: secret.base32,
      qrCode: qrCode,
    })
  } catch (error) {
    console.error('MFA setup error:', error)
    return NextResponse.json(
      { error: 'Failed to initialize MFA setup' },
      { status: 500 }
    )
  }
}
