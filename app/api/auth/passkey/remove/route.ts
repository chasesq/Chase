import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { userId, passkeyId } = await request.json()

    if (!userId || !passkeyId) {
      return NextResponse.json(
        { error: 'User ID and passkey ID are required' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Verify ownership
    const { data: passkey } = await supabase
      .from('passkey_credentials')
      .select('id')
      .eq('id', passkeyId)
      .eq('user_id', userId)
      .single()

    if (!passkey) {
      return NextResponse.json(
        { error: 'Passkey not found' },
        { status: 404 }
      )
    }

    // Delete passkey
    const { error: deleteError } = await supabase
      .from('passkey_credentials')
      .delete()
      .eq('id', passkeyId)

    if (deleteError) {
      return NextResponse.json(
        { error: 'Failed to remove passkey' },
        { status: 500 }
      )
    }

    // Log audit entry
    try {
      await supabase.from('audit_logs').insert({
        user_id: userId,
        action: 'passkey_removed',
        details: { passkey_id: passkeyId },
        created_at: new Date().toISOString(),
      })
    } catch (auditError) {
      console.error('[v0] Failed to log audit entry:', auditError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Passkey removal error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
