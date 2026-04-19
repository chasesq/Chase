import { NextResponse } from "next/server"
import {
  getUserNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  createNotification,
} from "@/lib/mongodb-service"
import { getSession } from "@/lib/db"
import { cookies } from "next/headers"

// GET /api/mongo/notifications - Get user notifications from MongoDB
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

    const [notifications, unreadCount] = await Promise.all([
      getUserNotifications(session.user_id),
      getUnreadNotificationCount(session.user_id),
    ])

    return NextResponse.json({
      notifications: notifications.map((n) => ({
        ...n,
        _id: n._id?.toString(),
      })),
      unreadCount,
    })
  } catch (error) {
    console.error("MongoDB notifications fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    )
  }
}

// POST /api/mongo/notifications - Create a notification
export async function POST(request: Request) {
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

    const body = await request.json()
    const { type = "info", title, message } = body

    if (!title || !message) {
      return NextResponse.json(
        { error: "Title and message are required" },
        { status: 400 }
      )
    }

    const notificationId = await createNotification({
      userId: session.user_id,
      type,
      title,
      message,
    })

    return NextResponse.json({
      success: true,
      notificationId: notificationId.toString(),
    })
  } catch (error) {
    console.error("MongoDB notification creation error:", error)
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    )
  }
}

// PATCH /api/mongo/notifications - Mark all as read
export async function PATCH() {
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

    await markAllNotificationsAsRead(session.user_id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("MongoDB mark notifications error:", error)
    return NextResponse.json(
      { error: "Failed to mark notifications as read" },
      { status: 500 }
    )
  }
}
