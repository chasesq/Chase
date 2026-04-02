import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature, processStripeWebhookEvent } from '@/lib/stripe/webhook-handler'
import { createServiceClient } from '@/lib/supabase/server'

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_ENDPOINT_SECRET

// POST /api/webhooks/stripe - Handle Stripe webhook events
export async function POST(request: NextRequest) {
  try {
    // Get the raw body for signature verification
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      console.error('[v0] Missing stripe-signature header')
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    if (!STRIPE_WEBHOOK_SECRET) {
      console.error('[v0] Missing STRIPE_WEBHOOK_ENDPOINT_SECRET')
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      )
    }

    // Verify webhook signature
    const event = verifyWebhookSignature(body, signature, STRIPE_WEBHOOK_SECRET)

    if (!event) {
      console.error('[v0] Invalid webhook signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 403 }
      )
    }

    console.log('[v0] Webhook received:', event.type, event.id)

    // Store webhook signature for replay prevention
    const supabase = createServiceClient()
    await supabase.from('stripe_webhook_signatures').insert({
      event_id: event.id,
      signature: signature,
      timestamp: new Date(event.created * 1000).toISOString(),
      verified: true,
    }).catch(err => {
      // If insert fails (duplicate), that's ok - event already processed
      console.log('[v0] Event already tracked:', event.id)
    })

    // Process the event
    const result = await processStripeWebhookEvent(event)

    if (!result.success) {
      // Return 500 to signal Stripe to retry
      console.error('[v0] Event processing failed:', result.error)
      return NextResponse.json(
        { error: 'Event processing failed', details: result.error },
        { status: 500 }
      )
    }

    // Success - acknowledge receipt
    return NextResponse.json(
      { 
        received: true,
        eventId: event.id,
        eventType: event.type,
        processed: result.processed,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('[v0] Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// GET /api/webhooks/stripe - Health check
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'active',
    endpoint: 'Stripe Webhook Handler',
    timestamp: new Date().toISOString(),
  })
}
