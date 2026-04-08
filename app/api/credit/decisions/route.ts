import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import * as creditUtils from '@/lib/stripe/credit'

/**
 * GET /api/credit/decisions
 * List credit decisions
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    const { searchParams } = new URL(request.url)
    const cardholderId = searchParams.get('cardholderId')
    const decisionType = searchParams.get('decisionType')

    let query = supabase
      .from('stripe_credit_decisions')
      .select('*')

    if (cardholderId) {
      query = query.eq('cardholder_id', cardholderId)
    }

    if (decisionType) {
      query = query.eq('decision_type', decisionType)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('[v0] Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch decisions' },
        { status: 500 }
      )
    }

    const decisions = (data || []).map((d: any) => ({
      id: d.id,
      cardholderId: d.cardholder_id,
      decisionType: d.decision_type,
      decision: d.decision,
      reasonCodes: d.reason_codes,
      adverseActionNoticeSent: d.adverse_action_notice_sent,
      createdAt: d.created_at,
    }))

    return NextResponse.json({
      success: true,
      decisions,
      total: decisions.length,
    })
  } catch (error) {
    console.error('[v0] Error listing decisions:', error)
    return NextResponse.json(
      { error: 'Failed to list decisions' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/credit/decisions
 * Report a credit decision
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = createServiceClient()

    if (!body.cardholderId || !body.policyId || !body.decision) {
      return NextResponse.json(
        { error: 'Missing required fields: cardholderId, policyId, decision' },
        { status: 400 }
      )
    }

    // Report decision via utils
    const result = await creditUtils.reportCreditDecision(
      body.cardholderId,
      body.policyId,
      body.decision,
      body.reasonCodes
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    // Store in database
    const { data, error: dbError } = await supabase
      .from('stripe_credit_decisions')
      .insert({
        cardholder_id: body.cardholderId,
        credit_policy_id: body.policyId,
        decision_type: 'underwriting',
        decision: body.decision,
        reason_codes: body.reasonCodes || [],
        adverse_action_notice_sent: false,
        fcra_compliant: true,
        dispute_rights_explained: false,
        metadata: { reported_via: 'api' },
      })
      .select()
      .single()

    if (dbError) {
      console.error('[v0] Database error:', dbError)
      return NextResponse.json(
        { error: 'Failed to store decision' },
        { status: 500 }
      )
    }

    // If decision is approved_with_conditions or denied, and requires AAN
    let adverseActionSent = false
    if (body.decision !== 'approved' && body.sendAdverseActionNotice) {
      const aanResult = await creditUtils.sendAdverseActionNotice(
        body.cardholderId,
        body.policyId,
        body.noticeEmail || body.email,
        body.reasonCodes
      )

      if (aanResult.success) {
        adverseActionSent = true

        // Update record with AAN sent
        await supabase
          .from('stripe_credit_decisions')
          .update({
            adverse_action_notice_sent: true,
            adverse_action_notice_sent_at: new Date().toISOString(),
          })
          .eq('id', data.id)
      }
    }

    return NextResponse.json({
      success: true,
      decisionId: result.decisionId,
      decision: body.decision,
      adverseActionNoticeSent,
      message: 'Credit decision reported successfully',
    })
  } catch (error) {
    console.error('[v0] Error reporting decision:', error)
    return NextResponse.json(
      { error: 'Failed to report decision' },
      { status: 500 }
    )
  }
}
