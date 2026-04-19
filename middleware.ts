import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import jwt from 'jsonwebtoken'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Verify MongoDB JWT token
function verifyMongoToken(request: NextRequest): { id: string; username: string; role: string } | null {
  const token = request.cookies.get('accessToken')?.value
  if (!token) return null

  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; username: string; role: string }
  } catch {
    return null
  }
}

// Extract role from Supabase session
async function getSupabaseUserRole(supabase: any): Promise<string | null> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) return null

    // Try to get role from JWT custom claims (if configured in Supabase)
    const role = (session.user as any)?.user_metadata?.role || (session.user as any)?.role

    if (role) return role

    // Fallback: Fetch user role from database
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('email', session.user.email)
      .single()

    if (error || !data) return null
    return data.role
  } catch (error) {
    console.error('[middleware] Error getting Supabase user role:', error)
    return null
  }
}

export async function middleware(request: NextRequest) {
  try {
    const pathname = request.nextUrl.pathname

    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })

    // Check for MongoDB JWT session first
    const mongoUser = verifyMongoToken(request)
    let supabaseSession: any = null
    let supabaseUserRole: string | null = null

    // Check Supabase session if credentials are available
    if (supabaseUrl && supabaseAnonKey) {
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            )
          },
        },
      })

      // Refresh session if it exists
      await supabase.auth.getSession()

      // Get the current session
      const {
        data: { session },
      } = await supabase.auth.getSession()

      supabaseSession = session
      
      // Get user role from Supabase
      if (supabaseSession) {
        supabaseUserRole = await getSupabaseUserRole(supabase)
      }
    }

    // User is authenticated if either session exists
    const isAuthenticated = mongoUser !== null || supabaseSession !== null

    // Auth routes (login, sign-up, etc.)
    const authRoutes = ['/auth/login', '/auth/sign-up', '/auth/forgot-password', '/auth/reset-password', '/auth/sign-up-success', '/auth/onboarding-success', '/auth/error']
    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

    // Protected routes that require authentication
    const protectedRoutes = ['/admin', '/settings', '/dashboard', '/user-dashboard', '/profile']
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

    // Admin-only routes
    const adminRoutes = ['/admin']
    const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))

    // User role (from MongoDB or Supabase)
    const userRole = mongoUser?.role || supabaseUserRole || 'user'

    // Redirect unauthenticated users away from protected routes
    if (isProtectedRoute && !isAuthenticated) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // Enforce admin-only routes (both MongoDB and Supabase)
    if (isAdminRoute && isAuthenticated && userRole !== 'admin') {
      console.log(`[middleware] Access denied for non-admin user. Role: ${userRole}`)
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Redirect authenticated users away from auth pages (login/sign-up)
    const redirectAuthRoutes = ['/auth/login', '/auth/sign-up']
    const shouldRedirectAuth = redirectAuthRoutes.some(route => pathname === route)
    if (shouldRedirectAuth && isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return response
  } catch (error) {
    // If anything fails in middleware, just continue to next
    console.error('[middleware] Error:', error)
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    })
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
