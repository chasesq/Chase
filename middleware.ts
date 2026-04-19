import { type NextRequest, NextResponse } from 'next/server'

const SESSION_COOKIE_NAME = 'chase_session_token'

// Routes that require authentication
const protectedRoutes = ['/dashboard', '/transfer', '/transactions', '/settings', '/admin']

// Routes that require admin role
const adminRoutes = ['/admin']

// Auth routes (login, sign-up, etc.)
const authRoutes = ['/auth/login', '/auth/sign-up', '/auth/forgot-password', '/auth/reset-password', '/auth/sign-up-success', '/auth/onboarding-success', '/auth/error']

// Routes that redirect to /dashboard if authenticated
const redirectAuthRoutes = ['/auth/login', '/auth/sign-up']

export async function middleware(request: NextRequest) {
  try {
    const pathname = request.nextUrl.pathname

    // Get session token from cookies
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value

    // Check if this is a protected route
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
    
    // Check if this is an admin route
    const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))
    
    // Check if this is an auth route
    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))
    
    // Check if this should redirect authenticated users away
    const shouldRedirectAuth = redirectAuthRoutes.some(route => pathname === route)

    // If no token and trying to access protected route, redirect to login
    if (isProtectedRoute && !token) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // If token exists and trying to access login/signup, redirect to dashboard
    if (shouldRedirectAuth && token) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // For admin routes, we need to validate the role
    // Since we can't access the database directly in middleware, we'll set a header
    // that the page can use to verify the session
    if (isAdminRoute && token) {
      // Add a request header with the token so the page can verify the role
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-session-token', token)
      
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    }

    // If admin route and no token, redirect to login
    if (isAdminRoute && !token) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    return NextResponse.next()
  } catch (error) {
    // If anything fails in middleware, just continue
    console.error('[middleware] Error:', error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
