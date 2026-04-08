import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { validateStepUpToken, consumeStepUpToken } from '@/lib/auth/stepup'
import { getAuth0MyAccountClient } from '@/lib/auth0/my-account-client'

// Sensitive fields that require step-up authentication
const SENSITIVE_FIELDS = ['email', 'phone', 'firstName', 'lastName']

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      firstName: user.first_name || '',
      lastName: user.last_name || '',
      phone: user.phone || '',
      profilePicture: user.profile_picture || null,
      twoFactorEnabled: user.two_factor_enabled || false,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    })
  } catch (error) {
    console.error('[v0] Profile GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, firstName, lastName, phone, profilePicture, twoFactorEnabled } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if any sensitive fields are being updated
    const updatesSensitiveFields = SENSITIVE_FIELDS.some(
      (field) =>
        body[field] !== undefined &&
        (field === 'email' ? body[field] !== email : true)
    )

    // If sensitive fields are being updated, verify step-up authentication
    if (updatesSensitiveFields) {
      const stepUpToken = request.headers.get('x-stepup-token') ||
                          request.cookies.get('stepup-token')?.value

      if (!stepUpToken || !validateStepUpToken(stepUpToken)) {
        return NextResponse.json(
          { error: 'Step-up authentication required for this operation' },
          { status: 403 }
        )
      }

      // Consume the token (one-time use)
      consumeStepUpToken(stepUpToken)
    }

    const supabase = createServiceClient()

    // Find user first
    const { data: user, error: findError } = await supabase
      .from('users')
      .select('id, auth0_id')
      .eq('email', email)
      .single()

    if (findError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (firstName !== undefined) updateData.first_name = firstName
    if (lastName !== undefined) updateData.last_name = lastName
    if (phone !== undefined) updateData.phone = phone
    if (profilePicture !== undefined) updateData.profile_picture = profilePicture
    if (twoFactorEnabled !== undefined) updateData.two_factor_enabled = twoFactorEnabled

    // Update in Supabase
    const { data: updated, error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      )
    }

    // Sync with Auth0 if user has Auth0 ID
    if (user.auth0_id) {
      try {
        const auth0Client = getAuth0MyAccountClient()
        const auth0Updates: any = {}

        if (firstName !== undefined || lastName !== undefined) {
          auth0Updates.given_name = firstName
          auth0Updates.family_name = lastName
        }
        if (phone !== undefined) {
          auth0Updates.phone_number = phone
        }

        // Update user metadata for additional fields
        const metadata: any = {}
        if (firstName !== undefined) metadata.first_name = firstName
        if (lastName !== undefined) metadata.last_name = lastName

        if (Object.keys(auth0Updates).length > 0) {
          await auth0Client.updateUserProfile(user.auth0_id, auth0Updates)
        }
        if (Object.keys(metadata).length > 0) {
          await auth0Client.updateUserMetadata(user.auth0_id, metadata)
        }
      } catch (auth0Error) {
        console.error('[v0] Failed to sync with Auth0:', auth0Error)
        // Log the error but don't fail the request
        // The local update was successful, Auth0 sync is secondary
      }
    }

    // Add audit log entry
    try {
      await supabase.from('audit_logs').insert({
        user_id: user.id,
        action: 'profile_updated',
        details: {
          updated_fields: Object.keys(updateData).filter(k => k !== 'updated_at'),
          requires_stepup: updatesSensitiveFields,
        },
        created_at: new Date().toISOString(),
      })
    } catch (auditError) {
      console.error('[v0] Failed to log audit entry:', auditError)
    }

    return NextResponse.json({
      success: true,
      profile: {
        id: updated.id,
        email: updated.email,
        firstName: updated.first_name || '',
        lastName: updated.last_name || '',
        phone: updated.phone || '',
        profilePicture: updated.profile_picture || null,
        twoFactorEnabled: updated.two_factor_enabled || false,
        createdAt: updated.created_at,
        updatedAt: updated.updated_at,
      },
    })
  } catch (error) {
    console.error('[v0] Profile PUT error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
