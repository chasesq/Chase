# Role-Based Access Control Guide

## Overview
The application now has role-based access control that redirects users to appropriate dashboards based on their account type.

## Admin Accounts

Admin accounts have access to the **Admin Dashboard** (`/admin`).

### Admin Users (Created)

1. **Super Admin**
   - Email: `admin@chasebank.com`
   - Password: `SuperAdmin@2024`
   - Role: `super_admin`
   - Tier: Super Admin
   - Access: Full admin dashboard with all features

2. **Transfer Admin**
   - Email: `admin.transfers@chasebank.com`
   - Password: `AdminTransfers@2024`
   - Role: `admin`
   - Tier: Admin
   - Access: Admin dashboard with transfer management

3. **Finance Admin**
   - Email: `admin.finance@chasebank.com`
   - Password: `AdminFinance@2024`
   - Role: `admin`
   - Tier: Admin
   - Access: Admin dashboard with finance management

## Regular User Accounts

Regular user accounts have access to the **User Dashboard** (`/`).

### Regular Users (Created)

1. **Lin Huang**
   - Email: `linhuang011@gmail.com`
   - Password: `Lin2000`
   - Username: `LIN_HUANG`
   - Role: Regular user (`is_admin: false`)
   - Tier: Premium
   - Access: Personal user dashboard with:
     - Account overview
     - Transaction history
     - Transfer features
     - Account management
     - Real-time balance updates

## Login Flow

1. User logs in with email and password
2. System checks `is_admin` flag and `tier` field
3. **If admin**: Redirected to `/admin`
4. **If regular user**: Redirected to `/` (user dashboard)
5. Unauthorized users attempting to access `/admin` are redirected to `/`

## Admin Dashboard Features

- User management
- Transfer management
- Financial accounts oversight
- Payout scheduling
- Card issuance
- Credit policy management
- Real-time monitoring

## User Dashboard Features

- Account summary
- Transaction history
- Transfer capabilities (between own accounts)
- Payment management
- Savings goals tracking
- Spending analysis
- Profile management

## Security

- Role-based authorization is checked on both client and server
- Unauthorized access attempts redirect to appropriate pages
- User profiles stored in localStorage with role information
- Admin endpoints check for admin authorization headers
