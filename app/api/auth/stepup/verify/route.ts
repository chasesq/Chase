import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// In-memory store for step-up tokens (in production, use a database)
const stepUpTokens = new Map<string, { userId: string; expiresAt: number }>()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, method } = body

    if (!code || !method) {
      return NextResponse.json(
        { error: 'Code and method are required' },
        { status: 400 },
      )
    }

    // Validate the code using existing 2FA verification endpoint
    const verifyResponse = await fetch(
      `${process.env.VERCEL_URL || 'http://localhost:3000'}/api/auth/2fa/verify`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          method,
        }),
      },
    )

    if (!verifyResponse.ok) {
      const error = await verifyResponse.json()
      return NextResponse.json(
        { error: error.error || 'Verification failed' },
        { status: 401 },
      )
    }

    const verifyData = await verifyResponse.json()

    // Generate a secure step-up token
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = Date.now() + 15 * 60 * 1000 // 15 minutes

    // Store the token
    stepUpTokens.set(token, {
      userId: verifyData.userId || 'user',
      expiresAt,
    })

    // Clean up expired tokens periodically
    cleanupExpiredTokens()

    return NextResponse.json(
      {
        token,
        expiresAt: new Date(expiresAt).toISOString(),
        expiresIn: 15 * 60, // seconds
      },
      { status: 200 },
    )
  } catch (error) {
    console.error('[v0] Step-up verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

function cleanupExpiredTokens() {
  const now = Date.now()
  for (const [token, data] of stepUpTokens.entries()) {
    if (data.expiresAt < now) {
      stepUpTokens.delete(token)
    }
  }
}

// Export utility function to verify step-up token
export function verifyStepUpToken(token: string): boolean {
  const data = stepUpTokens.get(token)
  if (!data) return false

  const now = Date.now()
  if (data.expiresAt < now) {
    stepUpTokens.delete(token)
    return false
  }

  return true
}

// Export utility function to consume step-up token (one-time use)
export function consumeStepUpToken(token: string): boolean {
  const isValid = verifyStepUpToken(token)
  if (isValid) {
    stepUpTokens.delete(token)
  }
  return isValid
}
