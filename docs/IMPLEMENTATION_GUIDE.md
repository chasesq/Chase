# Complete User Flow Implementation Guide

## Overview
This document describes the complete implementation of customer flows, admin dashboards, notifications, and Plaid bank integration for the Chase banking app.

## Architecture Components

### 1. Customer User Flow
- **Signup**: Users create account via Supabase Auth
- **Auto-Login**: Supabase session cookie set automatically
- **Account Creation**: Neon record created with `balance = 0`
- **Dashboard Access**: User redirected to `/dashboard` with full customer access
- **Data Isolation**: Middleware ensures users only see their own data

### 2. Admin Dashboard
- **Admin Login**: Admin user logs in with `role = 'admin'`
- **System Summary**: `/api/admin/summary` endpoint provides:
  - Total system balance (sum of all accounts)
  - Total user count
  - Active bank connections (Plaid items)
  - Recent transactions across all users
  - Transaction volume and averages
- **Access Control**: Middleware restricts to admin users only
- **UI Update**: `/app/admin/page.tsx` displays system-wide metrics

### 3. Notifications System

#### Database Tables
- `notifications` - Individual notifications for users
  - Columns: id, user_id, type, message, data (JSONB), read, created_at, updated_at
  - Indexes on: user_id, user_id+read, created_at

- `notification_preferences` - User notification settings
  - Columns: id, user_id, transaction_alerts, payment_confirmations, system_messages, push_notifications, email_notifications
  - Allows users to control notification types

#### API Endpoints
- **GET `/api/notifications`** - Fetch paginated notifications with filters
  - Query params: `page`, `limit`, `read`, `type`
  - Returns: notifications array + pagination info + unread count

- **PATCH `/api/notifications`** - Mark notifications as read
  - Body: `{ notificationId?, markAllAsRead? }`
  - Marks single or all notifications as read

- **DELETE `/api/notifications`** - Delete a notification
  - Query param: `notificationId`

- **POST `/api/notifications`** - Update preferences (same endpoint)
  - Body: notification preference flags
  - Creates or updates user preferences

#### Notification Types
- `bank_linked` - Bank account successfully linked
- `transaction_available` - New transactions from Plaid
- `bank_error` - Error syncing bank account
- `holdings_update` - Investment holdings changed

#### Real-Time Updates
- Supabase Realtime subscribes to `notifications` table
- Frontend listens for INSERT events on user's notifications
- Component updates instantly when new notification created
- NotificationBell component shows unread count + dropdown

### 4. Plaid Integration

#### Database Table: plaid_items
```sql
CREATE TABLE plaid_items (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  item_id TEXT UNIQUE,
  access_token TEXT,
  institution_id TEXT,
  institution_name TEXT,
  linked_at TIMESTAMPTZ,
  last_sync TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

Maps each user to their Plaid item (Chase account connection).

#### API Endpoints

##### 1. Generate Link Token
- **POST `/api/plaid/link-token`**
- Called before opening Plaid Link modal
- Returns: `link_token` (valid for 10 minutes)
- Configures Link for:
  - Products: auth, transactions
  - Country: US
  - Account types: checking, savings
  - Webhook: `/api/plaid/webhook`

##### 2. Exchange Public Token
- **POST `/api/plaid/exchange-token`**
- Called after successful Plaid Link flow
- Body: `{ public_token, institution }`
- Exchanges public token → access token + item_id
- Stores mapping in `plaid_items` table
- Creates "bank_linked" notification
- Returns: success + institution name + linked date

##### 3. List Linked Banks
- **GET `/api/plaid/linked-banks`**
- Fetches user's connected bank accounts
- Returns: array of linked banks with institution names

##### 4. Unlink Bank
- **DELETE `/api/plaid/linked-banks`**
- Query param: `item_id`
- Removes from `plaid_items` table
- Optionally notifies Plaid to revoke access

##### 5. Webhook Handler
- **POST `/api/plaid/webhook`**
- Receives webhooks from Plaid when transactions update
- Webhook types handled:
  - `TRANSACTIONS` / `DEFAULT_UPDATE` - New transactions
  - `TRANSACTIONS` / `TRANSACTIONS_REMOVED` - Deleted transactions
  - `ITEM` / `ERROR` - Connection errors
  - `HOLDINGS` - Investment updates

#### Webhook Flow
1. Plaid sends webhook with `item_id` and new transaction info
2. Backend looks up `user_id` from `plaid_items.item_id`
3. Creates transaction record in `transactions` table
4. Creates notification entry in `notifications` table
5. Supabase Realtime pushes notification to user's dashboard
6. User sees alert: "New transaction from Chase"

### 5. UI Components

#### NotificationBell Component
- **Location**: `/components/notification-bell.tsx`
- **Features**:
  - Shows unread count badge
  - Dropdown list of recent notifications
  - Real-time updates via Supabase Realtime
  - Mark individual/all as read
  - Delete notifications
  - Formatted timestamps

#### PlaidLinkButton Component
- **Location**: `/components/plaid-link-button.tsx`
- **Features**:
  - Generates link token on click
  - Opens Plaid Link modal
  - Handles success/error flows
  - Shows loading state
  - Displays error messages

#### Bank Connection Page
- **Location**: `/app/settings/connect-bank/page.tsx`
- **Features**:
  - List of linked banks
  - Connect new bank button
  - Unlink existing banks
  - Security notes
  - Load/error states

#### Dashboard Header Update
- **Location**: `/components/dashboard-header.tsx`
- **Changes**: Integrated NotificationBell component
- Shows notifications in white text on blue header

### 6. Environment Variables

Required Plaid configuration:
```
NEXT_PUBLIC_PLAID_CLIENT_ID=your_client_id
PLAID_SECRET=your_secret_key
PLAID_ENV=sandbox|development|production
NEXT_PUBLIC_APP_URL=http://localhost:3000 (for webhook URL)
```

### 7. Data Flow Diagram

```
User Flow:
Sign Up → Supabase Auth → Neon Account (balance=0) → Dashboard

