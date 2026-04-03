# Admin Login Credentials

## Default Admin Accounts

The following admin accounts have been created for development and testing purposes:

### Primary Admin Account
- **Email**: `admin@chase.com`
- **Password**: `Admin@123456`

### Secondary Admin Account (Super Admin)
- **Email**: `super_admin@chase.com`
- **Password**: `SuperAdmin@789012`

## Admin Login Access

The admin login page is available at:
```
/admin/login
```

## What Admins Can Do

Once logged in, admins have access to the Admin Dashboard where they can:

- Manage user accounts
- Process fund transfers
- View financial accounts
- Schedule payouts
- Issue and manage cards
- Manage credit policies
- Access test utilities

## Important Security Notes

⚠️ **For Production**: 
- Change these default credentials immediately
- Use stronger, unique passwords
- Implement proper role-based access control (RBAC)
- Enable two-factor authentication (2FA)
- Audit admin access logs regularly

## Database Details

Admin credentials are stored in the `admin_credentials` table with:
- Hashed passwords (bcrypt)
- Email addresses
- Creation timestamps
- Admin status flags

## Session Management

Admin sessions are managed via secure HTTP-only cookies. When an admin logs out, their session is immediately invalidated.

**Session Cookie**: `admin_session`
**Expiration**: 24 hours (configurable)

## API Endpoints

- **Login**: `POST /api/admin/auth/login`
- **Logout**: `POST /api/admin/auth/logout`

---

Generated for Chase Bank Admin Portal
