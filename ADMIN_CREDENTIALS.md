# Chase Banking Admin Credentials

## Overview
This document contains the admin login credentials for the Chase Banking application. Keep this information secure and change passwords after first login.

## Admin Accounts

### Primary Admin Account
- **Email**: admin@chase.com
- **Password**: Admin@2024!
- **Role**: admin
- **Permissions**: Full system access, user management, reports, settings
- **URL**: http://localhost:3000/auth/login

### Manager Account
- **Email**: manager@chase.com
- **Password**: Manager@2024!
- **Role**: manager
- **Permissions**: User management, report viewing, limited settings access
- **URL**: http://localhost:3000/auth/login

### Support Account
- **Email**: support@chase.com
- **Password**: Support@2024!
- **Role**: support
- **Permissions**: User support, view logs, handle tickets
- **URL**: http://localhost:3000/auth/login

## Creating Admin Users

### Method 1: Using the Setup Script
Run the admin user creation script to automatically generate admin accounts with bcrypt-hashed passwords:

```bash
uv run scripts/create-admin-user.mjs
```

This script will:
1. Connect to your Neon database
2. Create three default admin accounts if they don't exist
3. Display credentials on screen
4. Hash passwords securely with bcryptjs

### Method 2: Manual Database Insertion
If you prefer to manually create admin users, use the SQL script:

```bash
# Execute in Neon Console SQL Editor
cat scripts/seed-admin.sql
```

## Admin Dashboard Features

Once logged in as admin, you can access:

### User Management
- View all registered users
- Create new user accounts
- Manage user roles and permissions
- Reset user passwords
- Deactivate/reactivate accounts

### Security Center
- View audit logs
- Monitor active sessions
- Manage IP whitelists
- Review security alerts
- Configure 2FA policies

### Reports & Analytics
- User activity reports
- Transaction history
- System health metrics
- Performance statistics
- Compliance reports

### System Settings
- Configure API endpoints
- Manage notification preferences
- Set system parameters
- Database maintenance
- Backup scheduling

## Security Best Practices

1. **Change Default Passwords**: Change all default passwords immediately after first login
2. **Enable MFA**: Set up multi-factor authentication for all admin accounts
3. **Use Strong Passwords**: Minimum 12 characters with mixed case, numbers, and symbols
4. **Limit Admin Accounts**: Only create admin accounts for authorized personnel
5. **Audit Logs**: Regularly review audit logs for suspicious activity
6. **Session Management**: Monitor active sessions and terminate unused ones
7. **IP Whitelisting**: Restrict admin access to specific IP addresses when possible

## Accessing the Admin Dashboard

1. Navigate to: `http://localhost:3000/auth/login`
2. Enter admin email: `admin@chase.com`
3. Enter admin password: `Admin@2024!`
4. Complete 2FA if enabled
5. You'll be redirected to: `http://localhost:3000/admin`

## Troubleshooting

### Can't log in as admin?
- Verify the email and password are correct
- Check if the admin account exists in the database
- Ensure the Neon database is running
- Check browser console for error messages

### Access denied error?
- Verify your email is in the admin list
- Check your user role in the database
- Clear browser cache and cookies
- Try in an incognito/private window

### Password reset needed?
- Contact the primary admin or database administrator
- Use the password reset function: `/auth/forgot-password`
- Or execute the creation script to regenerate admin accounts

## Account Maintenance

### Rotating Passwords
Every 90 days, administrators should:
1. Change their password via `/auth/profile` → Change Password
2. Update any documentation if needed
3. Notify other admins of rotation

### Auditing Admin Activity
Regular audits should check:
- Last login dates
- Failed login attempts
- API access patterns
- Data export activity
- Permission changes

## Support

For admin-related issues:
- Contact: support@chase.com (Support admin account)
- Documentation: See NEON_AUTH_SETUP.md
- Security Issues: Report immediately to admin@chase.com

## Important Security Notes

⚠️ **WARNING**: These are default credentials for development/setup purposes only.

- **NEVER** use these credentials in production
- **ALWAYS** change passwords after initial setup
- **NEVER** commit real credentials to version control
- **ALWAYS** use environment variables for sensitive data in production
- **REGULARLY** audit admin accounts and permissions

The password hashing uses bcryptjs with salt rounds of 10, making brute-force attacks computationally expensive.
