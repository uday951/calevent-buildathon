# 🛡️ CALEVENT Admin Panel

## 🚀 Features Implemented

### **Core Admin Functions:**
- **Provider Verification** - Approve/reject provider registrations with reasons
- **User Management** - View, suspend, and activate customers/providers
- **Dashboard Analytics** - Real-time platform metrics and insights
- **Content Moderation** - Review events, images, and user content
- **Revenue Tracking** - Monitor platform earnings and transactions

### **Security Features:**
- **Role-based Access** - Super Admin, Admin, Moderator roles
- **Permission System** - Granular permissions for different actions
- **Secure Authentication** - JWT-based admin authentication
- **Activity Logging** - Track all admin actions (future enhancement)

## 🔧 Setup Instructions

### 1. **Create Admin User**
```bash
# Run the admin seeding script
create-admin.bat

# Or manually:
cd calevent-backend
node seed-admin.js
```

**Default Admin Credentials:**
- Email: `admin@calevent.com`
- Password: `admin123`
- Role: `super_admin`

### 2. **Access Admin Panel**
- Navigate to: `http://localhost:5173/admin/login`
- Login with admin credentials
- Dashboard: `http://localhost:5173/admin/dashboard`

## 📊 Admin Dashboard Features

### **Key Metrics:**
- Total Providers (Active/Pending)
- Total Customers
- Total Events
- Monthly Revenue
- Booking Statistics

### **Provider Verification:**
- View pending provider applications
- Review business documents
- Approve/Reject with reasons
- Email notifications (future)

### **User Management:**
- List all customers and providers
- Suspend/Activate accounts
- View user activity
- Handle disputes

## 🔐 Permission System

### **Roles:**
- **Super Admin** - Full access to everything
- **Admin** - Most features except system settings
- **Moderator** - Content moderation only

### **Permissions:**
- `manage_users` - User management functions
- `verify_providers` - Provider verification
- `moderate_content` - Content review and moderation
- `view_analytics` - Access to analytics and reports
- `manage_payments` - Payment and transaction management

## 🛠️ API Endpoints

### **Authentication:**
```
POST /api/admin/login - Admin login
```

### **Dashboard:**
```
GET /api/admin/dashboard - Dashboard statistics
GET /api/admin/analytics - Detailed analytics
```

### **Provider Management:**
```
GET /api/admin/providers/pending - Pending verifications
PATCH /api/admin/providers/:id/verify - Approve/reject provider
```

### **User Management:**
```
GET /api/admin/users - List all users
PATCH /api/admin/users/:id/:type/toggle-status - Suspend/activate user
```

## 🎯 Admin Workflow

### **Provider Verification Process:**
1. Provider registers on platform
2. Admin receives notification in dashboard
3. Admin reviews business details and documents
4. Admin approves/rejects with reason
5. Provider receives email notification
6. Approved providers can start posting events

### **User Management:**
1. Monitor user activity and reports
2. Investigate complaints or violations
3. Suspend accounts if necessary
4. Handle appeals and reinstatements

### **Content Moderation:**
1. Review flagged events and content
2. Check for inappropriate images/descriptions
3. Remove or request modifications
4. Maintain platform quality standards

## 🚀 Future Enhancements

### **Planned Features:**
- **Email Notifications** - Automated emails for verifications
- **Advanced Analytics** - Revenue trends, user growth charts
- **Content Moderation Tools** - AI-powered content scanning
- **Support Ticket System** - Handle user complaints
- **Audit Logs** - Track all admin actions
- **Bulk Operations** - Mass approve/reject providers
- **Custom Reports** - Generate platform reports
- **Mobile Admin App** - React Native admin interface

### **Advanced Security:**
- **Two-Factor Authentication** - Enhanced admin security
- **IP Whitelisting** - Restrict admin access by location
- **Session Management** - Better session handling
- **Role Hierarchy** - More granular role system

## 📱 Usage Examples

### **Verify a Provider:**
```javascript
// Approve provider
await fetch(`/api/admin/providers/${providerId}/verify`, {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ 
    status: 'approved' 
  })
});

// Reject provider
await fetch(`/api/admin/providers/${providerId}/verify`, {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ 
    status: 'rejected',
    reason: 'Incomplete documentation' 
  })
});
```

### **Suspend User:**
```javascript
await fetch(`/api/admin/users/${userId}/provider/toggle-status`, {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ 
    action: 'suspend',
    reason: 'Policy violation' 
  })
});
```

## 🎉 Success Metrics

The admin panel now provides:
- **Complete Provider Control** - Full verification workflow
- **User Management** - Comprehensive user oversight
- **Real-time Analytics** - Platform performance insights
- **Security Features** - Role-based access control
- **Scalable Architecture** - Easy to extend with new features

## 🔧 Development Notes

### **Database Changes:**
- Added `Admin` model with roles and permissions
- Enhanced `Provider` model with verification fields
- Added admin authentication middleware

### **Frontend Components:**
- `AdminLogin` - Secure admin authentication
- `AdminDashboard` - Main admin interface
- Admin-specific routing and navigation

### **Security Considerations:**
- Admin routes are protected with JWT authentication
- Role-based permissions for different admin levels
- Secure password hashing for admin accounts
- Input validation and sanitization

---

**Your CALEVENT platform now has a complete admin system for managing providers, users, and platform operations!** 🎊