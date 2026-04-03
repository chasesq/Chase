import { NextRequest, NextResponse } from "next/server"

/**
 * API Endpoint to send security tokens via email
 * For now, just logs tokens and returns success (email delivery disabled without RESEND_API_KEY)
 */

const ADMIN_EMAIL = "hungchun164@gmail.com"

interface TokenEmailRequest {
  userEmail: string
  adminEmail?: string
  userName: string
  tokenType: "login" | "signup" | "password-reset"
  timestamp: string
}

function generateSecurityToken(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

function getEmailTemplate(token: string, tokenType: string, userName: string): { subject: string; html: string } {
  const templates: Record<string, { subject: string; html: string }> = {
    login: {
      subject: "Your Security Token - Secure Banking",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0066CC; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">Login Verification</h1>
          </div>
          <div style="background: #f9fafb; padding: 20px;">
            <p>Hi ${userName},</p>
            <p>Your security token for login is:</p>
            <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <h2 style="letter-spacing: 10px; color: #0066CC; margin: 0; font-family: monospace;">${token}</h2>
            </div>
            <p><strong>This token expires in 60 seconds.</strong></p>
            <p>If you didn't request this token, please ignore this email.</p>
          </div>
          <div style="text-align: center; color: #9ca3af; font-size: 12px; padding: 20px;">
            <p>© 2026 Secure Banking. All rights reserved.</p>
          </div>
        </div>
      `,
    },
    signup: {
      subject: "Welcome! Verify Your Account",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0066CC; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">Welcome to Secure Banking</h1>
          </div>
          <div style="background: #f9fafb; padding: 20px;">
            <p>Hi ${userName},</p>
            <p>Welcome! Your account verification token is:</p>
            <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <h2 style="letter-spacing: 10px; color: #0066CC; margin: 0; font-family: monospace;">${token}</h2>
            </div>
            <p><strong>This token expires in 60 seconds.</strong></p>
            <p>If you didn't create this account, please contact us immediately.</p>
          </div>
          <div style="text-align: center; color: #9ca3af; font-size: 12px; padding: 20px;">
            <p>© 2026 Secure Banking. All rights reserved.</p>
          </div>
        </div>
      `,
    },
    "password-reset": {
      subject: "Password Reset Request",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0066CC; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">Password Reset</h1>
          </div>
          <div style="background: #f9fafb; padding: 20px;">
            <p>Hi ${userName},</p>
            <p>Your password reset token is:</p>
            <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <h2 style="letter-spacing: 10px; color: #0066CC; margin: 0; font-family: monospace;">${token}</h2>
            </div>
            <p><strong>This token expires in 60 seconds.</strong></p>
            <p>If you didn't request a password reset, please ignore this email.</p>
          </div>
          <div style="text-align: center; color: #9ca3af; font-size: 12px; padding: 20px;">
            <p>© 2026 Secure Banking. All rights reserved.</p>
          </div>
        </div>
      `,
    },
  }

  return templates[tokenType] || templates.login
}

export async function POST(request: NextRequest) {
  try {
    const body: TokenEmailRequest = await request.json()
    const { userEmail, adminEmail = ADMIN_EMAIL, userName, tokenType, timestamp } = body

    console.log("[v0] Generating security token for:", userName)

    // Generate the token
    const token = generateSecurityToken()
    const template = getEmailTemplate(token, tokenType, userName)

    console.log(`[v0] Security token: ${token} (for demo - not shown to user)`)
    console.log(`[v0] Would send email to ${userEmail} and ${adminEmail}`)
    console.log("[v0] Email subject:", template.subject)

    // Simulate email sending (token delivery disabled without RESEND_API_KEY)
    const emailsSent = [
      {
        to: userEmail,
        status: "simulated",
        messageId: `token_${Date.now()}_user`,
        timestamp: new Date().toISOString(),
      },
      {
        to: adminEmail,
        status: "simulated",
        messageId: `token_${Date.now()}_admin`,
        timestamp: new Date().toISOString(),
      },
    ]

    console.log("[v0] Token delivery simulated (set RESEND_API_KEY to enable real email)")

    return NextResponse.json(
      {
        success: true,
        messageId: `token_${Date.now()}`,
        emailsSent,
        message: "Security token generated successfully",
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[v0] Error in send-token endpoint:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate token",
      },
      { status: 500 }
    )
  }
}
