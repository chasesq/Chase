import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function check() {
  const columns = await sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema = 'neon_auth' AND table_name = 'user'
    ORDER BY ordinal_position
  `;
  console.log('Columns in neon_auth.user:');
  columns.forEach(c => console.log(`  - ${c.column_name}: ${c.data_type}`));
}

check();
