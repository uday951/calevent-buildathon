@echo off
setlocal enabledelayedexpansion

echo ========================================
echo CALEVENT - Version Manager
echo ========================================
echo.

cd appversioncalevent

:: Read current version
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

echo Select version bump type:
echo 1. Patch (2.0.0 -^> 2.0.1) - Bug fixes
echo 2. Minor (2.0.0 -^> 2.1.0) - New features
echo 3. Major (2.0.0 -^> 3.0.0) - Breaking changes
echo 4. Custom version
echo 5. Only increment versionCode
echo.

set /p CHOICE="Enter choice (1-5): "

if "%CHOICE%"=="1" (
    :: Patch version
    for /f "tokens=1,2,3 delims=." %%a in ("!VERSION!") do (
        set MAJOR=%%a
        set MINOR=%%b
        set /a PATCH=%%c+1
    )
    set NEWVERSION=!MAJOR!.!MINOR!.!PATCH!
) else if "%CHOICE%"=="2" (
    :: Minor version
    for /f "tokens=1,2,3 delims=." %%a in ("!VERSION!") do (
        set MAJOR=%%a
        set /a MINOR=%%b+1
        set PATCH=0
    )
    set NEWVERSION=!MAJOR!.!MINOR!.!PATCH!
) else if "%CHOICE%"=="3" (
    :: Major version
    for /f "tokens=1,2,3 delims=." %%a in ("!VERSION!") do (
        set /a MAJOR=%%a+1
        set MINOR=0
        set PATCH=0
    )
    set NEWVERSION=!MAJOR!.!MINOR!.!PATCH!
) else if "%CHOICE%"=="4" (
    :: Custom version
    set /p NEWVERSION="Enter new version (e.g., 2.1.0): "
) else if "%CHOICE%"=="5" (
    :: Only versionCode
    set NEWVERSION=!VERSION!
) else (
    echo Invalid choice!
    pause
    exit /b
)

:: Increment versionCode
set /a NEWVERSIONCODE=!VERSIONCODE!+1

echo.
echo ========================================
echo New Version: !NEWVERSION!
echo New Version Code: !NEWVERSIONCODE!
echo ========================================
echo.

set /p CONFIRM="Confirm update? (Y/N): "
if /i not "%CONFIRM%"=="Y" (
    echo Update cancelled.
    pause
    exit /b
)

:: Update app.json
powershell -Command "$json = Get-Content app.json | ConvertFrom-Json; $json.expo.version = '!NEWVERSION!'; $json.expo.android.versionCode = !NEWVERSIONCODE!; $json | ConvertTo-Json -Depth 10 | Set-Content app.json"

echo.
echo ========================================
echo app.json updated successfully!
echo ========================================
echo.

set /p BUILD="Build APK now? (Y/N): "
if /i "%BUILD%"=="Y" (
    echo.
    echo Starting build...
    call npx eas build --platform android --profile preview --local
)

pause
