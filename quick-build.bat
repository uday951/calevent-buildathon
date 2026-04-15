@echo off
echo ========================================
echo CALEVENT - Quick Build
echo ========================================
echo.

cd appversioncalevent

:: Auto-increment versionCode
node -e "const fs=require('fs');const app=JSON.parse(fs.readFileSync('app.json'));app.expo.android.versionCode++;console.log('Version:',app.expo.version);console.log('Build:',app.expo.android.versionCode);fs.writeFileSync('app.json',JSON.stringify(app,null,2));"

echo.
echo Building APK...
echo.

call npx eas build --platform android --profile preview --local

echo.
echo ========================================
echo Build Complete!
echo APK: appversioncalevent\dist-android\
echo ========================================
pause
