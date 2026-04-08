import { createServiceClient } from '@/lib/supabase/server'

export interface MFAPolicy {
  id: string
  organization_id?: string
  policy_name: string
  require_mfa: boolean
  required_factors: string[]
  grace_period_days: number
  enforce_at_login: boolean
  enforce_at_sensitive_operations: boolean
  allowed_factor_types: string[]
  is_active: boolean
}

export interface PolicyCompliance {
  user_id: number
  policy_id: string
  is_compliant: boolean
  enrolled_factors: string[]
  compliant_at?: string
  non_compliant_since?: string
  grace_period_expires_at?: string
}

/**
 * Get applicable MFA policies for a user
 */
export async function getUserMFAPolicies(userId: number): Promise<MFAPolicy[]> {
  const supabase = createServiceClient()

  const { data: policies, error } = await supabase
    .from('mfa_policies')
    .select('*')
    .eq('is_active', true)

  if (error) {
    console.error('[v0] Failed to fetch MFA policies:', error)
    return []
  }

  return policies || []
}

/**
 * Check if user is compliant with MFA policies
 */
export async function checkUserMFACompliance(userId: number): Promise<{ isCompliant: boolean; policies: PolicyCompliance[] }> {
  const supabase = createServiceClient()

  const { data: compliance, error } = await supabase
    .from('mfa_policy_compliance')
    .select('*')
    .eq('user_id', userId)

  if (error) {
    console.error('[v0] Failed to fetch MFA compliance:', error)
    return { isCompliant: true, policies: [] }
  }

  const nonCompliant = compliance?.some((c) => !c.is_compliant) ?? false

  return {
    isCompliant: !nonCompliant,
    policies: compliance || [],
  }
}

/**
 * Get user's enrolled MFA factors
 */
export async function getUserMFAFactors(userId: number): Promise<string[]> {
  const supabase = createServiceClient()

  const factors: string[] = []

  // Check for TOTP
  const { data: totpUser } = await supabase
    .from('users')
    .select('totp_secret')
    .eq('id', userId)
    .single()

  if (totpUser?.totp_secret) {
    factors.push('totp')
  }

  // Check for SMS
  const { data: smsFactors } = await supabase
    .from('sms_factors')
    .select('id')
    .eq('user_id', userId)
    .eq('is_verified', true)

  if (smsFactors && smsFactors.length > 0) {
    factors.push('sms')
  }

  // Check for Passkeys
  const { data: passkeys } = await supabase
    .from('passkey_credentials')
    .select('id')
    .eq('user_id', userId)
    .eq('verified', true)

  if (passkeys && passkeys.length > 0) {
    factors.push('passkey')
  }

  return factors
}

/**
 * Check if user needs to enroll MFA factors
 */
export async function checkMFAEnrollmentNeeded(userId: number): Promise<{
  needsEnrollment: boolean
  missingFactors: string[]
  gracePeriodExpires?: string
}> {
  const policies = await getUserMFAPolicies(userId)
  const { isCompliant, policies: compliance } = await checkUserMFACompliance(userId)
  const enrolledFactors = await getUserMFAFactors(userId)

  if (!policies.some((p) => p.require_mfa) || isCompliant) {
    return { needsEnrollment: false, missingFactors: [] }
  }

  // Find missing factors
  const requiredFactors = policies
    .filter((p) => p.require_mfa)
    .flatMap((p) => p.required_factors)

  const missingFactors = requiredFactors.filter((f) => !enrolledFactors.includes(f))

  const gracePeriodExpires = compliance[0]?.grace_period_expires_at

  return {
    needsEnrollment: missingFactors.length > 0,
    missingFactors,
    gracePeriodExpires,
  }
}

/**
 * Update user's MFA policy compliance status
 */
export async function updateMFACompliance(userId: number): Promise<void> {
  const supabase = createServiceClient()
  const policies = await getUserMFAPolicies(userId)
  const enrolledFactors = await getUserMFAFactors(userId)

  for (const policy of policies) {
    if (!policy.require_mfa) continue

    const hasRequiredFactors = policy.required_factors.every((f) => enrolledFactors.includes(f))

    const { data: existing } = await supabase
      .from('mfa_policy_compliance')
      .select('*')
      .eq('user_id', userId)
      .eq('policy_id', policy.id)
      .single()

    if (existing) {
      await supabase
        .from('mfa_policy_compliance')
        .update({
          is_compliant: hasRequiredFactors,
          enrolled_factors: enrolledFactors,
          compliant_at: hasRequiredFactors ? new Date().toISOString() : existing.compliant_at,
          non_compliant_since: !hasRequiredFactors ? new Date().toISOString() : null,
        })
        .eq('user_id', userId)
        .eq('policy_id', policy.id)
    } else {
      await supabase.from('mfa_policy_compliance').insert({
        user_id: userId,
        policy_id: policy.id,
        is_compliant: hasRequiredFactors,
        enrolled_factors: enrolledFactors,
        compliant_at: hasRequiredFactors ? new Date().toISOString() : null,
        non_compliant_since: !hasRequiredFactors ? new Date().toISOString() : null,
        grace_period_expires_at: policy.grace_period_days
          ? new Date(Date.now() + policy.grace_period_days * 24 * 60 * 60 * 1000).toISOString()
          : null,
      })
    }
  }
}
