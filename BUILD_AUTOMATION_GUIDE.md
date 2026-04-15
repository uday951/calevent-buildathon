# 🚀 APK Build Automation Guide

## 📦 Automated Build Scripts

I've created 3 scripts to automate your APK building process:

### 1. **quick-build.bat** ⚡ (RECOMMENDED)
**Fastest way to build a new version**

```bash
quick-build.bat
```

**What it does:**
- Auto-increments versionCode (2 → 3 → 4...)
- Keeps version number same (2.0.0)
- Builds APK immediately
- No manual editing needed!

**Use when:**
- Quick bug fixes
- Testing changes
- Daily builds

---

### 2. **version-bump.bat** 🎯 (For Releases)
**Full version control with options**

```bash
version-bump.bat
```

**What it does:**
- Interactive menu to choose version type
- Options:
  1. Patch (2.0.0 → 2.0.1) - Bug fixes
  2. Minor (2.0.0 → 2.1.0) - New features
  3. Major (2.0.0 → 3.0.0) - Breaking changes
  4. Custom version
  5. Only increment versionCode
- Auto-increments versionCode
- Optional: Build APK after update

**Use when:**
- Major releases
- Feature updates
- Version milestones

---

### 3. **build-apk-auto.bat** 🔄 (Legacy)
**Simple auto-increment build**

```bash
build-apk-auto.bat
```

**What it does:**
- Auto-increments versionCode
- Builds APK
- Reverts on failure

---

## 🎯 Quick Start

### For Daily Builds:
```bash
# Just run this every time you want a new APK
quick-build.bat
```

### For Version Updates:
```bash
# When releasing new features
version-bump.bat
# Choose option 2 (Minor)
# Confirm and build
```

---

## 📋 Version Numbering Guide

### Version Format: `MAJOR.MINOR.PATCH`

**Example: 2.0.0**
- **MAJOR (2)** - Breaking changes, major redesign
- **MINOR (0)** - New features, admin panel added
- **PATCH (0)** - Bug fixes, small improvements

### When to Increment:

#### Patch (2.0.0 → 2.0.1)
- Bug fixes
- UI tweaks
- Performance improvements
- No new features

#### Minor (2.0.0 → 2.1.0)
- New features added
- Admin panel implemented
- New screens
- Backward compatible

#### Major (2.0.0 → 3.0.0)
- Complete redesign
- Breaking changes
- API changes
- Major architecture update

---

## 🔢 Version Code vs Version

### Version (User sees)
- `2.0.0` - Displayed in app stores
- Semantic versioning
- Marketing version

### Version Code (System uses)
- `2, 3, 4, 5...` - Internal build number
- Must always increase
- Used by Play Store to identify builds

**Important:** Version code MUST increase with every build, even if version stays same!

---

## 📱 Current Version Info

```json
{
  "version": "2.0.0",
  "versionCode": 2
}
```

### Next Builds:
- Build 1: version 2.0.0, versionCode 3
- Build 2: version 2.0.0, versionCode 4
- Build 3: version 2.0.1, versionCode 5
- Build 4: version 2.1.0, versionCode 6

---

## 🛠️ Manual Version Update (If Needed)

Edit `appversioncalevent/app.json`:

```json
{
  "expo": {
    "version": "2.0.0",        // Change this for new version
    "android": {
      "versionCode": 2         // Increment this for every build
    }
  }
}
```

---

## 📦 Build Output

APK will be saved to:
```
appversioncalevent/dist-android/
```

File name format:
```
build-[timestamp]-[versionCode].apk
```

---

## 🔄 Typical Workflow

### Daily Development:
```bash
# Make code changes
# Test in app

# Build new APK
quick-build.bat

# Install and test
# Repeat
```

### Feature Release:
```bash
# Complete feature development
# Test thoroughly

# Update version
version-bump.bat
# Choose: 2 (Minor)
# New version: 2.1.0
# Build: Yes

# Release to testers/store
```

### Bug Fix Release:
```bash
# Fix bugs
# Test fixes

# Update version
version-bump.bat
# Choose: 1 (Patch)
# New version: 2.0.1
# Build: Yes

# Release hotfix
```

---

## 🎯 Recommended Versioning Strategy

### For Your Admin Panel Update:
```
Current: 2.0.0
Next:    2.1.0 (Minor - New admin features)
```

### For Future Updates:
```
2.1.0 → 2.1.1 (Bug fixes)
2.1.1 → 2.2.0 (New customer features)
2.2.0 → 2.2.1 (Bug fixes)
2.2.1 → 3.0.0 (Major redesign)
```

---

## ⚡ Quick Commands

### Build with auto-increment:
```bash
quick-build.bat
```

### Update to 2.1.0 and build:
```bash
version-bump.bat
# Choose: 2 (Minor)
# Confirm: Y
# Build: Y
```

### Just increment versionCode:
```bash
version-bump.bat
# Choose: 5 (Only versionCode)
```

---

## 🐛 Troubleshooting

### Build fails after version update:
- Check app.json syntax
- Ensure versionCode is a number (not string)
- Run: `npm install` in appversioncalevent

### Version not updating in app:
- Uninstall old APK
- Install new APK
- Check version in app settings

### versionCode conflict:
- Always increment versionCode
- Never decrease versionCode
- Each build must have unique versionCode

---

## 📊 Version History Tracking

Create a `CHANGELOG.md`:

```markdown
# Changelog

## [2.1.0] - 2026-04-05
### Added
- Complete admin panel with all features
- Booking tracking system
- Revenue management
- Provider verification
- User management
- Analytics dashboard

### Fixed
- Revenue calculation using completedAt
- Dashboard auto-refresh

## [2.0.0] - 2026-04-01
### Added
- Initial release
- Customer booking system
- Event browsing
```

---

## 🎉 Summary

**For every new build, just run:**
```bash
quick-build.bat
```

**That's it!** No manual version editing needed. The script handles everything automatically! 🚀

---

**Scripts Created:**
- ✅ quick-build.bat (Recommended)
- ✅ version-bump.bat (For releases)
- ✅ build-apk-auto.bat (Alternative)

**Location:** `d:\main_projects\calevent\`
