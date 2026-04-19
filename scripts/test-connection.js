import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;
console.log('DATABASE_URL:', databaseUrl?.substring(0, 50) + '...');

if (!databaseUrl) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const sql = neon(databaseUrl);

async function test() {
  try {
    // List all schemas
    const schemas = await sql`
      SELECT schema_name FROM information_schema.schemata 
      WHERE schema_name NOT LIKE 'pg_%' AND schema_name != 'information_schema'
      ORDER BY schema_name
    `;
    console.log('\n✓ Schemas found:', schemas.map(s => s.schema_name).join(', '));

    // List all tables in neon_auth schema if it exists
    const tables = await sql`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'neon_auth'
      ORDER BY tablename
    `;
    console.log('\n✓ Tables in neon_auth schema:', tables.map(t => t.tablename).join(', '));

    // Try to query users table
    const users = await sql`SELECT COUNT(*) as count FROM neon_auth.users`;
    console.log('\n✓ Users table count:', users[0].count);

    process.exit(0);
  } catch (error) {
    console.error('\n✗ Error:', error.message);
    process.exit(1);
  }
}

test();
