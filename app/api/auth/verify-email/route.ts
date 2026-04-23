import { NextRequest, NextResponse } from 'next/server'
import { verifyEmailToken, deleteVerificationToken, getVerificationToken } from '@/lib/email'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      )
    }

    // Check if token exists and is not expired
    const verificationToken = getVerificationToken(token)
    if (!verificationToken) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      )
    }

    // Verify the token
    const isVerified = verifyEmailToken(token)
    if (!isVerified) {
      return NextResponse.json(
        { error: 'Failed to verify email or token has expired' },
        { status: 400 }
      )
    }

    // Delete the token after successful verification
    deleteVerificationToken(token)

    // Return success with user email
    return NextResponse.json(
      {
        success: true,
        message: 'Email verified successfully',
        email: verificationToken.email,
        userId: verificationToken.userId,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[v0] Email verification error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'An error occurred during email verification',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      )
    }

    // Check if token exists and is not expired
    const verificationToken = getVerificationToken(token)
    if (!verificationToken) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      )
    }

    // Verify the token
    const isVerified = verifyEmailToken(token)
    if (!isVerified) {
      return NextResponse.json(
        { error: 'Failed to verify email or token has expired' },
        { status: 400 }
      )
    }

    // Delete the token after successful verification
    deleteVerificationToken(token)

    // Return success with user email
    return NextResponse.json(
      {
        success: true,
        message: 'Email verified successfully',
        email: verificationToken.email,
        userId: verificationToken.userId,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[v0] Email verification error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'An error occurred during email verification',
      },
      { status: 500 }
    )
  }
}
