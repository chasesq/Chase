import { NextResponse } from "next/server"
import { trackEvent, getEventStats } from "@/lib/mongodb-service"
import { getSession } from "@/lib/db"
import { cookies } from "next/headers"

// POST /api/analytics - Track an analytics event
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { eventName, properties = {} } = body

    if (!eventName) {
      return NextResponse.json(
        { error: "Event name is required" },
        { status: 400 }
      )
    }

    // Try to get user session for userId
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("session_token")?.value
    let userId: string | undefined

    if (sessionToken) {
      const session = await getSession(sessionToken)
      userId = session?.user_id
    }

    const eventId = await trackEvent({
      eventName,
      userId,
      properties,
    })

    return NextResponse.json({ success: true, eventId: eventId.toString() })
  } catch (error) {
    console.error("Analytics tracking error:", error)
    return NextResponse.json(
      { error: "Failed to track event" },
      { status: 500 }
    )
  }
}

// GET /api/analytics?event=page_view&days=7 - Get event statistics
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const eventName = searchParams.get("event")
    const days = parseInt(searchParams.get("days") || "7", 10)

    if (!eventName) {
      return NextResponse.json(
        { error: "Event name is required" },
        { status: 400 }
      )
    }

    const stats = await getEventStats(eventName, days)

    return NextResponse.json({ stats })
  } catch (error) {
    console.error("Analytics fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    )
  }
}
