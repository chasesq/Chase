// OTP storage with in-memory cache
// In production, use Redis or database for persistence and scalability

const otpCache = new Map<string, { code: string; createdAt: Date; attempts: number }>()

const OTP_EXPIRY_MS = 10 * 60 * 1000 // 10 minutes
const MAX_ATTEMPTS = 5

// Clean up expired OTPs periodically
setInterval(() => {
  const now = new Date()
  for (const [key, value] of otpCache.entries()) {
    if (now.getTime() - value.createdAt.getTime() > OTP_EXPIRY_MS) {
      otpCache.delete(key)
    }
  }
}, 5 * 60 * 1000) // Every 5 minutes

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export function storeOTP(key: string, code: string): void {
  otpCache.set(key, {
    code,
    createdAt: new Date(),
    attempts: 0,
  })
}

export function verifyOTP(key: string, code: string): { valid: boolean; error?: string } {
  const otpData = otpCache.get(key)

  if (!otpData) {
    return { valid: false, error: 'OTP not found or expired' }
  }

  const now = new Date()
  if (now.getTime() - otpData.createdAt.getTime() > OTP_EXPIRY_MS) {
    otpCache.delete(key)
    return { valid: false, error: 'OTP has expired' }
  }

  if (otpData.attempts >= MAX_ATTEMPTS) {
    otpCache.delete(key)
    return { valid: false, error: 'Too many failed attempts' }
  }

  if (otpData.code !== code) {
    otpData.attempts++
    return { valid: false, error: 'Invalid OTP code' }
  }

  // Valid code - consume it
  otpCache.delete(key)
  return { valid: true }
}

export function getOTPKey(method: 'email' | 'sms', identifier: string): string {
  return `otp:${method}:${identifier}`
}
