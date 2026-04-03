import { neon } from '@neondatabase/serverless'
import { NextRequest, NextResponse } from 'next/server'

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('user-id')
    const favorites = request.nextUrl.searchParams.get('favorites') === 'true'

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let query
    if (favorites) {
      query = sql`
        SELECT * FROM transfer_templates 
        WHERE user_id = ${userId} AND is_favorite = true
        ORDER BY last_used_at DESC NULLS LAST
      `
    } else {
      query = sql`
        SELECT * FROM transfer_templates 
        WHERE user_id = ${userId}
        ORDER BY usage_count DESC, last_used_at DESC NULLS LAST
      `
    }

    const templates = await query
    return NextResponse.json(templates)
  } catch (error) {
    console.error('[v0] Error fetching templates:', error)
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
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
      INSERT INTO transfer_templates (
        user_id, name, recipient_name, recipient_account,
        recipient_routing_number, recipient_type, category,
        is_favorite, default_amount, memo_template
      ) VALUES (
        ${userId}, ${body.name}, ${body.recipient_name}, ${body.recipient_account},
        ${body.recipient_routing_number || null}, ${body.recipient_type}, ${body.category || null},
        ${body.is_favorite || false}, ${body.default_amount || null}, ${body.memo_template || null}
      )
      RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error('[v0] Error creating template:', error)
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 })
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
      UPDATE transfer_templates 
      SET 
        name = COALESCE(${updates.name || null}, name),
        is_favorite = COALESCE(${updates.is_favorite || null}, is_favorite),
        category = COALESCE(${updates.category || null}, category),
        memo_template = COALESCE(${updates.memo_template || null}, memo_template),
        updated_at = NOW()
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error('[v0] Error updating template:', error)
    return NextResponse.json({ error: 'Failed to update template' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get('user-id')
    const templateId = request.nextUrl.searchParams.get('id')

    if (!userId || !templateId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await sql`
      DELETE FROM transfer_templates 
      WHERE id = ${templateId} AND user_id = ${userId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error deleting template:', error)
    return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 })
  }
}
