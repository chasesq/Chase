# Chase Banking - Authentication Setup

## Overview
The authentication system has been successfully configured with a unified login dashboard, admin credentials, and account name support.

## Admin Login Credentials

### Admin User
- **Email:** admin@chase.com
- **Password:** Admin@2024!
- **Account Name:** Chase Admin
- **Role:** admin

### Manager User
- **Email:** manager@chase.com
- **Password:** Manager@2024!
- **Account Name:** Chase Manager
- **Role:** manager

### Support User
- **Email:** support@chase.com
- **Password:** Support@2024!
- **Account Name:** Chase Support
- **Role:** support

## Login Flow

### 1. Access Login Page
Navigate to `/auth/login` to access the unified login dashboard with:
- Email input
- Password input
- Optional Account Name field
- Sign up and forgot password modals

### 2. Sign In
Enter credentials and optionally customize the account name. The system will:
- Validate credentials against admin users list
- Create a session cookie
- Redirect to home page (`/`)

### 3. Dashboard Access
After successful login, users see:
- Welcome message
- Account information (email, name, status)
- Refresh and Sign Out buttons
- Professional Chase banking branding

## API Endpoints

### POST /api/auth/sign-in
Handles login with email, password, and optional account name.

**Request:**
```json
{
  "email": "admin@chase.com",
  "password": "Admin@2024!",
  "accountName": "Custom Account Name" (optional)
}
```

**Response:**
```json
{
  "user": {
    "id": "admin",
    "email": "admin@chase.com",
    "name": "Custom Account Name",
    "accountName": "Custom Account Name",
    "role": "admin"
  },
  "message": "Sign in successful"
}
```

### POST /api/auth/sign-out
Clears session cookie and logs user out.

## Architecture

- **Login Page** (`/auth/login`): Unified Client Component dashboard
- **Home Page** (`/`): Authenticated dashboard with session checking
- **API Routes**: Session-based authentication with cookies
- **Session Management**: Browser cookies for stateless authentication

## Key Features

✓ Admin login credentials with passwords
✓ Optional account name customization
✓ Secure session cookies (HTTP-only, SameSite)
✓ Clean, professional UI with Chase branding
✓ Responsive design (mobile and desktop)
✓ Automatic redirect to login if session expires
✓ User information display on dashboard
