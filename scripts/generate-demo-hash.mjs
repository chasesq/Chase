/**
 * Generate PBKDF2 password hash for demo user
 * This matches the hashing algorithm used in lib/auth/password-utils.ts
 */

import crypto from 'crypto'

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 32, 'sha256')
    .toString('hex')
  return `${salt}.${hash}`
}

const password = 'Demo123!'
const hashedPassword = hashPassword(password)

console.log('Password:', password)
console.log('Hashed Password:', hashedPassword)
console.log('')
console.log('SQL to update demo user:')
console.log(`UPDATE public.users SET password_hash = '${hashedPassword}' WHERE email = 'demo@chase.com';`)
