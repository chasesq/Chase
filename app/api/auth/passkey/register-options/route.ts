import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { userId, email, deviceName } = await request.json()

    if (!userId || !email) {
      return NextResponse.json(
        { error: 'User ID and email are required' },
        { status: 400 }
      )
    }

    // Generate random challenge (32 bytes)
    const challenge = crypto.getRandomValues(new Uint8Array(32))

    // Generate user ID (32 bytes)
    const userIdBuffer = new TextEncoder().encode(userId)

    // Create registration options
    const publicKey = {
      challenge: Array.from(challenge),
      rp: {
        name: 'Chase',
        id: process.env.NEXT_PUBLIC_DOMAIN || 'localhost',
      },
      user: {
        id: Array.from(userIdBuffer),
        name: email,
        displayName: email,
      },
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' }, // ES256
        { alg: -257, type: 'public-key' }, // RS256
      ],
      timeout: 60000,
      attestation: 'direct',
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        residentKey: 'preferred',
        userVerification: 'preferred',
      },
    }

    return NextResponse.json({
      publicKey,
      deviceName: deviceName || 'My Device',
    })
  } catch (error) {
    console.error('[v0] Passkey registration options error:', error)
    return NextResponse.json(
      { error: 'Failed to generate registration options' },
      { status: 500 }
    )
  }
}
