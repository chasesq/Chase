import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { verifyOTP } from '@/lib/auth/otp-store'

export async function POST(request: NextRequest) {
  try {
    const { userId, factorId, otp } = await request.json()

    if (!userId || !factorId || !otp) {
      return NextResponse.json(
        { error: 'User ID, factor ID, and OTP are required' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Get SMS factor
    const { data: smsFactor, error: fetchError } = await supabase
      .from('sms_factors')
      .select('*')
      .eq('id', factorId)
      .eq('user_id', userId)
      .single()

    if (fetchError || !smsFactor) {
      return NextResponse.json(
        { error: 'SMS factor not found' },
        { status: 404 }
      )
    }

    // Verify OTP (in production, you would verify against the OTP sent via SMS)
    const isValid = verifyOTP(`sms:${smsFactor.phone_number}`, otp)

    if (!isValid) {
      // Increment verification attempts
      await supabase
        .from('sms_factors')
        .update({
          verification_attempts: (smsFactor.verification_attempts || 0) + 1,
        })
        .eq('id', factorId)

      return NextResponse.json(
        { error: 'Invalid OTP' },
        { status: 400 }
      )
    }

    // Mark as verified
    const { data: updated, error: updateError } = await supabase
      .from('sms_factors')
      .update({
        is_verified: true,
        verification_attempts: 0,
        last_verification_at: new Date().toISOString(),
      })
      .eq('id', factorId)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to verify SMS factor' },
        { status: 500 }
      )
    }

    // Log audit entry
    try {
      await supabase.from('audit_logs').insert({
        user_id: userId,
        action: 'sms_factor_verified',
        details: {
          phone_number: smsFactor.phone_number,
        },
        created_at: new Date().toISOString(),
      })
    } catch (auditError) {
      console.error('[v0] Failed to log audit entry:', auditError)
    }

    return NextResponse.json({
      success: true,
      message: 'SMS factor verified successfully',
    })
  } catch (error) {
    console.error('[v0] SMS factor verification error:', error)
    return NextResponse.json(
      { error: 'Failed to verify SMS factor' },
      { status: 500 }
    )
  }
}
