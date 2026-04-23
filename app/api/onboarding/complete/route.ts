import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // In a real application, you would update the user record
    // to mark onboarding as complete
    console.log(`[Onboarding] User ${userId} completed onboarding`)

    return NextResponse.json(
      {
        success: true,
        message: 'Onboarding marked as complete',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[v0] Onboarding completion error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'An error occurred',
      },
      { status: 500 }
    )
  }
}
