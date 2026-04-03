# Admin & User Login Credentials

## Default Admin Accounts

The following admin accounts have been created for development and testing purposes:

### Primary Admin Account
- **Email**: `admin@chase.com`
- **Password**: `Admin@123456`

### Secondary Admin Account (Super Admin)
- **Email**: `super_admin@chase.com`
- **Password**: `SuperAdmin@789012`

## Default User Accounts

### Standard User Account
- **Email**: `john.smith@example.com`
- **Password**: `JohnSmith@2024` (bcrypt hashed)
- **Full Name**: John Smith
- **Status**: Active

## Access Points

### Admin Login
The admin login page is available at:
```
/admin/login
```

### Credentials Management Dashboard
Manage all admin and user credentials at:
```
/credentials
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
- Manage user credentials

## Credentials Management System

The system provides a unified dashboard for managing both admin and user login credentials:

### Features
- **Create**: Add new admin or user credentials
- **Read**: View all credentials with search/filter
- **Update**: Modify email, name, password, and status
- **Delete**: Remove credentials from the system
- **Search**: Find credentials by email or full name
- **Password Validation**: Enforce strong password requirements

### Password Requirements
Passwords must contain:
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character (!@#$%^&*)

### Database Tables
- **admin_credentials**: Stores admin user login credentials
- **user_credentials**: Stores regular user login credentials

Both tables include:
- Email (unique)
- Password hash (bcrypt)
- Full name
- Status (active/inactive)
- Created/updated timestamps

## API Endpoints

### Admin Authentication
- **Login**: `POST /api/admin/auth/login`
- **Logout**: `POST /api/admin/auth/logout`

### Credentials Management
- **Get Admin Credentials**: `GET /api/credentials/admin?query=search_term`
- **Create Admin Credential**: `POST /api/credentials/admin`
- **Get User Credentials**: `GET /api/credentials/user?query=search_term`
- **Create User Credential**: `POST /api/credentials/user`
- **Get Single Credential**: `GET /api/credentials/[type]/[id]`
- **Update Credential**: `PUT /api/credentials/[type]/[id]`
- **Delete Credential**: `DELETE /api/credentials/[type]/[id]`

### Parameters
- **type**: `admin` or `user`
- **id**: Credential record ID
- **query**: Search term (optional)

## Session Management

Admin sessions are managed via secure HTTP-only cookies. When an admin logs out, their session is immediately invalidated.

**Session Cookie**: `admin_session`
**Expiration**: 24 hours (configurable)

## Important Security Notes

⚠️ **For Production**: 
- Change these default credentials immediately
- Use stronger, unique passwords
- Implement proper role-based access control (RBAC)
- Enable two-factor authentication (2FA)
- Audit admin access logs regularly
- Implement rate limiting on login endpoints
- Enable password history to prevent reuse
- Set credential expiration policies

## Credential Management Utility Library

Located at `lib/credentials-management.ts`, this library provides:

```typescript
// Password management
hashPassword(password: string) -> Promise<string>
verifyPassword(password: string, hash: string) -> Promise<boolean>

// Validation
validatePassword(password: string) -> { isValid: boolean; errors: string[] }
validateEmail(email: string) -> boolean

// CRUD operations
getAdminCredentials() -> Promise<Credential[]>
getUserCredentials() -> Promise<Credential[]>
getCredentialById(type, id) -> Promise<Credential>
createCredential(type, input) -> Promise<Credential>
updateCredential(type, id, input) -> Promise<Credential>
deleteCredential(type, id) -> Promise<void>
searchCredentials(type, query) -> Promise<Credential[]>
```

---

Generated for Chase Bank Admin Portal
