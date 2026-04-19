import { NextRequest, NextResponse } from "next/server"
import { generateTokens, setAuthCookies, verifyRefreshToken } from "@/lib/mongo-auth"

export async function POST(request: NextRequest) {
  const decoded = verifyRefreshToken(request)

  if (!decoded) {
    return NextResponse.json(
      { success: false, message: "Invalid or expired refresh token" },
      { status: 401 }
    )
  }

  // Generate new tokens
  const tokens = generateTokens(decoded.id, decoded.username)

  const response = NextResponse.json({
    success: true,
    message: "Token refreshed successfully",
  })

  return setAuthCookies(response, tokens)
}