Bank Link Flow:
Connect Bank → Plaid Link → Exchange Token → Webhook Setup → Notification

Transaction Sync Flow:
Chase Transaction → Plaid Webhook → Create Notification → Supabase Realtime → Dashboard

Admin Flow:
Admin Login → Access /admin → Query Summary API → View System Totals
```

## Setup Instructions

### 1. Run Database Migrations
```bash
# Create Plaid items table
node scripts/setup-plaid-db.js

# Create Notifications tables
node scripts/setup-notifications-db.js
```

### 2. Configure Environment Variables
Add to `.env.local`:
```
NEXT_PUBLIC_PLAID_CLIENT_ID=your_client_id
PLAID_SECRET=your_secret_key
PLAID_ENV=sandbox
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Update Plaid Webhook Configuration
In Plaid Dashboard:
- Go to Team Settings → Webhooks
- Set webhook URL to: `https://your-domain.com/api/plaid/webhook`
- Enable event types:
  - TRANSACTIONS → DEFAULT_UPDATE
  - ITEM → ERROR, WEBHOOK_UPDATE_ACKNOWLEDGED
  - HOLDINGS → DEFAULT_UPDATE

### 4. Test the Flow
1. Create new user account (signup with Supabase)
2. Verify account created with 0 balance
3. Navigate to `/settings/connect-bank`
4. Link a test bank account via Plaid
5. Check notifications appear in bell
6. Admin: Visit `/admin` to see system summary
7. Verify non-admins redirected from `/admin`

## Testing

### Customer Flow Test
1. Sign up new user
2. Verify auto-login to dashboard
3. Check empty balance displayed
4. Click notification bell → should show empty state
5. Navigate to `/settings/connect-bank`
6. Link test bank account
7. Check "Bank linked" notification appears

### Admin Flow Test
1. Log in as admin user
2. Visit `/admin` → should display summary
3. Log in as regular user
4. Try to visit `/admin` → should redirect to `/dashboard`
5. Check API `/api/admin/summary` → returns 403 for non-admins

### Notification Test
1. Connect bank account
2. Trigger test transaction in Plaid dashboard
3. Webhook fires → notification created
4. Bell updates with unread count
5. Click notification → mark as read
6. Unread count decreases

## Security Considerations

1. **Webhook Validation**: In production, verify Plaid webhook signatures
2. **Access Tokens**: Stored encrypted in database (consider additional encryption)
3. **User Isolation**: Middleware ensures users only see their own data
4. **Admin Check**: `/admin` routes check `role === 'admin'` before returning data
5. **API Auth**: All endpoints require Supabase session
6. **Plaid Link**: Secure HTTPS connection required for public token exchange

## Performance Optimizations

1. **Notification Pagination**: Fetch 20 per page to reduce payload
2. **Real-Time Subscriptions**: Only subscribe to current user's notifications
3. **Database Indexes**: Indexes on frequently queried columns (user_id, created_at)
4. **API Caching**: Admin summary could be cached for 1-5 minutes
5. **Component Lazy Loading**: Plaid Link loaded on demand

## Future Enhancements

1. **Push Notifications**: Integrate Firebase Cloud Messaging (FCM)
2. **Email Notifications**: Send digests to users
3. **Transaction Details**: Fetch full transaction history from Plaid
4. **Balance Updates**: Real-time balance sync from Plaid
5. **Multi-Account Support**: Link multiple Chase/bank accounts per user
6. **Transaction Categories**: Categorize transactions from Plaid metadata
7. **Alerts & Rules**: Custom alerts (e.g., large transactions)
8. **Export Data**: Download transactions as CSV/PDF

## Troubleshooting

### Notification Not Appearing
1. Check Supabase Realtime enabled for `notifications` table
2. Verify `user_id` correctly stored in notification record
3. Check browser console for subscription errors
4. Test via API: `GET /api/notifications`

### Plaid Webhook Not Firing
1. Verify webhook URL configured in Plaid Dashboard
2. Check Plaid environment (sandbox vs production)
3. Check `/api/plaid/webhook` logs for errors
4. Verify `item_id` mapping in `plaid_items` table

### Admin Can't See Summary
1. Verify user `role = 'admin'` in database
2. Check middleware not blocking `/admin/summary` access
3. Verify Supabase session valid (not expired)
4. Check browser console for API errors

## Support

For issues, check:
1. Console logs: `[v0]` prefixed messages
2. Database: Verify tables created and indexed
3. Environment vars: Confirm all required vars set
4. Supabase: Check auth sessions active
5. Plaid: Verify credentials and webhook URL
