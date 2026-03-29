import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
    },
  )

  // Refresh session if it exists
  await supabase.auth.getSession()

  // Protect routes
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const pathname = request.nextUrl.pathname

  // Auth routes (login, sign-up, etc.)
  const authRoutes = ['/auth/login', '/auth/sign-up', '/auth/forgot-password', '/auth/reset-password', '/auth/sign-up-success', '/auth/onboarding-success', '/auth/error']
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

  // Protected routes that require authentication
  const protectedRoutes = ['/admin', '/settings', '/dashboard']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  // Redirect unauthenticated users away from protected routes
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Redirect authenticated users away from auth pages (login/sign-up)
  const redirectAuthRoutes = ['/auth/login', '/auth/sign-up']
  const shouldRedirectAuth = redirectAuthRoutes.some(route => pathname === route)
  if (shouldRedirectAuth && session) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
