@echo off
echo ========================================
echo CALEVENT Admin Panel - Quick Start
echo ========================================
echo.

echo [1/3] Checking dependencies...
cd appversioncalevent
call npm list @react-native-picker/picker >nul 2>&1
if errorlevel 1 (
    echo Installing @react-native-picker/picker...
    call npm install @react-native-picker/picker
) else (
    echo ✓ Picker dependency installed
)

echo.
echo [2/3] Starting Metro bundler...
echo.
echo ========================================
echo Admin Login Credentials:
echo Email: admin@calevent.com
echo Password: admin123
echo ========================================
echo.
echo [3/3] Starting app...
echo.

call npm start

pause
