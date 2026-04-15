# 🚀 Quick Build Guide - CALEVENT v2.0.0

## Fastest Way to Build APK

### Option 1: One-Click Build (Windows)
```bash
# Just double-click this file:
build-apk.bat
```

### Option 2: Manual Build
```bash
# 1. Install dependencies
npm install

# 2. Login to Expo (first time only)
eas login

# 3. Build APK
eas build --platform android --profile preview
```

**Build time**: 10-15 minutes  
**Result**: Download link for APK

---

## What Changed in v2.0.0?

✅ Flash Offers page with all events  
✅ "Launching in Your City Soon" section  
✅ Fixed booking API issues  
✅ Better authentication flow  
✅ Enhanced splash screen  

See `CHANGELOG.md` for full details.

---

## Quick Commands

```bash
# Test on device (no build needed)
npm start

# Build APK for testing
eas build -p android --profile preview

# Build AAB for Play Store
eas build -p android --profile production

# Check build status
eas build:list
```

---

## Version Info

- **Version**: 2.0.0
- **Version Code**: 2
- **Package**: com.calevent.app
- **Min Android**: 5.0 (API 21)

---

## Need Help?

1. Check `BUILD_INSTRUCTIONS_V2.md` for detailed guide
2. Check `CHANGELOG.md` for what's new
3. Ensure backend is running at: https://calevent.onrender.com/api

---

## File Structure

```
appversioncalevent/
├── src/
│   ├── screens/
│   │   ├── FlashOffersScreen.js    ← NEW in v2
│   │   ├── HomeScreen.js           ← Updated
│   │   ├── BookEventScreen.js      ← Fixed
│   │   └── ...
│   ├── navigation/
│   │   └── AppNavigator.js         ← Updated
│   └── store/
│       └── useAuthStore.js         ← Fixed
├── app.json                        ← Version 2.0.0
├── package.json                    ← Version 2.0.0
├── eas.json                        ← Build config
├── build-apk.bat                   ← Quick build script
├── BUILD_INSTRUCTIONS_V2.md        ← Detailed guide
└── CHANGELOG.md                    ← What's new
```

---

**Ready to build?** Run `build-apk.bat` or `eas build -p android --profile preview`
