import bcryptjs from 'bcryptjs'

async function generateHashes() {
  const credentials = [
    { email: 'admin@chase.com', password: 'Admin@123456', name: 'Chase Admin' },
    { email: 'super_admin@chase.com', password: 'SuperAdmin@789012', name: 'Chase Super Admin' },
  ]

  console.log('Generating bcrypt password hashes...\n')

  for (const cred of credentials) {
    const hash = await bcryptjs.hash(cred.password, 10)
    console.log(`Email: ${cred.email}`)
    console.log(`Password: ${cred.password}`)
    console.log(`Hash: ${hash}`)
    console.log(`Name: ${cred.name}`)
    console.log('---')
  }
}

generateHashes().catch(console.error)
