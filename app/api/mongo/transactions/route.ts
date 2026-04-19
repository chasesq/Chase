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
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "20")
    const page = parseInt(searchParams.get("page") || "1")
    const skip = (page - 1) * limit

    const db = await getDatabase()

    // Get transactions where user is sender or recipient
    const transactions = await db
      .collection("transactions")
      .find({
        $or: [{ fromUserId: user.username }, { toUserId: user.username }],
      })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    // Get total count for pagination
    const total = await db.collection("transactions").countDocuments({
      $or: [{ fromUserId: user.username }, { toUserId: user.username }],
    })

    // Format transactions with direction
    const formattedTransactions = transactions.map((tx) => ({
      id: tx._id.toString(),
      fromUserId: tx.fromUserId,
      toUserId: tx.toUserId,
      amount: tx.amount,
      type: tx.type,
      description: tx.description,
      date: tx.date,
      direction: tx.fromUserId === user.username ? "outgoing" : "incoming",
    }))

    return NextResponse.json({
      success: true,
      transactions: formattedTransactions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Transactions fetch error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
