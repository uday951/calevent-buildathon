# CALEVENT Mobile App - Version 2.0.0 Build Instructions

## What's New in Version 2.0.0 🎉

### New Features:
- ⚡ **Flash Offers Page**: Dedicated beautiful page showing all events with discount badges and timers
- 🚀 **Launching in Your City Soon**: New section showing upcoming city launches with notify buttons
- 🔧 **Fixed Booking Flow**: Resolved API integration issues for seamless event booking
- 🎨 **Enhanced UI**: Improved splash screen with "Get Started" button
- 🔐 **Better Authentication**: Fixed auth state management and navigation

### Bug Fixes:
- Fixed empty API response handling in booking submission
- Fixed navigation errors after successful booking
- Fixed authentication state persistence
- Improved error handling across all screens

---

## Build Instructions

### Prerequisites:
1. Node.js installed
2. Expo CLI installed globally: `npm install -g expo-cli`
3. EAS CLI installed globally: `npm install -g eas-cli`
4. Expo account (free tier works)

### Step 1: Install Dependencies
```bash
cd appversioncalevent
npm install
```

### Step 2: Login to Expo
```bash
eas login
```

### Step 3: Build APK (Preview Build)
```bash
eas build --platform android --profile preview
```

This will:
- Upload your code to Expo servers
- Build the APK in the cloud
- Provide a download link when complete (usually 10-15 minutes)

### Step 4: Build Production AAB (For Play Store)
```bash
eas build --platform android --profile production
```

This creates an Android App Bundle (.aab) for Google Play Store submission.

---

## Alternative: Local Build (Faster)

If you have Android Studio installed:

### Step 1: Generate Android Project
```bash
npx expo prebuild --platform android
```

### Step 2: Build APK Locally
```bash
cd android
./gradlew assembleRelease
```

APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

---

## Quick Test Build

For testing on your device without building APK:

```bash
npm start
```

Then scan QR code with Expo Go app on your Android device.

---

## Version Information

- **App Name**: CALEVENT
- **Version**: 2.0.0
- **Version Code**: 2
- **Package**: com.calevent.app
- **Build Type**: APK (Preview) / AAB (Production)

---

## Download Links

After EAS build completes, you'll get a link like:
`https://expo.dev/artifacts/eas/[build-id].apk`

Share this link to install on Android devices.

---

## Notes

- APK size: ~50-60 MB
- Minimum Android version: 5.0 (API 21)
- Target Android version: 14 (API 34)
- Requires internet connection for API calls
- Backend URL: https://calevent.onrender.com/api

---

## Troubleshooting

**Build fails?**
- Run `eas build:configure` to reconfigure
- Check `eas.json` is present
- Ensure you're logged in: `eas whoami`

**App crashes on launch?**
- Check backend API is running
- Verify API URL in `src/services/api.js`
- Clear app data and reinstall

**Can't install APK?**
- Enable "Install from Unknown Sources" in Android settings
- Ensure APK is not corrupted (re-download if needed)
