const crypto = require('crypto')

const password = 'Demo123!'
const salt = crypto.randomBytes(16).toString('hex')
const hash = crypto.pbkdf2Sync(password, salt, 1000, 32, 'sha256').toString('hex')
const passwordHash = `${salt}.${hash}`

console.log('Password:', password)
console.log('Hash:', passwordHash)
