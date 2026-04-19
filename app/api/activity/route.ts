import { NextResponse } from "next/server"
import { getActivityLogs, logActivity } from "@/lib/mongodb-service"
import { getSession } from "@/lib/db"
import { cookies, headers } from "next/headers"

// GET /api/activity - Get user activity logs
export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("session_token")?.value

    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = await getSession(sessionToken)
    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const logs = await getActivityLogs(session.user_id)

    return NextResponse.json({
      logs: logs.map((log) => ({
        ...log,
        _id: log._id?.toString(),
      })),
    })
  } catch (error) {
    console.error("Activity logs fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch activity logs" },
      { status: 500 }
    )
  }
}

// POST /api/activity - Log an activity
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const headersList = await headers()
    const sessionToken = cookieStore.get("session_token")?.value

    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = await getSession(sessionToken)
    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const body = await request.json()
    const { action, details = {} } = body

    if (!action) {
      return NextResponse.json(
        { error: "Action is required" },
        { status: 400 }
      )
    }

    const logId = await logActivity({
      userId: session.user_id,
      action,
      details,
      ipAddress: headersList.get("x-forwarded-for") || "unknown",
      userAgent: headersList.get("user-agent") || "unknown",
    })

    return NextResponse.json({ success: true, logId: logId.toString() })
  } catch (error) {
    console.error("Activity logging error:", error)
    return NextResponse.json(
      { error: "Failed to log activity" },
      { status: 500 }
    )
  }
}
