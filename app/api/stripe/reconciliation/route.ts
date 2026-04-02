import { NextRequest, NextResponse } from 'next/server'
import {
  runPaymentReconciliation,
  getReconciliationStatus,
  resolveDiscrepancy,
  getReconciliationReport,
} from '@/lib/stripe/reconciliation-service'

// GET /api/stripe/reconciliation - Get reconciliation status
export async function GET(request: NextRequest) {
  try {
    const status = await getReconciliationStatus()
    return NextResponse.json(status)
  } catch (error: any) {
    console.error('[v0] Reconciliation status error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// POST /api/stripe/reconciliation - Trigger reconciliation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, discrepancyId, resolution, notes } = body

    if (action === 'resolve-discrepancy') {
      const result = await resolveDiscrepancy(
        discrepancyId,
        resolution,
        notes
      )
      return NextResponse.json({ success: true, data: result })
    }

    // Default: run reconciliation
    const result = await runPaymentReconciliation('manual')
    return NextResponse.json({
      success: true,
      reconciliation: result,
    })
  } catch (error: any) {
    console.error('[v0] Reconciliation error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
