import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { validateStepUpToken } from '@/lib/auth/stepup'

export async function POST(request: NextRequest) {
  try {
    const { email, factorId } = await request.json()

    if (!email || !factorId) {
      return NextResponse.json(
        { error: 'Email and factor ID are required' },
        { status: 400 }
      )
    }

    // Check for step-up authentication
    const stepUpToken = request.headers.get('x-stepup-token') ||
                        request.cookies.get('stepup-token')?.value

    if (!stepUpToken || !validateStepUpToken(stepUpToken)) {
      return NextResponse.json(
        { error: 'Step-up authentication required' },
        { status: 403 }
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

    // Handle factor removal based on factor type
    if (factorId === 'totp-primary') {
      // Disable TOTP
      const { error: updateError } = await supabase
        .from('users')
        .update({
          totp_secret: null,
          totp_backup_codes: null,
          two_factor_enabled: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', users.id)

      if (updateError) {
        return NextResponse.json(
          { error: updateError.message },
          { status: 500 }
        )
      }

      // Log the removal
      try {
        await supabase.from('audit_logs').insert({
          user_id: users.id,
          action: 'mfa_factor_removed',
          details: {
            factor_type: 'totp',
            factor_id: factorId,
          },
          created_at: new Date().toISOString(),
        })
      } catch (auditError) {
        console.error('[v0] Failed to log MFA removal:', auditError)
      }

      return NextResponse.json({
        success: true,
        message: 'MFA factor removed successfully',
      })
    }

    return NextResponse.json(
      { error: 'Invalid factor ID' },
      { status: 400 }
    )
  } catch (error) {
    console.error('[v0] MFA factor removal error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
