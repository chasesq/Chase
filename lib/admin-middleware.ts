import { NextRequest, NextResponse } from 'next/server'

export interface AdminSession {
  adminId: number
  email: string
  name: string
  timestamp: number
}

const SESSION_TIMEOUT = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

export function getAdminSession(request: NextRequest): AdminSession | null {
  try {
    const sessionToken = request.cookies.get('admin_session')?.value

    if (!sessionToken) {
      return null
    }

    const sessionData = JSON.parse(
      Buffer.from(sessionToken, 'base64').toString('utf-8')
    ) as AdminSession

    // Check if session has expired
    const now = Date.now()
    if (now - sessionData.timestamp > SESSION_TIMEOUT) {
      return null
    }

    return sessionData
  } catch (error) {
    console.error('Error parsing admin session:', error)
    return null
  }
}

export function isAdminAuthenticated(request: NextRequest): boolean {
  const session = getAdminSession(request)
  return session !== null
}

export function requireAdminAuth(request: NextRequest) {
  const isAuthenticated = isAdminAuthenticated(request)

  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  return null
}
