import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { generateBackupCodes, hashBackupCodes } from '@/lib/auth/totp-service'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Get user
    const { data: users, error: findError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (findError || !users) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Generate new backup codes
    const newCodes = generateBackupCodes(10)
    const hashedCodes = hashBackupCodes(newCodes)

    // Update user with new codes
    const { error: updateError } = await supabase
      .from('users')
      .update({
        totp_backup_codes: hashedCodes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', users.id)

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      )
    }

    // Log the generation
    try {
      await supabase.from('audit_logs').insert({
        user_id: users.id,
        action: 'recovery_codes_generated',
        details: {
          count: newCodes.length,
        },
        created_at: new Date().toISOString(),
      })
    } catch (auditError) {
      console.error('[v0] Failed to log recovery code generation:', auditError)
    }

    return NextResponse.json({
      success: true,
      codes: newCodes,
      message: 'Recovery codes generated successfully',
    })
  } catch (error) {
    console.error('[v0] Recovery codes generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
