import 'server-only'

import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

/**
 * Reconciliation result interface
 */
export interface ReconciliationResult {
  totalStripePayments: number
  totalLocalTransactions: number
  matchedCount: number
  discrepanciesCount: number
  unmatchedStripeCount: number
  unmatchedLocalCount: number
  discrepancies: Array<{
    type: string
    stripePayment?: any
    localTransaction?: any
    details: string
  }>
}

/**
 * Run full payment reconciliation between Stripe and local records
 */
export async function runPaymentReconciliation(
  runType: 'manual' | 'scheduled' | 'triggered' = 'manual'
): Promise<ReconciliationResult> {
  const supabase = createServiceClient()
  const startTime = Date.now()

  console.log('[v0] Starting payment reconciliation:', runType)

  try {
    // Create reconciliation log entry
    const { data: logEntry } = await supabase
      .from('payment_reconciliation_logs')
      .insert({
        run_type: runType,
        status: 'started',
      })
      .select()
      .single()

    // Fetch all Stripe payments from the past 90 days
    const stripePayments = await fetchStripePayments()
    console.log('[v0] Fetched', stripePayments.length, 'payments from Stripe')

    // Fetch all local transactions from the past 90 days
    const { data: localTransactions } = await supabase
      .from('transactions')
      .select('*')
      .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })

    console.log('[v0] Fetched', localTransactions?.length || 0, 'transactions from database')

    // Reconcile payments
    const result = reconcilePayments(stripePayments, localTransactions || [])

    // Store discrepancies
    const discrepancyIds: string[] = []
    for (const discrepancy of result.discrepancies) {
      const { data: discrepancyRecord } = await supabase
        .from('payment_discrepancies')
        .insert({
          discrepancy_type: discrepancy.type,
          stripe_amount_cents: discrepancy.stripePayment?.amount_cents,
          local_amount_cents: discrepancy.localTransaction?.amount,
          stripe_status: discrepancy.stripePayment?.status,
          local_status: discrepancy.localTransaction?.status,
          status: 'open',
        })
        .select('id')
        .single()

      if (discrepancyRecord?.id) {
        discrepancyIds.push(discrepancyRecord.id)
      }
    }

    // Update reconciliation log
    const durationMs = Date.now() - startTime
    const { error: updateError } = await supabase
      .from('payment_reconciliation_logs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        total_stripe_payments: result.totalStripePayments,
        total_local_transactions: result.totalLocalTransactions,
        matched_count: result.matchedCount,
        discrepancies_count: result.discrepanciesCount,
        unmatched_stripe_count: result.unmatchedStripeCount,
        unmatched_local_count: result.unmatchedLocalCount,
        reconciliation_results: {
          discrepancies: result.discrepancies.map(d => ({
            type: d.type,
            details: d.details,
          })),
        },
        duration_ms: durationMs,
        requires_review: result.discrepanciesCount > 0,
      })
      .eq('id', logEntry?.id)

    if (updateError) {
      console.error('[v0] Error updating reconciliation log:', updateError)
    }

    console.log('[v0] Reconciliation complete:', result)
    return result
  } catch (error: any) {
    console.error('[v0] Reconciliation error:', error)
    throw error
  }
}

/**
 * Fetch all payments from Stripe
 */
async function fetchStripePayments(): Promise<any[]> {
  const payments: any[] = []
  let hasMore = true
  let startingAfter: string | undefined

  try {
    while (hasMore) {
      const paymentIntents = await stripe.paymentIntents.list({
        limit: 100,
        starting_after: startingAfter,
        expand: ['data.charges.data.refunds'],
      })

      for (const pi of paymentIntents.data) {
        // Filter to last 90 days
        const created = new Date(pi.created * 1000)
        const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
        if (created < ninetyDaysAgo) {
          hasMore = false
          break
        }

        // Get charge details
        if (pi.latest_charge) {
          const charge = await stripe.charges.retrieve(pi.latest_charge as string)
          payments.push({
            payment_intent_id: pi.id,
            stripe_charge_id: charge.id,
            amount_cents: pi.amount,
            currency: pi.currency,
            status: pi.status,
            created: new Date(pi.created * 1000).toISOString(),
            payment_method: charge.payment_method_details?.type,
            metadata: pi.metadata,
          })
        }
      }

      if (paymentIntents.has_more && paymentIntents.data.length > 0) {
        startingAfter = paymentIntents.data[paymentIntents.data.length - 1].id
      } else {
        hasMore = false
      }
    }
  } catch (error) {
    console.error('[v0] Error fetching Stripe payments:', error)
  }

  return payments
}

