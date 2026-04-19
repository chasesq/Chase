import { NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { verifyAccessToken } from "@/lib/mongo-auth"

export async function POST(request: NextRequest) {
  const user = verifyAccessToken(request)

  if (!user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    )
  }

  try {
    const { toUserId, amount, description } = await request.json()

    if (!toUserId || !amount || amount <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid transfer parameters" },
        { status: 400 }
      )
    }

    const db = await getDatabase()

    // Get sender's account
    const senderAccount = await db
      .collection("accounts")
      .findOne({ userId: user.username })

    if (!senderAccount) {
      return NextResponse.json(
        { success: false, message: "Sender account not found" },
        { status: 404 }
      )
    }

    if (senderAccount.balance < amount) {
      return NextResponse.json(
        { success: false, message: "Insufficient funds" },
        { status: 400 }
      )
    }

    // Get recipient's account
    const recipientAccount = await db
      .collection("accounts")
      .findOne({ userId: toUserId })

    if (!recipientAccount) {
      return NextResponse.json(
        { success: false, message: "Recipient account not found" },
        { status: 404 }
      )
    }

    // Perform the transfer (update both balances)
    await db
      .collection("accounts")
      .updateOne(
        { userId: user.username },
        { $inc: { balance: -amount } }
      )

    await db
      .collection("accounts")
      .updateOne(
        { userId: toUserId },
        { $inc: { balance: amount } }
      )

    // Record the transaction
    await db.collection("transactions").insertOne({
      fromUserId: user.username,
      toUserId,
      amount,
      type: "transfer",
      description: description || `Transfer to ${toUserId}`,
      date: new Date(),
    })

    return NextResponse.json({
      success: true,
      message: `Successfully transferred $${amount} to ${toUserId}`,
      newBalance: senderAccount.balance - amount,
    })
  } catch (error) {
    console.error("Transfer error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
