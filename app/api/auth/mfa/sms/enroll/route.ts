import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { generateOTP } from '@/lib/auth/otp-store'

export async function POST(request: NextRequest) {
  try {
    const { userId, phoneNumber } = await request.json()

    if (!userId || !phoneNumber) {
      return NextResponse.json(
        { error: 'User ID and phone number are required' },
        { status: 400 }
      )
    }

    // Validate phone number format
    const phoneRegex = /^\+?[1-9]\d{1,14}$/
    if (!phoneRegex.test(phoneNumber.replace(/\D/g, ''))) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Check if SMS factor already exists for this phone
    const { data: existing } = await supabase
      .from('sms_factors')
      .select('id')
      .eq('user_id', userId)
      .eq('phone_number', phoneNumber)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'This phone number is already enrolled' },
        { status: 409 }
      )
    }

    // Create SMS factor entry
    const { data: smsFactor, error } = await supabase
      .from('sms_factors')
      .insert({
        user_id: userId,
        phone_number: phoneNumber,
        is_verified: false,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create SMS factor' },
        { status: 500 }
      )
    }

    // Generate verification OTP
    const otp = generateOTP()

    // In production, send SMS using Twilio or similar service
    console.log(`[v0] SMS OTP for ${phoneNumber}: ${otp}`)

    return NextResponse.json({
      factorId: smsFactor.id,
      message: 'SMS factor created. OTP sent to phone number.',
      // For development: return the OTP
      otp: process.env.NODE_ENV === 'development' ? otp : undefined,
    })
  } catch (error) {
    console.error('[v0] SMS factor enrollment error:', error)
    return NextResponse.json(
      { error: 'Failed to enroll SMS factor' },
      { status: 500 }
    )
  }
}
