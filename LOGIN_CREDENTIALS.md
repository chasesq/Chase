# Login Credentials Summary

This document contains the login credentials for the Chase Bank Admin Portal system.

## Admin Credentials

### Admin Account 1
- **Email**: admin@chase.com
- **Password**: Admin@123456
- **Role**: Primary Admin
- **Access**: Full admin dashboard access

### Admin Account 2 (Super Admin)
- **Email**: super_admin@chase.com
- **Password**: SuperAdmin@789012
- **Role**: Super Admin
- **Access**: Full admin dashboard access + system configuration

## User Credentials

### User Account - John Smith
- **Email**: john.smith@example.com
- **Password**: JohnSmith@123456 (corresponds to bcrypt hash)
- **Full Name**: John Smith
- **Status**: Active
- **Account Type**: Standard User

## Access URLs

### Admin Portal
- **URL**: `https://yourdomain.com/admin/login`
- **Dashboard**: `https://yourdomain.com/admin`

### Credentials Management
- **URL**: `https://yourdomain.com/credentials`
- **Description**: Manage all admin and user credentials (admin access required)

## Database Information

### Admin Credentials Table
```sql
SELECT * FROM admin_credentials;
```
- Stores all admin user login information
- Passwords are bcrypt hashed (10 salt rounds)
- Emails are unique
- Created and updated timestamps tracked

### User Credentials Table
```sql
SELECT * FROM user_credentials;
```
- Stores all regular user login information
- Passwords are bcrypt hashed (10 salt rounds)
- Emails are unique
- Status field indicates if account is active/inactive
- Created and updated timestamps tracked

## Password Policy

All passwords must meet the following requirements:
- ✓ Minimum 8 characters
- ✓ At least 1 uppercase letter (A-Z)
- ✓ At least 1 lowercase letter (a-z)
- ✓ At least 1 number (0-9)
- ✓ At least 1 special character (!@#$%^&*)

## How to Create New Credentials

### Via Credentials Management Dashboard
1. Navigate to `/credentials`
2. Select either "Admin Credentials" or "User Credentials" tab
3. Click "+ Add Credential"
4. Fill in the form:
   - Email (must be unique)
   - Full Name
   - Password (will be validated against policy)
   - Status (Active/Inactive)
5. Click "Save"

### Via API
```bash
# Create Admin Credential
curl -X POST https://yourdomain.com/api/credentials/admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newadmin@chase.com",
    "password": "NewAdmin@12345",
    "full_name": "New Admin User",
    "status": "active"
  }'

# Create User Credential
curl -X POST https://yourdomain.com/api/credentials/user \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "NewUser@12345",
    "full_name": "New User Name",
    "status": "active"
  }'
```

## How to Update Credentials

### Via Credentials Management Dashboard
1. Navigate to `/credentials`
2. Find the credential you want to update
3. Click "Edit"
4. Modify the desired fields
5. Click "Save"

### Via API
```bash
curl -X PUT https://yourdomain.com/api/credentials/admin/1 \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Updated Name",
    "status": "inactive"
  }'
```

## How to Delete Credentials

### Via Credentials Management Dashboard
1. Navigate to `/credentials`
2. Find the credential you want to delete
3. Click "Delete"
4. Confirm the deletion

### Via API
```bash
curl -X DELETE https://yourdomain.com/api/credentials/admin/1
```

## How to Search Credentials

### Via Credentials Management Dashboard
1. Navigate to `/credentials`
2. Use the search box to find by email or full name
3. Results update in real-time

### Via API
```bash
curl "https://yourdomain.com/api/credentials/user?query=john"
```

## Security Best Practices

⚠️ **Important Security Notes**:

1. **Change Default Credentials**: Change all default credentials immediately in production
2. **Store Securely**: Never commit credentials to version control
3. **Use Environment Variables**: Store passwords in secure environment variables
4. **Enable 2FA**: Implement two-factor authentication for admin accounts
5. **Audit Logs**: Monitor and log all credential access and modifications
6. **Regular Updates**: Require password changes every 90 days
7. **Access Control**: Limit who can view/modify credentials
8. **Rate Limiting**: Implement rate limiting on login endpoints
9. **Session Security**: Use secure HTTP-only cookies for sessions
10. **Encryption**: Consider encrypting sensitive data at rest

## Troubleshooting

### Forgot Password?
Currently, there is no password reset functionality. Contact the system administrator to reset credentials.

### Account Locked?
If an account needs to be unlocked, set its status to "active" in the credentials management dashboard or database.

### Can't Create Credential?
- Verify email doesn't already exist
- Check password meets all requirements
- Ensure full name is provided
- Verify you have admin access

---

**Last Updated**: 2024
**System**: Chase Bank Admin Portal
