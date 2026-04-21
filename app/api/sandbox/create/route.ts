import { NextRequest, NextResponse } from "next/server"
import { createSandbox } from "@/lib/sandbox-service"

export async function POST(request: NextRequest) {
  try {
    const sandboxId = await createSandbox()

    return NextResponse.json(
      {
        success: true,
        sandboxId,
        message: "Sandbox created successfully",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("[API] Sandbox creation failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create sandbox",
      },
      { status: 500 }
    )
  }
}
