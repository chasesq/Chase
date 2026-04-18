import { NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { verifyAccessToken, type TokenPayload } from "@/lib/mongo-auth"

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const user = verifyAccessToken(request)
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check admin role
    if (user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Forbidden: Admins only" },
        { status: 403 }
      )
    }

    const db = await getDatabase()

    // Get all users (excluding passwords)
    const users = await db
      .collection("users")
      .find({})
      .project({ password: 0 })
      .toArray()

    // Get all accounts for balance info
    const accounts = await db.collection("accounts").find({}).toArray()

    // Combine user data with account balances
    const usersWithBalances = users.map((user) => {
      const userAccount = accounts.find((acc) => acc.userId === user.username)
      return {
        ...user,
        balance: userAccount?.balance || 0,
        accountNumber: userAccount?.accountNumber || "N/A",
      }
    })

    return NextResponse.json({
      success: true,
      users: usersWithBalances,
      total: users.length,
    })
  } catch (error) {
    console.error("Admin users error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}

// Update user role (admin only)
export async function PATCH(request: NextRequest) {
  try {
    const user = verifyAccessToken(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Forbidden: Admins only" },
        { status: 403 }
      )
    }

    const { username, role } = await request.json()

    if (!username || !role || !["user", "admin"].includes(role)) {
      return NextResponse.json(
        { success: false, message: "Invalid username or role" },
        { status: 400 }
      )
    }

    const db = await getDatabase()

    const result = await db.collection("users").updateOne(
      { username },
      { $set: { role, updatedAt: new Date() } }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `User ${username} role updated to ${role}`,
    })
  } catch (error) {
    console.error("Admin update role error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
