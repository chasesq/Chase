import { neon } from '@neondatabase/serverless'
import fs from 'fs'
import path from 'path'

const migrationFile = process.argv[2] || '010-create-notes-table.sql'
const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  console.error('DATABASE_URL not set')
  process.exit(1)
}

async function runMigration() {
  const sql = neon(databaseUrl)
  const scriptPath = path.join(process.cwd(), 'scripts', migrationFile)
  const script = fs.readFileSync(scriptPath, 'utf-8')
  
  try {
    const result = await sql(script)
    console.log('✓ Migration completed successfully')
    console.log('Result:', result)
  } catch (error) {
    console.error('✗ Migration failed:', error.message)
    process.exit(1)
  }
}

runMigration()
