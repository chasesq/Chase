import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import * as issuingUtils from '@/lib/stripe/issuing'
import type { CreateCardholder } from '@/lib/stripe/issuing'

/**
 * GET /api/issuing/cardholders
 * List all cardholders
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '100')

    const result = await issuingUtils.listCardholders(limit)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      cardholders: result.cardholders,
      total: result.total,
    })
  } catch (error) {
    console.error('[v0] Error listing cardholders:', error)
    return NextResponse.json(
      { error: 'Failed to list cardholders' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/issuing/cardholders
 * Create a new cardholder
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = createServiceClient()

    // Validate request
    if (!body.type || !body.email || !body.address) {
      return NextResponse.json(
        { error: 'Missing required fields: type, email, address' },
        { status: 400 }
      )
    }

    const params: CreateCardholder = {
      type: body.type,
      email: body.email,
      phone: body.phone,
      firstName: body.firstName,
      lastName: body.lastName,
      companyName: body.companyName,
      dateOfBirth: body.dateOfBirth,
      address: {
        line1: body.address.line1,
        line2: body.address.line2,
        city: body.address.city,
        state: body.address.state,
        postalCode: body.address.postalCode,
        country: body.address.country,
      },
      taxId: body.taxId,
    }

    // Create cardholder in Stripe
    const result = await issuingUtils.createCardholder(params)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    // Store in database
    const { error: dbError } = await supabase
      .from('stripe_cardholders')
      .insert({
        stripe_cardholder_id: result.stripeCardholderId,
        cardholder_type: body.type,
        first_name: body.firstName,
        last_name: body.lastName,
        company_name: body.companyName,
        email: body.email,
        phone: body.phone,
        street_address: body.address.line1,
        city: body.address.city,
        state_province: body.address.state,
        postal_code: body.address.postalCode,
        country: body.address.country,
        status: 'active',
        kyc_verification: 'verified',
        metadata: { created_via: 'api' },
      })

    if (dbError) {
      console.error('[v0] Database error:', dbError)
      return NextResponse.json(
        { error: 'Failed to store cardholder' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      cardholderId: result.stripeCardholderId,
      message: 'Cardholder created successfully',
    })
  } catch (error) {
    console.error('[v0] Error creating cardholder:', error)
    return NextResponse.json(
      { error: 'Failed to create cardholder' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/issuing/cardholders
 * Update cardholder information
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = createServiceClient()

    if (!body.cardholderId) {
      return NextResponse.json(
        { error: 'Missing cardholderId' },
        { status: 400 }
      )
    }

    const result = await issuingUtils.updateCardholder(body.cardholderId, {
      email: body.email,
      phone: body.phone,
      metadata: body.metadata,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    // Update in database
    const updates: any = {}
    if (body.email) updates.email = body.email
    if (body.phone) updates.phone = body.phone
    if (body.metadata) updates.metadata = body.metadata

    const { error: dbError } = await supabase
      .from('stripe_cardholders')
      .update(updates)
      .eq('stripe_cardholder_id', body.cardholderId)

    if (dbError) {
      console.error('[v0] Database error:', dbError)
    }

    return NextResponse.json({
      success: true,
      message: 'Cardholder updated successfully',
    })
  } catch (error) {
    console.error('[v0] Error updating cardholder:', error)
    return NextResponse.json(
      { error: 'Failed to update cardholder' },
      { status: 500 }
    )
  }
}
