# CALEVENT Mobile App - Changelog

## Version 2.0.0 (April 2025)

### 🎉 New Features

#### ⚡ Flash Offers Page
- Dedicated beautiful page showcasing all available events with special offers
- Dynamic discount badges (55% OFF, 40% OFF, etc.)
- Countdown timers showing time remaining for each offer
- Tags: MEGA, HOT, NEW, SALE, DEAL, FLASH
- Gradient backgrounds with event images
- Original vs discounted pricing display
- Direct "Book Now" buttons for quick booking

#### 🚀 Launching in Your City Soon
- Replaced "Upcoming in Your City" with launch announcement section
- Shows 6 major cities: Mumbai, Delhi, Bangalore, Hyderabad, Chennai, Pune
- Expected launch quarters (Q2/Q3/Q4 2026)
- "Notify Me" buttons for each city
- Beautiful card design with city images and icons

#### 🎨 Enhanced Splash Screen
- Removed auto-navigation that caused crashes
- Added "Get Started" button for better UX
- Smooth animations maintained
- Proper navigation flow to login

### 🔧 Bug Fixes

#### Booking System
- Fixed empty API response handling in event booking
- Resolved 200 status with no response body issue
- Switched from fetch to axios for better error handling
- Proper JSON parsing and error messages
- Success alerts now show correctly

#### Navigation
- Fixed "REPLACE action not handled" error after booking
- Simplified navigation flow using goBack()
- Proper screen stack management
- No more navigation crashes

#### Authentication
- Fixed auth state not persisting properly
- Improved initAuth function error handling
- Better loading state management
- Proper isLoading flag in all code paths

#### API Integration
- Centralized API base URL usage
- Fixed hardcoded wrong API URLs
- Proper axios interceptors for auth tokens
- Better error response handling

### 🎨 UI/UX Improvements
- More consistent color scheme across app
- Better loading states and error messages
- Improved card designs and shadows
- Enhanced typography and spacing
- Smoother animations and transitions

### 🔐 Security
- Better token management
- Secure AsyncStorage usage
- Proper auth state validation

### 📱 Performance
- Optimized image loading
- Better API response caching
- Reduced unnecessary re-renders
- Faster navigation transitions

---

## Version 1.0.0 (March 2025)

### Initial Release
- Customer authentication (login/register)
- Event browsing and discovery
- Category-based filtering
- Event detail pages
- Booking request system
- User profile management
- My Requests tracking
- Plan My Event feature
- Beautiful home screen with multiple sections
- Flash offers carousel
- Top rated vendors
- Trending events
- Discover more grid layout

---

## Upcoming Features (Version 2.1.0)

- 🔔 Push notifications for booking updates
- 💬 In-app chat with event providers
- 📸 Photo gallery for events
- ⭐ Review and rating system
- 🎫 Digital tickets and QR codes
- 📍 Location-based event recommendations
- 🔍 Advanced search filters
- 💳 Multiple payment options
- 📊 Booking history analytics
- 🎁 Referral rewards program
