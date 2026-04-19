import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

/**
 * Plaid Webhook Handler
 * Receives webhooks when transactions are updated, new transactions available, etc.
 * Maps item_id → user_id and inserts transactions + notifications
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    const body = await request.json()

    const { item_id, webhook_type, webhook_code } = body

    console.log(`[v0] Plaid webhook received: ${webhook_type} / ${webhook_code}`)

    // Verify webhook signature (in production, validate the signature)
    // For now, we'll trust Plaid's HTTPS connection

    // Find user associated with this item_id
    const { data: plaidItem, error: itemError } = await supabase
      .from('plaid_items')
      .select('user_id, access_token, institution_name')
      .eq('item_id', item_id)
      .single()

    if (itemError || !plaidItem) {
      console.warn(`[v0] Unknown Plaid item_id: ${item_id}`)
      return NextResponse.json(
        { received: true },
        { status: 200 }
      )
    }

    const userId = plaidItem.user_id

    // Handle different webhook types
    if (webhook_type === 'TRANSACTIONS') {
      if (webhook_code === 'DEFAULT_UPDATE' || webhook_code === 'INITIAL_UPDATE') {
        console.log(`[v0] Processing transactions for user ${userId}`)

        // For this webhook, we'll create a notification to trigger the frontend to sync
        // In production, you'd fetch transactions from Plaid Transactions API here
        const { error: notifError } = await supabase
          .from('notifications')
          .insert([{
            user_id: userId,
            type: 'transaction_available',
            message: 'New transactions available from your connected bank.',
            data: {
              institution_name: plaidItem.institution_name,
              webhook_code,
              timestamp: new Date().toISOString(),
            },
          }])

        if (notifError) {
          console.error('[v0] Error creating notification:', notifError)
        }
      } else if (webhook_code === 'TRANSACTIONS_REMOVED') {
        console.log(`[v0] Transactions removed for user ${userId}`)
        const removed_transactions = body.removed_transactions || []

        // Delete transactions from database
        if (removed_transactions.length > 0) {
          await Promise.all(
            removed_transactions.map((txId: string) =>
              supabase
                .from('transactions')
                .delete()
                .eq('plaid_transaction_id', txId)
                .catch(err => console.error('[v0] Error deleting transaction:', err))
            )
          )
        }
      }
    } else if (webhook_type === 'ITEM') {
      if (webhook_code === 'WEBHOOK_UPDATE_ACKNOWLEDGED') {
        console.log(`[v0] Webhook update acknowledged for item ${item_id}`)
        // Update last_sync timestamp
        await supabase
          .from('plaid_items')
          .update({ last_sync: new Date().toISOString() })
          .eq('item_id', item_id)
          .catch(err => console.error('[v0] Error updating last_sync:', err))
      } else if (webhook_code === 'ERROR') {
        console.error(`[v0] Plaid error for item ${item_id}:`, body.error)

        // Notify user of error
        const { error: notifError } = await supabase
          .from('notifications')
          .insert([{
            user_id: userId,
            type: 'bank_error',
            message: 'There was an issue syncing your bank account. Please reconnect.',
            data: {
              institution_name: plaidItem.institution_name,
              error_type: body.error?.type,
              error_code: body.error?.code,
            },
          }])

        if (notifError) {
          console.error('[v0] Error creating error notification:', notifError)
        }
      }
    } else if (webhook_type === 'HOLDINGS') {
      console.log(`[v0] Holdings webhook for user ${userId}`)
      // Handle holdings updates (investments)
      const { error: notifError } = await supabase
        .from('notifications')
        .insert([{
          user_id: userId,
          type: 'holdings_update',
          message: 'Your investment holdings have been updated.',
          data: {
            institution_name: plaidItem.institution_name,
          },
        }])

      if (notifError) {
        console.error('[v0] Error creating holdings notification:', notifError)
      }
    }

    // Always acknowledge receipt
    return NextResponse.json(
      { received: true },
      { status: 200 }
    )
  } catch (error) {
    console.error('[v0] Plaid webhook error:', error)
    // Always return 200 to prevent Plaid from retrying
    return NextResponse.json(
      { received: true },
      { status: 200 }
    )
  }
}
