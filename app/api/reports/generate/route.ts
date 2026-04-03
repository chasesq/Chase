import { neon } from '@neondatabase/serverless'
import { NextRequest, NextResponse } from 'next/server'

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('user-id')
    const reportType = request.nextUrl.searchParams.get('type')

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let query
    if (reportType) {
      query = sql`
        SELECT * FROM generated_reports 
        WHERE user_id = ${userId} AND report_type = ${reportType}
        ORDER BY created_at DESC
        LIMIT 10
      `
    } else {
      query = sql`
        SELECT * FROM generated_reports 
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
        LIMIT 20
      `
    }

    const reports = await query
    return NextResponse.json(reports)
  } catch (error) {
    console.error('[v0] Error fetching reports:', error)
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('user-id')
    const body = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Generate report
    const result = await sql`
      INSERT INTO generated_reports (
        user_id, report_type, date_from, date_to, file_format, status
      ) VALUES (
        ${userId}, ${body.report_type}, ${body.date_from}, ${body.date_to},
        ${body.file_format || 'pdf'}, 'pending'
      )
      RETURNING *
    `

    // TODO: Trigger async report generation job
    // For now, return the record with pending status
    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error('[v0] Error creating report:', error)
    return NextResponse.json({ error: 'Failed to create report' }, { status: 500 })
  }
}
