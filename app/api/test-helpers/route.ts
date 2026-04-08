import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import * as testHelpers from '@/lib/stripe/test-helpers'

/**
 * POST /api/test-helpers
 * Admin-only endpoint for test operations in sandbox
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = createServiceClient()

    // Verify admin access
    if (!body.adminId || body.adminId !== 'admin-chase-bank') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    const operation = body.operation

    let result: any

    switch (operation) {
      case 'add_funds':
        if (!body.financialAccountId || !body.amount) {
          return NextResponse.json(
            { error: 'Missing required fields: financialAccountId, amount' },
            { status: 400 }
          )
        }

        result = await testHelpers.addTestFundsToAccount(
          body.financialAccountId,
          body.amount,
          body.source || 'test_wire'
        )

        // Log operation
        if (result.success) {
          await supabase.from('stripe_test_operations').insert({
            admin_id: body.adminId,
            operation_type: 'add_funds',
            financial_account_id: body.financialAccountId,
            amount: body.amount,
            description: `Added ${body.amount} USD to account`,
            status: 'success',
            stripe_object_id: result.strikeId,
            metadata: { source: body.source || 'test_wire' },
          })
        }

        break

      case 'simulate_transfer':
        if (!body.financialAccountId || !body.amount) {
          return NextResponse.json(
            { error: 'Missing required fields: financialAccountId, amount' },
            { status: 400 }
          )
        }

        result = await testHelpers.simulateInboundTransfer(
          body.financialAccountId,
          body.amount,
          body.description
        )

        if (result.success) {
          await supabase.from('stripe_test_operations').insert({
            admin_id: body.adminId,
            operation_type: 'simulate_transfer',
            financial_account_id: body.financialAccountId,
            amount: body.amount,
            description: body.description || 'Simulated inbound transfer',
            status: 'success',
            stripe_object_id: result.strikeId,
          })
        }

        break

      case 'simulate_card_auth':
        if (!body.cardId || !body.amount) {
          return NextResponse.json(
            { error: 'Missing required fields: cardId, amount' },
            { status: 400 }
          )
        }

        result = await testHelpers.simulateCardAuthorization(
          body.cardId,
          body.amount,
          body.merchantName || 'Test Merchant'
        )

        if (result.success) {
          await supabase.from('stripe_test_operations').insert({
            admin_id: body.adminId,
            operation_type: 'simulate_transaction',
            card_id: body.cardId,
            amount: body.amount,
            description: `Card auth: ${body.merchantName || 'Test Merchant'}`,
            status: 'success',
            stripe_object_id: result.transactionId,
          })
        }

        break

      case 'simulate_obligation':
        if (!body.financialAccountId || !body.creditPolicyId || !body.amount) {
          return NextResponse.json(
            {
              error: 'Missing required fields: financialAccountId, creditPolicyId, amount',
            },
            { status: 400 }
          )
        }

        result = await testHelpers.simulateFundingObligation(
          body.financialAccountId,
          body.creditPolicyId,
          body.amount
        )

        if (result.success) {
          await supabase.from('stripe_test_operations').insert({
            admin_id: body.adminId,
            operation_type: 'simulate_obligation',
            financial_account_id: body.financialAccountId,
            amount: body.amount,
            description: `Funding obligation: ${body.amount} USD`,
            status: 'success',
            stripe_object_id: result.obligationId,
          })
        }

        break

      case 'get_balance':
        if (!body.financialAccountId) {
          return NextResponse.json(
            { error: 'Missing required field: financialAccountId' },
            { status: 400 }
          )
        }

        result = await testHelpers.getTestAccountBalance(body.financialAccountId)
        break

      case 'clear_data':
        if (!body.financialAccountId) {
          return NextResponse.json(
            { error: 'Missing required field: financialAccountId' },
            { status: 400 }
          )
        }

        result = await testHelpers.clearTestData(body.financialAccountId)

        if (result.success) {
          await supabase.from('stripe_test_operations').insert({
            admin_id: body.adminId,
            operation_type: 'reset',
            financial_account_id: body.financialAccountId,
            description: 'Test data cleared',
            status: 'success',
          })
        }

        break

      default:
        return NextResponse.json(
          {
            error: `Unknown operation: ${operation}. Valid operations: add_funds, simulate_transfer, simulate_card_auth, simulate_obligation, get_balance, clear_data`,
          },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: result?.success || true,
      operation,
      result,
    })
  } catch (error) {
    console.error('[v0] Error in test helper:', error)
    return NextResponse.json(
      { error: 'Test helper operation failed' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/test-helpers
 * Get test operation history
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    const { searchParams } = new URL(request.url)
    const adminId = searchParams.get('adminId')

    if (!adminId || adminId !== 'admin-chase-bank') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    const { data, error } = await supabase
      .from('stripe_test_operations')
      .select('*')
      .eq('admin_id', adminId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('[v0] Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch test operations' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      operations: data || [],
      total: data?.length || 0,
    })
  } catch (error) {
    console.error('[v0] Error fetching test operations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch test operations' },
      { status: 500 }
    )
  }
}
