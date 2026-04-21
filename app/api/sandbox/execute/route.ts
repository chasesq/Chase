import { NextRequest, NextResponse } from "next/server"
import { executeSandboxCommand } from "@/lib/sandbox-service"

export async function POST(request: NextRequest) {
  try {
    const { sandboxId, command, args } = await request.json()

    if (!sandboxId || !command) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: sandboxId, command" },
        { status: 400 }
      )
    }

    const result = await executeSandboxCommand(sandboxId, command, args || [])

    return NextResponse.json(
      {
        success: true,
        result,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[API] Command execution failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Command execution failed",
      },
      { status: 500 }
    )
  }
}
