import bcryptjs from 'bcryptjs'

export const generateAdminPasswordHash = async (password: string): Promise<string> => {
  return bcryptjs.hash(password, 10)
}

export const verifyAdminPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcryptjs.compare(password, hash)
}

export const validateAdminEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validateAdminPassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*)')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
