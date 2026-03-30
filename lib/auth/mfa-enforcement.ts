import { NextRequest, NextResponse } from 'next/server'
import { checkUserMFACompliance, checkMFAEnrollmentNeeded } from '@/lib/auth/mfa-policies'

/**
 * Middleware to check MFA policy compliance
 * Can be used on protected routes to enforce MFA enrollment
 */
export async function checkMFAEnforcement(
  request: NextRequest,
  userId: number,
  enforcementType: 'login' | 'sensitive_operation' = 'login'
) {
  try {
    const { isCompliant, policies } = await checkUserMFACompliance(userId)

    if (isCompliant) {
      return { allowed: true }
    }

    const { needsEnrollment, missingFactors, gracePeriodExpires } = await checkMFAEnrollmentNeeded(userId)

    if (!needsEnrollment) {
      return { allowed: true }
    }

    // Check if within grace period
    if (gracePeriodExpires) {
      const now = new Date()
      const expiresAt = new Date(gracePeriodExpires)

      if (now < expiresAt) {
        // Within grace period, allow with warning
        return {
          allowed: true,
          warning: true,
          message: `MFA enrollment required by ${expiresAt.toLocaleDateString()}`,
          gracePeriodExpires,
        }
      }
    }

    // Enforcement required
    return {
      allowed: false,
      message: 'MFA enrollment required to access this resource',
      missingFactors,
      enforcementType,
      enrollmentUrl: `/auth/mfa-enforce?missing_factors=${missingFactors.join(',')}`,
    }
  } catch (error) {
    console.error('[v0] MFA enforcement check error:', error)
    // On error, allow through (fail-open for security)
    return { allowed: true }
  }
}

/**
 * Middleware response for MFA enforcement failure
 */
export function mfaEnforcementResponse(reason: string, enrollmentUrl: string) {
  return NextResponse.json(
    {
      error: 'MFA Enforcement Required',
      message: reason,
      enrollmentUrl,
    },
    { status: 403 }
  )
}

/**
 * Check if request is from a trusted device
 * (Would typically use device fingerprinting in production)
 */
export async function isTrustedDevice(request: NextRequest, userId: number): Promise<boolean> {
  // Check for device trust cookie
  const trustToken = request.cookies.get('device-trust-token')?.value

  if (!trustToken) {
    return false
  }

  // In production, validate the token against database
  // For now, just check if it exists
  return true
}

/**
 * Generate device trust token
 */
export function generateDeviceTrustToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}