/**
 * Reconcile Stripe payments with local transactions
 */
function reconcilePayments(stripePayments: any[], localTransactions: any[]): ReconciliationResult {
  const result: ReconciliationResult = {
    totalStripePayments: stripePayments.length,
    totalLocalTransactions: localTransactions.length,
    matchedCount: 0,
    discrepanciesCount: 0,
    unmatchedStripeCount: 0,
    unmatchedLocalCount: 0,
    discrepancies: [],
  }

  const matchedStripeIds = new Set<string>()
  const matchedLocalIds = new Set<string>()

  // Match Stripe payments to local transactions
  for (const stripePayment of stripePayments) {
    let matched = false

    for (const localTx of localTransactions) {
      // Check various matching criteria
      const amountMatches = stripePayment.amount_cents === (localTx.amount * 100)
      const currencyMatches = stripePayment.currency === (localTx.currency || 'usd')
      const timeMatches =
        Math.abs(
          new Date(stripePayment.created).getTime() - new Date(localTx.created_at).getTime()
        ) < 60000 // Within 1 minute

      // Match by amount and currency within time window
      if (amountMatches && currencyMatches && timeMatches) {
        matched = true
        matchedStripeIds.add(stripePayment.payment_intent_id)
        matchedLocalIds.add(localTx.id)
        result.matchedCount++
        break
      }
    }

    if (!matched) {
      result.unmatchedStripeCount++
      result.discrepancies.push({
        type: 'missing_local_record',
        stripePayment,
        details: `Stripe payment ${stripePayment.payment_intent_id} has no matching local transaction`,
      })
      result.discrepanciesCount++
    }
  }

  // Find local transactions without Stripe matches
  for (const localTx of localTransactions) {
    if (!matchedLocalIds.has(localTx.id)) {
      // Only report as unmatched if it's a recent credit/deposit
      if (
        (localTx.type === 'credit' || localTx.type === 'deposit') &&
        localTx.status === 'completed'
      ) {
        result.unmatchedLocalCount++
        result.discrepancies.push({
          type: 'missing_stripe_record',
          localTransaction: localTx,
          details: `Local transaction ${localTx.id} has no matching Stripe payment`,
        })
        result.discrepanciesCount++
      }
    }
  }

  return result
}

/**
 * Get reconciliation status
 */
export async function getReconciliationStatus() {
  const supabase = createServiceClient()

  const { data: logs } = await supabase
    .from('payment_reconciliation_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)

  const { data: discrepancies } = await supabase
    .from('payment_discrepancies')
    .select('*')
    .eq('status', 'open')
    .order('created_at', { ascending: false })

  return {
    lastReconciliation: logs?.[0],
    recentRuns: logs || [],
    openDiscrepancies: discrepancies || [],
    openDiscrepancyCount: discrepancies?.length || 0,
  }
}

/**
 * Resolve a discrepancy
 */
export async function resolveDiscrepancy(
  discrepancyId: string,
  resolution: 'matched' | 'duplicate' | 'cannot_resolve',
  notes?: string
) {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('payment_discrepancies')
    .update({
      status: 'resolved',
      resolution_notes: notes,
      resolved_at: new Date().toISOString(),
    })
    .eq('id', discrepancyId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to resolve discrepancy: ${error.message}`)
  }

  return data
}

/**
 * Get detailed reconciliation report
 */
export async function getReconciliationReport(
  logId?: string
) {
  const supabase = createServiceClient()

  if (logId) {
    const { data: log } = await supabase
      .from('payment_reconciliation_logs')
      .select('*')
      .eq('id', logId)
      .single()

    const { data: discrepancies } = await supabase
      .from('payment_discrepancies')
      .select('*')
      .ilike('created_at', log?.run_date)

    return {
      log,
      discrepancies,
    }
  }

  // Return latest report
  const { data: latestLog } = await supabase
    .from('payment_reconciliation_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const { data: discrepancies } = await supabase
    .from('payment_discrepancies')
    .select('*')
    .gte('created_at', latestLog?.run_date)

  return {
    log: latestLog,
    discrepancies,
  }
}
