# Admin Panel Testing Guide

## 🔧 Setup Complete

✅ All admin screens created
✅ Navigation configured
✅ @react-native-picker/picker installed

## 🚀 How to Test

### 1. Start the App
```bash
cd appversioncalevent
npm start
```

### 2. Login as Admin
- Use admin credentials
- Email: `admin@calevent.com`
- Password: `admin123`

### 3. Test Each Feature

#### Dashboard
- Should show 3 stat cards (bookings, providers, revenue)
- Should show 5 navigation cards
- Should show recent event requests
- Pull down to refresh

#### Providers Management
- Tap "Providers" card
- Filter by: Pending/Approved/Rejected/All
- Test approve/reject actions
- Test suspend action

#### Bookings Management
- Tap "Bookings" card
- Filter by status
- Test provider assignment
- Test status updates
- **Test Complete Event button** - Should show revenue confirmation

#### Users Management
- Tap "Users" card
- Toggle between Customers/Providers
- Test suspend/activate

#### Analytics
- Tap "Analytics" card
- Change time period (7/30/90 days)
- View charts and trends

#### Event Requests
- Tap "Event Requests" card
- Filter by status
- Test status workflow

## 🐛 Troubleshooting

### If Admin Panel Not Showing:

1. **Check User Role**
```javascript
// In useAuthStore, verify user.role === 'admin'
console.log('User:', user);
console.log('Role:', user?.role);
```

2. **Check Navigation**
```javascript
// In AppNavigator.js
console.log('isAuthenticated:', isAuthenticated);
console.log('user.role:', user?.role);
```

3. **Verify Admin Login**
- Make sure backend seed-admin.js was run
- Check admin exists in database
- Verify JWT token includes role

### If Screens Not Loading:

1. **Clear Cache**
```bash
cd appversioncalevent
npm start -- --clear
```

2. **Rebuild**
```bash
# For Android
npm run android

# For iOS
npm run ios
```

3. **Check Imports**
- All screen files exist in `src/screens/`
- All imports in AppNavigator.js are correct

### If Picker Not Working:

1. **Reinstall**
```bash
npm install @react-native-picker/picker
```

2. **For iOS**
```bash
cd ios
pod install
cd ..
```

3. **Restart Metro**
```bash
npm start -- --reset-cache
```

## 📱 Expected Behavior

### Admin Dashboard
- Shows overview stats
- 5 clickable cards
- Recent requests list
- Pull-to-refresh works

### Bookings Screen
- Shows all bookings
- Filter buttons work
- Assign provider modal opens
- Status updates work
- **Complete Event shows confirmation with revenue amount**
- **Completed events show green revenue card**
- **Tracking timeline shows progress**

### Complete Event Flow:
1. Booking in "In Progress" status
2. Click "✓ Complete Event" button
3. Alert shows: "Revenue: ₹XX,XXX will be added to income"
4. Click "Complete Event" in alert
5. Success alert: "Event completed! ₹XX,XXX added to revenue"
6. Booking card shows green "Revenue Added" section
7. Tracking timeline shows all steps completed

## 🔍 Debug Logs

Add these to check data flow:

```javascript
// In AdminBookingsScreen.js
console.log('Bookings loaded:', bookings.length);
console.log('First booking:', bookings[0]);

// In handleStatusUpdate
console.log('Updating status to:', newStatus);
console.log('Booking amount:', booking.pricing?.totalAmount);
```

## ✅ Verification Checklist

- [ ] Admin can login
- [ ] Dashboard loads with stats
- [ ] All 5 navigation cards work
- [ ] Providers screen loads
- [ ] Can approve/reject providers
- [ ] Bookings screen loads
- [ ] Can assign providers
- [ ] Can update booking status
- [ ] Complete Event shows revenue confirmation
- [ ] Completed bookings show revenue card
- [ ] Tracking timeline displays correctly
- [ ] Users screen loads
- [ ] Can suspend/activate users
- [ ] Analytics screen loads
- [ ] Charts display data
- [ ] Event requests screen loads
- [ ] Can update request status

## 📞 Common Issues

### "Cannot read property 'navigate' of undefined"
- Navigation prop not passed correctly
- Check screen is registered in Stack.Navigator

### "Picker is not exported from @react-native-picker/picker"
- Wrong import syntax
- Should be: `import { Picker } from '@react-native-picker/picker'`

### "AdminDashboardScreen is not defined"
- Check import path in AppNavigator.js
- Should be: `from '../screens/AdminDashboardScreenNew'`

### Revenue not updating
- Check backend `/admin/bookings/:id/status` endpoint
- Verify adminStatus is being updated to 'completed'
- Check analytics endpoint includes completed bookings

## 🎯 Next Steps

1. Test on physical device
2. Test all admin workflows
3. Verify revenue calculations
4. Test with real data
5. Check performance with many bookings

---

**Status**: Ready for Testing
**Last Updated**: 2025
