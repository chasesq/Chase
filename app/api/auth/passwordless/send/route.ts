import { NextRequest, NextResponse } from 'next/server'
import { generateOTP, storeOTP, getOTPKey } from '@/lib/auth/otp-store'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { identifier, method } = body

    if (!identifier || !method || (method !== 'email' && method !== 'sms')) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      )
    }

    // Validate identifier format
    if (method === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(identifier)) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        )
      }
    } else {
      const phoneRegex = /^\+?[1-9]\d{1,14}$/
      if (!phoneRegex.test(identifier)) {
        return NextResponse.json(
          { error: 'Invalid phone format' },
          { status: 400 }
        )
      }
    }

    // Generate 6-digit OTP code
    const code = generateOTP()

    // Store code with identifier
    const key = getOTPKey(method as 'email' | 'sms', identifier)
    storeOTP(key, code)

    // TODO: In production, send via email/SMS service
    // For demo, log the code
    console.log(`[Passwordless OTP] ${method.toUpperCase()} to ${identifier}: ${code}`)

    // Send via email or SMS (implement with your email/SMS provider)
    if (method === 'email') {
      try {
        // Example: Using Resend for email
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'noreply@chase.com',
            to: identifier,
            subject: 'Your Login Code',
            html: `
              <div>
                <h2>Your Login Code</h2>
                <p>Enter this code to sign in:</p>
                <h1>${code}</h1>
                <p>This code expires in 10 minutes.</p>
              </div>
            `,
          }),
        })

        if (!res.ok) {
          console.error('[Passwordless] Failed to send email:', await res.text())
        }
      } catch (err) {
        console.error('[Passwordless] Email error:', err)
      }
    } else {
      try {
        // Example: Using Twilio for SMS
        // const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
        // await client.messages.create({
        //   body: `Your Chase login code is: ${code}`,
        //   from: process.env.TWILIO_PHONE_NUMBER,
        //   to: identifier,
        // })
        console.log('[Passwordless] SMS to', identifier, 'code:', code)
      } catch (err) {
        console.error('[Passwordless] SMS error:', err)
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: `OTP sent to your ${method}`,
        expiresIn: 600, // 10 minutes
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[Passwordless Send] Error:', error)
    return NextResponse.json(
      { error: 'Failed to send OTP' },
      { status: 500 }
    )
  }
}
