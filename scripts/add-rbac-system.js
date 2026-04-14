import { Pool } from '@neondatabase/serverless'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set')
}

const pool = new Pool({ connectionString })

async function addRBACSystem() {
  const client = await pool.connect()

  try {
    console.log('[RBAC] Starting role-based access control system setup...')

    // 1. Ensure role column exists on users table with proper constraints
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' 
      CHECK (role IN ('admin', 'user', 'moderator'));
    `)
    console.log('[RBAC] ✓ Role column ensured on users table')

    // 2. Create role-based index for performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_role 
      ON users(role);
    `)
    console.log('[RBAC] ✓ Created index on users.role')

    // 3. Create role audit table for tracking role changes
    await client.query(`
      CREATE TABLE IF NOT EXISTS role_audit_log (
        id SERIAL PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        old_role TEXT,
        new_role TEXT NOT NULL,
        changed_by UUID REFERENCES users(id),
        changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        reason TEXT
      );
    `)
    console.log('[RBAC] ✓ Created role_audit_log table')

    // 4. Create index on role_audit_log for querying
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_role_audit_user 
      ON role_audit_log(user_id);
    `)
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_role_audit_timestamp 
      ON role_audit_log(changed_at);
    `)
    console.log('[RBAC] ✓ Created indexes on role_audit_log')

    // 5. Create permission_mappings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS permission_mappings (
        id SERIAL PRIMARY KEY,
        role TEXT NOT NULL,
        permission TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(role, permission),
        CHECK (role IN ('admin', 'user', 'moderator'))
      );
    `)
    console.log('[RBAC] ✓ Created permission_mappings table')

    // 6. Seed permission mappings
    await client.query(`
      DELETE FROM permission_mappings;
      
      INSERT INTO permission_mappings (role, permission) VALUES
        ('admin', 'manage_users'),
        ('admin', 'manage_accounts'),
        ('admin', 'manage_transactions'),
        ('admin', 'view_reports'),
        ('admin', 'manage_settings'),
        ('admin', 'manage_roles'),
        ('user', 'view_own_account'),
        ('user', 'make_transfer'),
        ('user', 'pay_bills'),
        ('user', 'view_transactions'),
        ('moderator', 'view_reports'),
        ('moderator', 'review_disputes')
      ON CONFLICT DO NOTHING;
    `)
    console.log('[RBAC] ✓ Seeded permission_mappings')

    // 7. Create role_permissions view
    await client.query(`
      CREATE OR REPLACE VIEW role_permissions AS
      SELECT 
        pm.role,
        json_agg(pm.permission) as permissions
      FROM permission_mappings pm
      GROUP BY pm.role;
    `)
    console.log('[RBAC] ✓ Created role_permissions view')

    // 8. Ensure existing users have the 'user' role if not set
    await client.query(`
      UPDATE users 
      SET role = 'user' 
      WHERE role IS NULL OR role = '';
    `)
    console.log('[RBAC] ✓ Set default role for existing users')

    // 9. Create admin user helper function
    await client.query(`
      CREATE OR REPLACE FUNCTION promote_to_admin(user_id_param UUID, admin_user_id UUID DEFAULT NULL)
      RETURNS void AS $$
      BEGIN
        INSERT INTO role_audit_log (user_id, old_role, new_role, changed_by, reason)
        SELECT id, role, 'admin', admin_user_id, 'Promoted to admin'
        FROM users
        WHERE id = user_id_param;
        
        UPDATE users SET role = 'admin' WHERE id = user_id_param;
      END;
      $$ LANGUAGE plpgsql;
    `)
    console.log('[RBAC] ✓ Created promote_to_admin function')

    console.log('\n✅ RBAC system successfully set up!')
    console.log('📋 Summary:')
    console.log('   - Added role column to users table with constraints')
    console.log('   - Created role_audit_log table for tracking changes')
    console.log('   - Created permission_mappings table')
    console.log('   - Seeded default permissions for admin, user, and moderator roles')
    console.log('   - Created role_permissions view')
    console.log('   - Set default role for existing users')
    console.log('   - Created helper functions for role management')

  } catch (error) {
    console.error('[RBAC] ❌ Error setting up RBAC:', error.message)
    throw error
  } finally {
    await client.release()
    await pool.end()
  }
}

addRBACSystem().catch(err => {
  console.error('[RBAC] Fatal error:', err)
  process.exit(1)
})
