import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, email, deviceName, credential } = body

    if (!userId || !credential || !credential.response) {
      return NextResponse.json(
        { error: 'Invalid credential data' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // In production, verify the attestation object and clientDataJSON
    // For now, store the credential
    const { data: passkey, error } = await supabase
      .from('passkey_credentials')
      .insert({
        user_id: userId,
        credential_id: credential.id,
        public_key: Buffer.from(credential.response.attestationObject, 'base64'),
        device_name: deviceName,
        verified: true,
        enrolled_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('[v0] Failed to store passkey:', error)
      return NextResponse.json(
        { error: 'Failed to store passkey' },
        { status: 500 }
      )
    }

    // Log audit entry
    try {
      await supabase.from('audit_logs').insert({
        user_id: userId,
        action: 'passkey_enrolled',
        details: {
          device_name: deviceName,
          credential_id: credential.id,
        },
        created_at: new Date().toISOString(),
      })
    } catch (auditError) {
      console.error('[v0] Failed to log audit entry:', auditError)
    }

    return NextResponse.json({
      success: true,
      passkeyId: passkey.id,
      message: 'Passkey registered successfully',
    })
  } catch (error) {
    console.error('[v0] Passkey registration verification error:', error)
    return NextResponse.json(
      { error: 'Failed to verify passkey' },
      { status: 500 }
    )
  }
}
