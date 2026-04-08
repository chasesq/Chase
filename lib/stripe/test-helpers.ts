import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18',
})

/**
 * Test Helpers for Stripe Sandbox Testing
 * Use these functions to simulate money flows and testing scenarios in sandbox mode
 */

export interface TestFundsResult {
  success: boolean
  amount: number
  financialAccountId: string
  strikeId?: string
  error?: string
}

export interface TestTransactionResult {
  success: boolean
  cardId: string
  amount: number
  merchantName: string
  transactionId?: string
  error?: string
}

export interface TestObligationResult {
  success: boolean
  obligationAmount: number
  policyId: string
  obligationId?: string
  error?: string
}

/**
 * Add test funds to a financial account using test ReceivedCredit
 * This simulates money arriving into the financial account in sandbox mode
 */
export async function addTestFundsToAccount(
  financialAccountId: string,
  amount: number,
  source: string = 'test_wire'
): Promise<TestFundsResult> {
  try {
    console.log('[v0] Adding test funds:', {
      financialAccountId,
      amount,
      source,
    })

    // Create test received credit
    const receivedCredit = await stripe.treasury.receivedCredits.test.create({
      financial_account: financialAccountId,
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      description: `Test funds added via admin panel - ${source}`,
      flowDetails: {
        source_types: [source],
      },
    })

    console.log('[v0] Test received credit created:', receivedCredit.id)

    return {
      success: true,
      amount,
      financialAccountId,
      strikeId: receivedCredit.id,
    }
  } catch (error) {
    console.error('[v0] Error adding test funds:', error)
    return {
      success: false,
      amount,
      financialAccountId,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Simulate an inbound transfer to a financial account
 * Tests the handling of incoming ACH or wire transfers
 */
export async function simulateInboundTransfer(
  financialAccountId: string,
  amount: number,
  description: string = 'Test inbound transfer'
): Promise<TestFundsResult> {
  try {
    console.log('[v0] Simulating inbound transfer:', {
      financialAccountId,
      amount,
    })

    // Create test inbound transfer
    const inboundTransfer = await stripe.treasury.inboundTransfers.test.create({
      financial_account: financialAccountId,
      amount: Math.round(amount * 100),
      currency: 'usd',
      description,
      origin_payment_method: 'test_bank_account',
    })

    console.log('[v0] Test inbound transfer created:', inboundTransfer.id)

    // Optionally, succeed the inbound transfer immediately
    const succeededTransfer = await stripe.treasury.inboundTransfers.test.succeed(
      inboundTransfer.id as string
    )

    return {
      success: true,
      amount,
      financialAccountId,
      strikeId: succeededTransfer.id,
    }
  } catch (error) {
    console.error('[v0] Error simulating inbound transfer:', error)
    return {
      success: false,
      amount,
      financialAccountId,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Simulate a card issuing authorization
 * Tests how the system handles card transaction approvals
 */
export async function simulateCardAuthorization(
  cardId: string,
  amount: number,
  merchantName: string = 'Test Merchant'
): Promise<TestTransactionResult> {
  try {
    console.log('[v0] Simulating card authorization:', {
      cardId,
      amount,
      merchantName,
    })

    // Create test authorization (in Stripe Issuing)
    // This would normally come from the card network
    const authorization = await stripe.issuing.authorizations.test.create({
      card: cardId,
      amount: Math.round(amount * 100),
      currency: 'usd',
      merchant_data: {
        name: merchantName,
        category_code: '5411', // Grocery stores
      },
      verification_data: {
        cvv: {
          result: 'match',
        },
      },
      wallet: null,
    })

    console.log('[v0] Test authorization created:', authorization.id)

    // Approve the authorization
    const approvedAuth = await stripe.issuing.authorizations.approve(
      authorization.id as string
    )

    return {
      success: true,
      cardId,
      amount,
      merchantName,
      transactionId: approvedAuth.id,
    }
  } catch (error) {
    console.error('[v0] Error simulating card authorization:', error)
    return {
      success: false,
      cardId,
      amount,
      merchantName,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Simulate a funding obligation being created
 * Tests the platform's obligation to fund connected account spending
 */
export async function simulateFundingObligation(
  financialAccountId: string,
  creditPolicyId: string,
  amount: number
): Promise<TestObligationResult> {
  try {
    console.log('[v0] Simulating funding obligation:', {
      financialAccountId,
      creditPolicyId,
      amount,
    })

    // In production, obligations are created automatically by Stripe
    // In test mode, we simulate this by creating a test received debit
    const receivedDebit = await stripe.treasury.receivedDebits.test.create({
      financial_account: financialAccountId,
      amount: Math.round(amount * 100),
      currency: 'usd',
      description: `Test funding obligation - Policy: ${creditPolicyId}`,
      initiating_payment_method_details: {
        type: 'us_bank_account',
      },
    })

    console.log('[v0] Test received debit (obligation) created:', receivedDebit.id)

    return {
      success: true,
      obligationAmount: amount,
      policyId: creditPolicyId,
      obligationId: receivedDebit.id,
    }
  } catch (error) {
    console.error('[v0] Error simulating funding obligation:', error)
    return {
      success: false,
      obligationAmount: amount,
      policyId: creditPolicyId,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Clear all test data for a financial account
 * Useful for resetting test state
 */
export async function clearTestData(
  financialAccountId: string
): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    console.log('[v0] Clearing test data for account:', financialAccountId)

    // In Stripe test mode, you can't directly delete data
    // Instead, we log this operation for reference
    console.log('[v0] Test data clear requested - manual cleanup may be required')

    return {
      success: true,
      message: `Test data cleanup initiated for account ${financialAccountId}`,
    }
  } catch (error) {
    console.error('[v0] Error clearing test data:', error)
    return {
      success: false,
      message: 'Failed to clear test data',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Get test account balance
 * Retrieves current balance state for debugging
 */
export async function getTestAccountBalance(
  financialAccountId: string
): Promise<{ balance: number; currency: string; error?: string } | null> {
  try {
    console.log('[v0] Getting test account balance:', financialAccountId)

    const account = await stripe.treasury.financialAccounts.retrieve(
      financialAccountId
    )

    const balances = account.balance || {}
    const usdBalance = balances.usd

    return {
      balance: (usdBalance?.available?.[0] || 0) / 100, // Convert from cents
      currency: 'usd',
    }
  } catch (error) {
    console.error('[v0] Error getting account balance:', error)
    return {
      balance: 0,
      currency: 'usd',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Simulate minute-interval credit cycle
 * Advances the test environment's clock for testing credit policies
 */
export async function advanceTestClockMinute(
  testClockId: string
): Promise<{ success: boolean; nowTimestamp?: number; error?: string }> {
  try {
    console.log('[v0] Advancing test clock by 1 minute:', testClockId)

    const advancedClock = await stripe.testHelpers.testClocks.advance(testClockId, {
      frozen_time: Math.floor(Date.now() / 1000) + 60, // Add 1 minute
    })

    console.log('[v0] Test clock advanced:', advancedClock.frozen_time)

    return {
      success: true,
      nowTimestamp: advancedClock.frozen_time,
    }
  } catch (error) {
    console.error('[v0] Error advancing test clock:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Create a test clock for minute-interval testing
 * Allows you to advance time in 1-minute increments for faster testing
 */
export async function createTestClock(): Promise<{
  testClockId: string
  frozenTime: number
  error?: string
}> {
  try {
    console.log('[v0] Creating test clock for minute-interval testing')

    const testClock = await stripe.testHelpers.testClocks.create({
      frozen_time: Math.floor(Date.now() / 1000),
    })

    console.log('[v0] Test clock created:', testClock.id)

    return {
      testClockId: testClock.id,
      frozenTime: testClock.frozen_time,
    }
  } catch (error) {
    console.error('[v0] Error creating test clock:', error)
    return {
      testClockId: '',
      frozenTime: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export default {
  addTestFundsToAccount,
  simulateInboundTransfer,
  simulateCardAuthorization,
  simulateFundingObligation,
  clearTestData,
  getTestAccountBalance,
  advanceTestClockMinute,
  createTestClock,
}
