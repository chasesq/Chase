// WebAuthn/FIDO2 utility functions for passkey management

export interface RegistrationOptions {
  challenge: string
  userId: string
  userName: string
  userDisplayName: string
}

export interface AuthenticationOptions {
  challenge: string
  allowCredentials: Array<{ id: string; type: string }>
}

/**
 * Convert array buffer to base64 string
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

/**
 * Convert base64 string to array buffer
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

/**
 * Get user agent info for passkey device details
 */
export function getDeviceInfo() {
  const ua = navigator.userAgent
  const parser = (regex: RegExp) => {
    const match = ua.match(regex)
    return match ? match[1] : 'Unknown'
  }

  const os = /\(([^)]+)\)/.exec(ua)?.[1] || 'Unknown'
  const browserMatch = ua.match(/(Chrome|Safari|Firefox|Edge)\/([^\s]+)/)
  const browser = browserMatch ? `${browserMatch[1]} ${browserMatch[2]}` : 'Unknown'

  return {
    userAgent: ua,
    os,
    browser,
    platform: navigator.platform,
  }
}

/**
 * Check WebAuthn support
 */
export async function isWebAuthnSupported(): Promise<boolean> {
  return !!(
    window.PublicKeyCredential &&
    typeof window.PublicKeyCredential === 'function' &&
    typeof navigator.credentials !== 'undefined'
  )
}

/**
 * Check platform authenticator availability
 */
export async function isPlatformAuthenticatorAvailable(): Promise<boolean> {
  if (!window.PublicKeyCredential) {
    return false
  }
  return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
}
