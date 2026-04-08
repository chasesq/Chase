import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import * as creditUtils from '@/lib/stripe/credit'

/**
 * GET /api/credit/obligations
 * List funding obligations
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    const { searchParams } = new URL(request.url)
    const policyId = searchParams.get('policyId')
    const status = searchParams.get('status')

    let query = supabase
      .from('stripe_funding_obligations')
      .select('*')

    if (policyId) {
      query = query.eq('credit_policy_id', policyId)
    }

    if (status) {
      query = query.eq('obligation_status', status)
    }

    const { data, error } = await query.order('due_date', { ascending: false })

    if (error) {
      console.error('[v0] Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch obligations' },
        { status: 500 }
      )
    }

    const obligations = (data || []).map((o: any) => ({
      id: o.id,
      obligationId: o.stripe_obligation_id,
      amount: o.amount,
      currency: o.currency,
      dueDate: o.due_date,
      status: o.obligation_status,
      paidAmount: o.paid_amount,
      paidAt: o.paid_at,
    }))

    return NextResponse.json({
      success: true,
      obligations,
      total: obligations.length,
    })
  } catch (error) {
    console.error('[v0] Error listing obligations:', error)
    return NextResponse.json(
      { error: 'Failed to list obligations' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/credit/obligations
 * Create a new funding obligation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = createServiceClient()

    if (!body.policyId || !body.amount) {
      return NextResponse.json(
        { error: 'Missing required fields: policyId, amount' },
        { status: 400 }
      )
    }

    const dueDate = new Date(body.dueDate || Date.now() + 30 * 24 * 60 * 60 * 1000)

    // Create obligation via utils
    const result = await creditUtils.createFundingObligation(
      body.policyId,
      body.amount,
      dueDate
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    // Store in database
    const { data, error: dbError } = await supabase
      .from('stripe_funding_obligations')
      .insert({
        credit_policy_id: body.policyId,
        financial_account_id: body.financialAccountId,
        stripe_obligation_id: result.obligationId,
        amount: body.amount,
        currency: 'usd',
        cycle_start_date: new Date().toISOString().split('T')[0],
        cycle_end_date: body.cycleEndDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        due_date: dueDate.toISOString().split('T')[0],
        obligation_status: 'open',
        metadata: { created_via: 'api' },
      })
      .select()
      .single()

    if (dbError) {
      console.error('[v0] Database error:', dbError)
      return NextResponse.json(
        { error: 'Failed to store obligation' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      obligationId: result.obligationId,
      amount: body.amount,
      dueDate: result.dueDate,
      message: 'Funding obligation created successfully',
    })
  } catch (error) {
    console.error('[v0] Error creating obligation:', error)
    return NextResponse.json(
      { error: 'Failed to create obligation' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/credit/obligations
 * Pay an obligation
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = createServiceClient()

    if (!body.obligationId || !body.amount) {
      return NextResponse.json(
        { error: 'Missing required fields: obligationId, amount' },
        { status: 400 }
      )
    }

    const result = await creditUtils.payFundingObligation(
      body.obligationId,
      body.amount,
      body.paymentMethod || 'bank_account'
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    // Update obligation status in database
    const { error: dbError } = await supabase
      .from('stripe_funding_obligations')
      .update({
        paid_amount: body.amount,
        paid_at: new Date().toISOString(),
        obligation_status: body.amount >= (body.totalAmount || body.amount) ? 'paid' : 'open',
        payment_method: body.paymentMethod || 'bank_account',
      })
      .eq('stripe_obligation_id', body.obligationId)

    if (dbError) {
      console.error('[v0] Database error:', dbError)
    }

    return NextResponse.json({
      success: true,
      obligationId: body.obligationId,
      paidAmount: body.amount,
      message: 'Funding obligation payment processed',
    })
  } catch (error) {
    console.error('[v0] Error paying obligation:', error)
    return NextResponse.json(
      { error: 'Failed to pay obligation' },
      { status: 500 }
    )
  }
}
