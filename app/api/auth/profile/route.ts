import { NextRequest, NextResponse } from 'next/server'
import { getUserById, updateUser } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')
    const email = request.nextUrl.searchParams.get('email')

    if (!userId && !email) {
      return NextResponse.json(
        { error: 'User ID or email is required' },
        { status: 400 }
      )
    }

    // TODO: Implement getUserByEmail in db.ts if needed
    // For now, we'll use userId from localStorage
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const user = await getUserById(userId)

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      full_name: user.full_name || '',
      phone: user.phone || '',
      address: user.address || '',
      date_of_birth: user.date_of_birth || null,
      government_id_type: user.government_id_type || '',
      account_type_preference: user.account_type_preference || '',
      currency_preference: user.currency_preference || 'USD',
      language_preference: user.language_preference || 'en',
      role: user.role || 'user',
      created_at: user.created_at,
      updated_at: user.updated_at,
    })
  } catch (error) {
    console.error('[Neon] Profile GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, ...updateFields } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Update user in database
    const updatedUser = await updateUser(userId, updateFields)

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    console.log('[Neon] User profile updated:', userId)

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        full_name: updatedUser.full_name || '',
        phone: updatedUser.phone || '',
        address: updatedUser.address || '',
        date_of_birth: updatedUser.date_of_birth || null,
        government_id_type: updatedUser.government_id_type || '',
        account_type_preference: updatedUser.account_type_preference || '',
        currency_preference: updatedUser.currency_preference || 'USD',
        language_preference: updatedUser.language_preference || 'en',
        role: updatedUser.role || 'user',
        created_at: updatedUser.created_at,
        updated_at: updatedUser.updated_at,
      },
    })
  } catch (error) {
    console.error('[Neon] Profile PUT error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
