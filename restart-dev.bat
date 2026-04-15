@echo off
echo ========================================
echo   FORCE RESTART DEV SERVER
echo ========================================
echo.

echo Killing all Node processes...
taskkill /F /IM node.exe /T 2>nul
timeout /t 2 /nobreak >nul

echo.
echo Clearing Vite cache...
if exist "node_modules\.vite" (
    rmdir /s /q "node_modules\.vite"
    echo Cache cleared!
)

echo.
echo Starting fresh dev server...
echo.
npm run dev
