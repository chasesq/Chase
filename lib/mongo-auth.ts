import jwt from "jsonwebtoken"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
const REFRESH_SECRET = process.env.REFRESH_SECRET || "your-refresh-secret"

export interface TokenPayload {
  id: string
  username: string
  iat?: number
  exp?: number
}

// Generate access and refresh tokens
export function generateTokens(userId: string, username: string) {
  const accessToken = jwt.sign(
    { id: userId, username },
    JWT_SECRET,
    { expiresIn: "15m" }
  )
  const refreshToken = jwt.sign(
    { id: userId, username },
    REFRESH_SECRET,
    { expiresIn: "30d" }
  )
  return { accessToken, refreshToken }
}

// Set auth cookies on response
export function setAuthCookies(
  response: NextResponse,
  tokens: { accessToken: string; refreshToken: string }
) {
  response.cookies.set("accessToken", tokens.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 900, // 15 minutes
    path: "/",
  })
  response.cookies.set("refreshToken", tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 2592000, // 30 days
    path: "/",
  })
  return response
}

// Clear auth cookies (for logout)
export function clearAuthCookies(response: NextResponse) {
  response.cookies.set("accessToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  })
  response.cookies.set("refreshToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  })
  return response
}

// Verify access token from request
export function verifyAccessToken(request: NextRequest): TokenPayload | null {
  const token = request.cookies.get("accessToken")?.value
  if (!token) return null

  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload
  } catch {
    return null
  }
}

// Verify refresh token
export function verifyRefreshToken(request: NextRequest): TokenPayload | null {
  const token = request.cookies.get("refreshToken")?.value
  if (!token) return null

  try {
    return jwt.verify(token, REFRESH_SECRET) as TokenPayload
  } catch {
    return null
  }
}

// Server-side token verification (for Server Components)
export async function getServerSession(): Promise<TokenPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("accessToken")?.value
  if (!token) return null

  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload
  } catch {
    return null
  }
}

// Middleware helper to protect API routes
export function withAuth(
  handler: (
    request: NextRequest,
    user: TokenPayload
  ) => Promise<NextResponse> | NextResponse
) {
  return async (request: NextRequest) => {
    const user = verifyAccessToken(request)
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }
    return handler(request, user)
  }
}
