import { NextRequest, NextResponse } from "next/server"
import { executeSandboxCode } from "@/lib/sandbox-service"

export async function POST(request: NextRequest) {
  try {
    const { sandboxId, code } = await request.json()

    if (!sandboxId || !code) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: sandboxId, code" },
        { status: 400 }
      )
    }

    const result = await executeSandboxCode(sandboxId, code)

    return NextResponse.json(
      {
        success: true,
        result,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[API] Code execution failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Code execution failed",
      },
      { status: 500 }
    )
  }
}
