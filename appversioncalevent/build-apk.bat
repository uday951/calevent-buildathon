@echo off
echo ========================================
echo CALEVENT Mobile App - Version 2.0.0
echo Building APK...
echo ========================================
echo.

cd /d "%~dp0"

echo Step 1: Checking dependencies...
call npm install
if errorlevel 1 (
    echo Error: npm install failed
    pause
    exit /b 1
)

echo.
echo Step 2: Building APK with EAS...
echo This will take 10-15 minutes...
echo.

call eas build --platform android --profile preview --non-interactive

if errorlevel 1 (
    echo.
    echo Build failed! Please check the error above.
    echo.
    echo Common fixes:
    echo 1. Run: eas login
    echo 2. Run: eas build:configure
    echo 3. Check your internet connection
    pause
    exit /b 1
)

echo.
echo ========================================
echo Build completed successfully!
echo Check the link above to download APK
echo ========================================
pause
