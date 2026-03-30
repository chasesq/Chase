import { NextRequest, NextResponse } from 'next/server'

// Helper function to check if step-up authentication is required and valid
export async function requireStepUpAuth(request: NextRequest) {
  // Get the step-up token from headers or cookies
  const token = request.headers.get('x-stepup-token') || 
                request.cookies.get('stepup-token')?.value

  if (!token) {
    return {
      authorized: false,
      error: 'Step-up authentication required',
      statusCode: 403,
    }
  }

  // Verify the token is valid
  const tokenData = getStepUpTokenData(token)
  
  if (!tokenData || tokenData.expiresAt < Date.now()) {
    return {
      authorized: false,
      error: 'Step-up token expired or invalid',
      statusCode: 403,
    }
  }

  return {
    authorized: true,
    token,
    userId: tokenData.userId,
  }
}

// In-memory token store (should be replaced with a database in production)
const stepUpTokens = new Map<string, {
  userId: string
  expiresAt: number
  createdAt: number
}>()

export function createStepUpToken(userId: string, expiresInMinutes: number = 15) {
  const token = Buffer.from(`${userId}-${Date.now()}-${Math.random()}`).toString('base64')
  const expiresAt = Date.now() + expiresInMinutes * 60 * 1000

  stepUpTokens.set(token, {
    userId,
    expiresAt,
    createdAt: Date.now(),
  })

  return {
    token,
    expiresAt: new Date(expiresAt).toISOString(),
    expiresIn: expiresInMinutes * 60,
  }
}

export function getStepUpTokenData(token: string) {
  return stepUpTokens.get(token)
}

export function validateStepUpToken(token: string): boolean {
  const data = getStepUpTokenData(token)
  if (!data) return false
  
  const isExpired = data.expiresAt < Date.now()
  if (isExpired) {
    stepUpTokens.delete(token)
    return false
  }

  return true
}

export function consumeStepUpToken(token: string): boolean {
  const isValid = validateStepUpToken(token)
  if (isValid) {
    stepUpTokens.delete(token)
  }
  return isValid
}

export function cleanupExpiredTokens() {
  const now = Date.now()
  for (const [token, data] of stepUpTokens.entries()) {
    if (data.expiresAt < now) {
      stepUpTokens.delete(token)
    }
  }
}

// Cleanup expired tokens every 5 minutes
setInterval(cleanupExpiredTokens, 5 * 60 * 1000)
