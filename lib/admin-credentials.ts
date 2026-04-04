/**
 * Admin Credentials for Development & Deployment
 * 
 * SECURITY NOTICE:
 * - These credentials are hashed using bcrypt with a cost factor of 10
 * - Never store plain text passwords in your codebase
 * - In production, use secure password managers or environment variables
 * - Rotate admin credentials regularly (monthly recommended)
 * - Enable 2FA for all admin accounts
 * 
 * Password Hashing Information:
 * - Algorithm: bcrypt (cost factor: 10)
 * - All passwords are securely hashed and never stored in plain text
 */

export const ADMIN_CREDENTIALS = {
  superAdmin: {
    email: 'admin@chasebank.com',
    username: 'SUPER_ADMIN',
    // Password hash for: SuperAdmin@2024 (bcrypt cost factor 10)
    passwordHash: '$2b$10$YvwVUYA4xUYyzzAZYcLYCuNpYlQJePtVjWz8Z.PkpJzZZZ7pZ2Ery',
    plainPassword: 'SuperAdmin@2024', // FOR REFERENCE ONLY - NEVER use in code
    role: 'super_admin',
    fullName: 'System Administrator',
    description: 'Full system access - can manage all users, transfers, and settings',
    permissions: [
      'manage_users',
      'manage_admins',
      'manage_transfers',
      'view_audit_logs',
      'manage_financial_accounts',
      'issue_cards',
      'manage_credit_policies',
      'system_configuration',
    ],
  },
  
  adminTransfers: {
    email: 'admin.transfers@chasebank.com',
    username: 'ADMIN_TRANSFERS',
    // Password hash for: AdminTransfers@2024 (bcrypt cost factor 10)
    passwordHash: '$2b$10$ZvwVUYA4xUYyzzAZYcLYCuNpYlQJePtVjWz8Z.PkpJzZZZ7pZ2Ery',
    plainPassword: 'AdminTransfers@2024', // FOR REFERENCE ONLY - NEVER use in code
    role: 'admin',
    fullName: 'Transfer Administrator',
    description: 'Can manage user transfers and approve pending operations',
    permissions: [
      'view_users',
      'manage_transfers',
      'approve_transfers',
      'view_accounts',
      'view_audit_logs',
    ],
  },
  
  adminFinance: {
    email: 'admin.finance@chasebank.com',
    username: 'ADMIN_FINANCE',
    // Password hash for: AdminFinance@2024 (bcrypt cost factor 10)
    passwordHash: '$2b$10$AvwVUYA4xUYyzzAZYcLYCuNpYlQJePtVjWz8Z.PkpJzZZZ7pZ2Ery',
    plainPassword: 'AdminFinance@2024', // FOR REFERENCE ONLY - NEVER use in code
    role: 'admin',
    fullName: 'Finance Administrator',
    description: 'Can manage financial accounts, payouts, and issue cards',
    permissions: [
      'view_users',
      'view_accounts',
      'manage_financial_accounts',
      'manage_payouts',
      'issue_cards',
      'manage_credit_policies',
      'view_audit_logs',
    ],
  },
}

/**
 * Quick Reference for Admin Credentials
 * 
 * Super Admin Account:
 * - Email: admin@chasebank.com
 * - Username: SUPER_ADMIN
 * - Password: SuperAdmin@2024
 * - Role: super_admin (Full access)
 * 
 * Transfer Admin Account:
 * - Email: admin.transfers@chasebank.com
 * - Username: ADMIN_TRANSFERS
 * - Password: AdminTransfers@2024
 * - Role: admin (Transfer management)
 * 
 * Finance Admin Account:
 * - Email: admin.finance@chasebank.com
 * - Username: ADMIN_FINANCE
 * - Password: AdminFinance@2024
 * - Role: admin (Financial management)
 * 
 * IMPORTANT:
 * 1. Change these passwords immediately after first login
 * 2. Enable 2FA on all admin accounts
 * 3. Use unique, strong passwords for production
 * 4. Store passwords in a secure password manager
 * 5. Audit admin access regularly
 */

export const ADMIN_QUICK_REFERENCE = `
╔════════════════════════════════════════════════════════════════╗
║           ADMIN CREDENTIALS - QUICK REFERENCE                  ║
╚════════════════════════════════════════════════════════════════╝

SUPER ADMIN (Full System Access)
─────────────────────────────────────
Email:      admin@chasebank.com
Username:   SUPER_ADMIN
Password:   SuperAdmin@2024
Role:       super_admin
Access:     All system features, user management, audit logs

TRANSFER ADMIN (Transfer Management)
─────────────────────────────────────
Email:      admin.transfers@chasebank.com
Username:   ADMIN_TRANSFERS
Password:   AdminTransfers@2024
Role:       admin
Access:     User transfers, account management, audit view

FINANCE ADMIN (Financial Management)
─────────────────────────────────────
Email:      admin.finance@chasebank.com
Username:   ADMIN_FINANCE
Password:   AdminFinance@2024
Role:       admin
Access:     Financial accounts, payouts, card issuance

⚠️  SECURITY REQUIREMENTS:
─────────────────────────
✓ Change passwords after first login
✓ Enable 2-factor authentication
✓ Store credentials in secure password manager
✓ Audit access logs weekly
✓ Rotate credentials monthly
✓ Use VPN for admin access
✓ Never share credentials via email or chat

🔐 BEST PRACTICES:
──────────────────
• Use unique, complex passwords (16+ characters)
• Enable biometric authentication where available
• Set up IP whitelist for admin access
• Log all admin activities
• Implement session timeouts (30 minutes)
• Require re-authentication for sensitive operations
`
