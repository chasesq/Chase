import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import * as creditUtils from '@/lib/stripe/credit'

/**
 * GET /api/credit/policies
 * List all credit policies
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    let query = supabase
      .from('stripe_credit_policies')
      .select('*')

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query

    if (error) {
      console.error('[v0] Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch policies' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      policies: data || [],
      total: data?.length || 0,
    })
  } catch (error) {
    console.error('[v0] Error listing policies:', error)
    return NextResponse.json(
      { error: 'Failed to list policies' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/credit/policies
 * Create a new credit policy
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = createServiceClient()

    if (!body.userId || !body.creditLimitAmount) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, creditLimitAmount' },
        { status: 400 }
      )
    }

    // Create credit policy via utils
    const result = await creditUtils.createCreditPolicy({
      connectedAccountId: body.connectedAccountId || body.userId,
      creditLimitAmount: body.creditLimitAmount,
      currency: body.currency || 'usd',
      paymentInterval: body.paymentInterval || 'monthly',
      paymentDaysDue: body.paymentDaysDue || 30,
      prefundingEnabled: body.prefundingEnabled !== false,
      prefundingPercentage: body.prefundingPercentage || 100,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    // Store in database
    const billingCycleStart = new Date()
    const nextPaymentDue = new Date()
    nextPaymentDue.setDate(nextPaymentDue.getDate() + (body.paymentDaysDue || 30))

    const { data, error: dbError } = await supabase
      .from('stripe_credit_policies')
      .insert({
        user_id: body.userId,
        stripe_credit_policy_id: result.policyId,
        credit_limit: body.creditLimitAmount,
        currency: body.currency || 'usd',
        payment_interval: body.paymentInterval || 'monthly',
        payment_days_due: body.paymentDaysDue || 30,
        prefunding_enabled: body.prefundingEnabled !== false,
        prefunding_percentage: body.prefundingPercentage || 100,
        policy_status: 'active',
        billing_cycle_start_date: billingCycleStart.toISOString().split('T')[0],
        next_payment_due_date: nextPaymentDue.toISOString().split('T')[0],
        metadata: { created_via: 'api' },
      })
      .select()
      .single()

    if (dbError) {
      console.error('[v0] Database error:', dbError)
      return NextResponse.json(
        { error: 'Failed to store policy' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      policyId: result.policyId,
      creditLimit: body.creditLimitAmount,
      paymentTerms: result.paymentTerms,
      message: 'Credit policy created successfully',
    })
  } catch (error) {
    console.error('[v0] Error creating policy:', error)
    return NextResponse.json(
      { error: 'Failed to create policy' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/credit/policies
 * Update a credit policy
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = createServiceClient()

    if (!body.policyId) {
      return NextResponse.json(
        { error: 'Missing policyId' },
        { status: 400 }
      )
    }

    const result = await creditUtils.updateCreditTerms(body.policyId, {
      creditLimitAmount: body.creditLimitAmount,
      paymentDaysDue: body.paymentDaysDue,
      prefundingPercentage: body.prefundingPercentage,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    // Update in database
    const updates: any = {}
    if (body.creditLimitAmount) updates.credit_limit = body.creditLimitAmount
    if (body.paymentDaysDue) updates.payment_days_due = body.paymentDaysDue
    if (body.prefundingPercentage) updates.prefunding_percentage = body.prefundingPercentage

    const { error: dbError } = await supabase
      .from('stripe_credit_policies')
      .update(updates)
      .eq('stripe_credit_policy_id', body.policyId)

    if (dbError) {
      console.error('[v0] Database error:', dbError)
    }

    return NextResponse.json({
      success: true,
      message: 'Credit policy updated successfully',
    })
  } catch (error) {
    console.error('[v0] Error updating policy:', error)
    return NextResponse.json(
      { error: 'Failed to update policy' },
      { status: 500 }
    )
  }
}
