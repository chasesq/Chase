import { NextRequest, NextResponse } from "next/server"
import { destroySandbox } from "@/lib/sandbox-service"

export async function POST(request: NextRequest) {
  try {
    const { sandboxId } = await request.json()

    if (!sandboxId) {
      return NextResponse.json(
        { success: false, error: "Missing required field: sandboxId" },
        { status: 400 }
      )
    }

    await destroySandbox(sandboxId)

    return NextResponse.json(
      {
        success: true,
        message: "Sandbox destroyed successfully",
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[API] Sandbox destruction failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to destroy sandbox",
      },
      { status: 500 }
    )
  }
}
