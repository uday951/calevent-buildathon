@echo off
setlocal enabledelayedexpansion

echo ========================================
echo CALEVENT - Auto Build APK
echo ========================================
echo.

cd appversioncalevent

:: Read current version from app.json
for /f "tokens=2 delims=:, " %%a in ('findstr /C:"\"version\"" app.json') do (
    set VERSION=%%a
    set VERSION=!VERSION:"=!
)

:: Read current versionCode
for /f "tokens=2 delims=:, " %%a in ('findstr /C:"\"versionCode\"" app.json') do (
    set VERSIONCODE=%%a
)

echo Current Version: !VERSION!
echo Current Version Code: !VERSIONCODE!
echo.

:: Increment versionCode
set /a NEWVERSIONCODE=!VERSIONCODE!+1

echo New Version Code: !NEWVERSIONCODE!
echo.

:: Update app.json with new versionCode
powershell -Command "(Get-Content app.json) -replace '\"versionCode\": !VERSIONCODE!', '\"versionCode\": !NEWVERSIONCODE!' | Set-Content app.json"

echo ========================================
echo Updated app.json
echo ========================================
echo.

echo Starting build process...
echo This will take several minutes...
echo.

:: Build APK
call npx eas build --platform android --profile preview --local

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo BUILD SUCCESSFUL!
    echo ========================================
    echo.
    echo Version: !VERSION!
    echo Version Code: !NEWVERSIONCODE!
    echo.
    echo APK Location: appversioncalevent\dist-android\
    echo.
) else (
    echo.
    echo ========================================
    echo BUILD FAILED!
    echo ========================================
    echo.
    :: Revert versionCode on failure
    powershell -Command "(Get-Content app.json) -replace '\"versionCode\": !NEWVERSIONCODE!', '\"versionCode\": !VERSIONCODE!' | Set-Content app.json"
    echo Version code reverted to !VERSIONCODE!
)

pause
