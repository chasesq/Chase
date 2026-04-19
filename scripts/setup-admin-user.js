#!/usr/bin/env node

/**
 * Admin User Setup Script
 * Promotes an existing user to admin role
 * Usage: node scripts/setup-admin-user.js <email>
 */

const { neon } = require('@neondatabase/serverless');
const readline = require('readline');

const sql = neon(process.env.DATABASE_URL);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setupAdmin() {
  console.log('\n=== Supabase + Neon Admin User Setup ===\n');

  const email = process.argv[2];

  if (!email) {
    console.error('Error: Please provide user email as argument');
    console.error('Usage: node scripts/setup-admin-user.js <email>');
    rl.close();
    process.exit(1);
  }

  try {
    // Check if user exists
    console.log(`Checking for user with email: ${email}...`);
    const result = await sql.query(
      'SELECT id, email, full_name, role FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (!result || result.length === 0) {
      console.error(`Error: No user found with email: ${email}`);
      rl.close();
      process.exit(1);
    }

    const user = result[0];
    console.log(`Found user: ${user.full_name || user.email}`);
    console.log(`Current role: ${user.role}`);

    if (user.role === 'admin') {
      console.log('User is already an admin!');
      rl.close();
      process.exit(0);
    }

    // Confirm before updating
    const confirm = await question(`\nPromote ${email} to admin? (yes/no): `);

    if (confirm.toLowerCase() !== 'yes') {
      console.log('Cancelled.');
      rl.close();
      process.exit(0);
    }

    // Update user role
    console.log('\nUpdating user role to admin...');
    await sql.query('UPDATE users SET role = $1 WHERE id = $2', ['admin', user.id]);

    console.log('✓ User promoted to admin successfully!');
    console.log(`\nUser Details:`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Name: ${user.full_name}`);
    console.log(`  New Role: admin`);

    // Show admin capabilities
    console.log(`\nAdmin Capabilities:`);
    console.log(`  • Access /admin dashboard`);
    console.log(`  • View all users`);
    console.log(`  • Manage user roles`);
    console.log(`  • View all transactions`);
    console.log(`  • View all accounts`);
    console.log(`  • Access reports`);

    console.log('\nNote: The user should log out and log back in for changes to take effect.');

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

setupAdmin();
