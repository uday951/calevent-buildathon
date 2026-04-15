@echo off
echo ========================================
echo   CLEARING CACHE AND RESTARTING
echo ========================================
echo.

echo Stopping any running dev servers...
taskkill /F /IM node.exe 2>nul

echo.
echo Clearing Vite cache...
if exist "node_modules\.vite" (
    rmdir /s /q "node_modules\.vite"
    echo Vite cache cleared!
) else (
    echo No Vite cache found.
)

echo.
echo Clearing browser cache instructions:
echo 1. Press Ctrl+Shift+Delete in your browser
echo 2. Select "Cached images and files"
echo 3. Click "Clear data"
echo.
echo OR simply press Ctrl+F5 to hard refresh
echo.

echo Starting dev server...
npm run dev

pause
