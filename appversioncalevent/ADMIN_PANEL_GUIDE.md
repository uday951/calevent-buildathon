# Admin Panel Access Guide

## Admin Login Credentials

**Email:** `admin@calevent.com`  
**Password:** `admin123`

## How to Access Admin Panel

1. Open the CALEVENT mobile app
2. On the login screen, enter admin credentials:
   - Email: `admin@calevent.com`
   - Password: `admin123`
3. Click "Sign In"
4. You'll be automatically redirected to the Admin Dashboard (not the customer app)

## Admin Dashboard Features

### 📊 Statistics Overview
- **Total Requests**: All event booking requests
- **Pending**: Requests waiting for action
- **Completed**: Successfully completed events

### 🔍 Filter Options
- **All**: View all requests
- **Pending**: New requests needing attention
- **Active**: Requests in progress (contacted, assigned, quoted, approved, in_progress)
- **Done**: Completed events
- **Cancelled**: Cancelled requests

### 📋 Request Management

Each request card shows:
- Event title and type
- Customer name and phone
- Event date and guest count
- Venue location
- Budget range
- Special requests
- Current status

### ⚡ Quick Actions

Based on request status, you can:

1. **Pending → Contacted**
   - Click "✓ Contact" to mark as contacted
   - Click "✕ Cancel" to cancel the request

2. **Contacted → Providers Assigned**
   - Click "👥 Assign Provider" to assign event providers

3. **Providers Assigned → Quoted**
   - Click "💵 Send Quote" to send pricing quote

4. **Approved → In Progress**
   - Click "🚀 Start Event" when event begins

5. **In Progress → Completed**
   - Click "✓ Complete" when event is finished

### 🔄 Refresh Data
- Pull down to refresh the dashboard
- Auto-refreshes when status is updated

### 🚪 Logout
- Click "🚪 Logout" button in top-right corner
- Confirms before logging out

## Status Flow

```
Pending
  ↓
Contacted
  ↓
Providers Assigned
  ↓
Quoted
  ↓
Approved (by customer)
  ↓
In Progress
  ↓
Completed
```

## Notes

- Admin panel is completely separate from customer app
- Admin cannot access customer features (browsing events, booking, etc.)
- All request data is fetched from backend API
- Status updates are instant and reflected immediately
- Customer information is displayed for easy contact

## API Endpoints Used

- `GET /api/event-requests/admin/stats` - Dashboard statistics
- `GET /api/event-requests/admin/all` - All requests with filters
- `PATCH /api/event-requests/admin/:id/status` - Update request status

## Security

- Admin credentials are checked during login
- Admin role is stored in auth state
- Navigation automatically routes to admin dashboard
- Regular customers cannot access admin panel
- Admin cannot access customer app features

## Troubleshooting

**Can't login?**
- Verify credentials: `admin@calevent.com` / `admin123`
- Check backend is running
- Ensure admin account exists in database (run `node seed-admin.js`)

**Dashboard not loading?**
- Check internet connection
- Verify backend API is accessible
- Pull down to refresh

**Status update fails?**
- Check request ID is valid
- Verify admin token is valid
- Check backend logs for errors
