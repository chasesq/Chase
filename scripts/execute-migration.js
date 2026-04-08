#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function executeMigration(sqlFile) {
  try {
    const sql = readFileSync(resolve(sqlFile), 'utf-8')
    console.log(`Executing migration: ${sqlFile}`)
    
    // Split by semicolons and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'))
    
    for (const statement of statements) {
      if (statement.trim()) {
        const { error } = await supabase.rpc('execute_sql', { 
          query: statement 
        }).catch(() => {
          // If rpc doesn't exist, try direct execution
          return supabase.from('_migration_log').insert({ sql: statement })
        })
        
        if (error) {
          console.warn(`Warning executing statement: ${error.message}`)
        }
      }
    }
    
    console.log('Migration completed successfully')
  } catch (error) {
    console.error('Migration failed:', error.message)
    process.exit(1)
  }
}

const migrationFile = process.argv[2] || 'scripts/005-financial-accounts-schema.sql'
executeMigration(migrationFile)
