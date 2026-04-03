import { neon } from '@neondatabase/serverless'
import { NextRequest, NextResponse } from 'next/server'

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('user-id')
    const status = request.nextUrl.searchParams.get('status') || 'active'

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const bills = await sql`
      SELECT * FROM bills 
      WHERE user_id = ${userId} AND status = ${status}
      ORDER BY due_date ASC
    `

    return NextResponse.json(bills)
  } catch (error) {
    console.error('[v0] Error fetching bills:', error)
    return NextResponse.json({ error: 'Failed to fetch bills' }, { status: 500 })
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
      INSERT INTO bills (
        user_id, payee_name, payee_account, amount, due_date,
        frequency, category, reminder_days_before, notes
      ) VALUES (
        ${userId}, ${body.payee_name}, ${body.payee_account || null}, 
        ${body.amount}, ${body.due_date}, ${body.frequency || 'monthly'}, 
        ${body.category || null}, ${body.reminder_days_before || 3}, ${body.notes || null}
      )
      RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error('[v0] Error creating bill:', error)
    return NextResponse.json({ error: 'Failed to create bill' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get('user-id')
    const { id, ...updates } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await sql`
      UPDATE bills 
      SET 
        payee_name = COALESCE(${updates.payee_name || null}, payee_name),
        amount = COALESCE(${updates.amount || null}, amount),
        due_date = COALESCE(${updates.due_date || null}, due_date),
        status = COALESCE(${updates.status || null}, status),
        reminder_days_before = COALESCE(${updates.reminder_days_before || null}, reminder_days_before),
        notes = COALESCE(${updates.notes || null}, notes),
        updated_at = NOW()
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error('[v0] Error updating bill:', error)
    return NextResponse.json({ error: 'Failed to update bill' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get('user-id')
    const billId = request.nextUrl.searchParams.get('id')

    if (!userId || !billId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await sql`
      DELETE FROM bills 
      WHERE id = ${billId} AND user_id = ${userId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error deleting bill:', error)
    return NextResponse.json({ error: 'Failed to delete bill' }, { status: 500 })
  }
}
