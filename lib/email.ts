// Email utilities for sending verification emails
// In a production environment, this would use a service like Sendgrid, Mailgun, or AWS SES

import crypto from 'crypto'

interface EmailVerificationToken {
  token: string
  userId: string
  email: string
  expiresAt: Date
  verified: boolean
}

// In-memory store for verification tokens (in production, use a database)
const verificationTokens = new Map<string, EmailVerificationToken>()

/**
 * Generate a unique email verification token
 */
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Create a verification token for a user
 */
export function createVerificationToken(userId: string, email: string): EmailVerificationToken {
  const token = generateVerificationToken()
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

  const verificationToken: EmailVerificationToken = {
    token,
    userId,
    email,
    expiresAt,
    verified: false,
  }

  verificationTokens.set(token, verificationToken)
  return verificationToken
}

/**
 * Get a verification token
 */
export function getVerificationToken(token: string): EmailVerificationToken | null {
  return verificationTokens.get(token) || null
}

/**
 * Verify an email token
 */
export function verifyEmailToken(token: string): boolean {
  const verificationToken = verificationTokens.get(token)

  if (!verificationToken) {
    return false
  }

  if (new Date() > verificationToken.expiresAt) {
    // Token has expired
    verificationTokens.delete(token)
    return false
  }

  verificationToken.verified = true
  return true
}

/**
 * Delete a verification token
 */
export function deleteVerificationToken(token: string): void {
  verificationTokens.delete(token)
}

/**
 * Generate a verification email HTML
 */
export function generateVerificationEmailHTML(
  userName: string,
  verificationLink: string
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #1e40af; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background-color: #f9fafb; padding: 30px; }
          .button { display: inline-block; background-color: #3b82f6; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; margin: 20px 0; }
          .footer { background-color: #e5e7eb; padding: 15px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Chase Banking</h1>
          </div>
          <div class="content">
            <p>Hi ${userName},</p>
            <p>Thank you for creating your Chase banking account! To complete your signup and get started, please verify your email address.</p>
            <p>
              <a href="${verificationLink}" class="button">Verify Email Address</a>
            </p>
            <p>Or copy this link in your browser:</p>
            <p style="word-break: break-all; color: #0066cc;">
              ${verificationLink}
            </p>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't create this account, you can safely ignore this email.</p>
            <p>Best regards,<br>The Chase Banking Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Chase Banking. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `
}

/**
 * Send a verification email (simulated for demo purposes)
 * In production, integrate with Sendgrid, Mailgun, or AWS SES
 */
export async function sendVerificationEmail(
  to: string,
  userName: string,
  verificationLink: string
): Promise<boolean> {
  try {
    // In a production app, you would:
    // 1. Call an email service API (Sendgrid, Mailgun, etc.)
    // 2. Handle rate limiting
    // 3. Log email sending attempts
    
    // For demo purposes, we're just logging and returning success
    console.log(`[Email Service] Sending verification email to ${to}`)
    console.log(`[Email Service] Verification link: ${verificationLink}`)
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 100))
    
    return true
  } catch (error) {
    console.error('[Email Service] Error sending email:', error)
    return false
  }
}
