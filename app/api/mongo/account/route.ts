import { NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { verifyAccessToken } from "@/lib/mongo-auth"

export async function GET(request: NextRequest) {
  const user = verifyAccessToken(request)

  if (!user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    )
  }

  try {
    const db = await getDatabase()
    const account = await db.collection("accounts").findOne({ userId: user.username })

    if (!account) {
      return NextResponse.json(
        { success: false, message: "Account not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      account: {
        balance: account.balance,
        accountNumber: account.accountNumber,
        userId: account.userId,
      },
    })
  } catch (error) {
    console.error("Account fetch error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
