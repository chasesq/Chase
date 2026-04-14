import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { validateStepUpToken, consumeStepUpToken } from '@/lib/auth/stepup'
import { getAuth0MyAccountClient } from '@/lib/auth0/my-account-client'
import { profileUpdateSchema, sensitiveFieldSchema } from '@/lib/validation/profile-schema'

// Sensitive fields that require step-up authentication
const SENSITIVE_FIELDS = ['email', 'phone', 'full_name']

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

    // Return all profile fields including extended ones
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
      email_notifications: user.email_notifications ?? true,
      sms_notifications: user.sms_notifications ?? false,
      inapp_notifications: user.inapp_notifications ?? true,
      two_factor_enabled: user.two_factor_enabled ?? false,
      tier: user.tier || 'standard',
      balance: user.balance || 0,
      role: user.role || 'user',
      created_at: user.created_at,
      updated_at: user.updated_at,
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
    const { email, ...updateFields } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Validate the update fields using Zod schema
    const validationResult = profileUpdateSchema.safeParse(updateFields)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    // Check if any sensitive fields are being updated
    const updatesSensitiveFields = SENSITIVE_FIELDS.some(
      (field) => updateFields[field] !== undefined
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

    // Prepare update data - convert camelCase to snake_case for database
    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    // Map all update fields to database column names
    const fieldMapping: Record<string, string> = {
      full_name: 'full_name',
      phone: 'phone',
      address: 'address',
      date_of_birth: 'date_of_birth',
      government_id_type: 'government_id_type',
      account_type_preference: 'account_type_preference',
      currency_preference: 'currency_preference',
      language_preference: 'language_preference',
      email_notifications: 'email_notifications',
      sms_notifications: 'sms_notifications',
      inapp_notifications: 'inapp_notifications',
      two_factor_enabled: 'two_factor_enabled',
    }

    for (const [key, value] of Object.entries(validationResult.data)) {
      const dbColumn = fieldMapping[key]
      if (dbColumn) {
        updateData[dbColumn] = value
      }
    }

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

    // Sync with Auth0 if user has Auth0 ID and name was updated
    if (user.auth0_id && updateFields.full_name) {
      try {
        const auth0Client = getAuth0MyAccountClient()
        const [firstName, ...lastNameParts] = updateFields.full_name.split(' ')
        const lastName = lastNameParts.join(' ')

        await auth0Client.updateUserProfile(user.auth0_id, {
          given_name: firstName,
          family_name: lastName,
        })
      } catch (auth0Error) {
        console.error('[v0] Failed to sync with Auth0:', auth0Error)
        // Log but don't fail the request
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

    // Return updated profile
    return NextResponse.json({
      success: true,
      profile: {
        id: updated.id,
        email: updated.email,
        full_name: updated.full_name || '',
        phone: updated.phone || '',
        address: updated.address || '',
        date_of_birth: updated.date_of_birth || null,
        government_id_type: updated.government_id_type || '',
        account_type_preference: updated.account_type_preference || '',
        currency_preference: updated.currency_preference || 'USD',
        language_preference: updated.language_preference || 'en',
        email_notifications: updated.email_notifications ?? true,
        sms_notifications: updated.sms_notifications ?? false,
        inapp_notifications: updated.inapp_notifications ?? true,
        two_factor_enabled: updated.two_factor_enabled ?? false,
        tier: updated.tier || 'standard',
        role: updated.role || 'user',
        created_at: updated.created_at,
        updated_at: updated.updated_at,
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
