import { NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { generateTokens, setAuthCookies } from "@/lib/mongo-auth"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { username, password, email } = await request.json()

    if (!username || !password || !email) {
      return NextResponse.json(
        { success: false, message: "Username, password, and email are required" },
        { status: 400 }
      )
    }

    const db = await getDatabase()

    // Check if user already exists
    const existingUser = await db.collection("users").findOne({
      $or: [{ username }, { email }],
    })
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "User already exists" },
        { status: 400 }
      )
    }

    // Create new user with hashed password and default role
    const hashedPassword = bcrypt.hashSync(password, 10)
    const newUser = {
      username,
      password: hashedPassword,
      email,
      role: "user" as const,
      createdAt: new Date(),
    }
    const userResult = await db.collection("users").insertOne(newUser)

    // Create starter account with $1000 balance
    const starterBalance = 1000
    const accountNumber = Math.floor(Math.random() * 10000000000).toString().padStart(10, "0")
    await db.collection("accounts").insertOne({
      userId: username,
      balance: starterBalance,
      accountNumber,
      createdAt: new Date(),
    })

    // Add starter transaction history
    await db.collection("transactions").insertOne({
      fromUserId: "system",
      toUserId: username,
      amount: starterBalance,
      type: "deposit",
      description: "Welcome bonus - Initial deposit",
      date: new Date(),
    })

    // Generate tokens for auto-login (new users get "user" role)
    const tokens = generateTokens(userResult.insertedId.toString(), username, "user")

    // Create response with user data
    const response = NextResponse.json({
      success: true,
      message: "Registration successful! Your account is ready.",
      user: {
        id: userResult.insertedId.toString(),
        username,
        email,
        role: "user",
      },
    })

    // Set auth cookies
    return setAuthCookies(response, tokens)
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
