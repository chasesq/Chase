import { neon } from '@neondatabase/serverless'
import { NextRequest, NextResponse } from 'next/server'

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('user-id')
    const month = request.nextUrl.searchParams.get('month') || new Date().getMonth() + 1
    const year = request.nextUrl.searchParams.get('year') || new Date().getFullYear()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const analytics = await sql`
      SELECT * FROM spending_analytics 
      WHERE user_id = ${userId}
      AND period_month = ${parseInt(month as string)}
      AND period_year = ${parseInt(year as string)}
      ORDER BY total_spent DESC
    `

    return NextResponse.json(analytics)
  } catch (error) {
    console.error('[v0] Error fetching analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('user-id')
    const body = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await sql`
      INSERT INTO spending_analytics (
        user_id, period_month, period_year, category, 
        total_spent, transaction_count, average_transaction,
        budget_limit, percent_of_budget, trend_change
      ) VALUES (
        ${userId}, ${body.month}, ${body.year}, ${body.category},
        ${body.total_spent}, ${body.transaction_count}, ${body.average_transaction},
        ${body.budget_limit || null}, ${body.percent_of_budget || null}, ${body.trend_change || null}
      )
      ON CONFLICT (user_id, period_month, period_year, category) 
      DO UPDATE SET
        total_spent = EXCLUDED.total_spent,
        transaction_count = EXCLUDED.transaction_count,
        average_transaction = EXCLUDED.average_transaction,
        budget_limit = EXCLUDED.budget_limit,
        percent_of_budget = EXCLUDED.percent_of_budget,
        trend_change = EXCLUDED.trend_change,
        updated_at = NOW()
      RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error('[v0] Error creating analytics:', error)
    return NextResponse.json({ error: 'Failed to create analytics' }, { status: 500 })
  }
}
