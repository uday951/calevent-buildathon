@echo off
echo ========================================
echo Restarting Backend with Revenue Fix
echo ========================================
echo.

cd calevent-backend

echo Stopping any running backend...
taskkill /F /IM node.exe 2>nul

echo.
echo Starting backend server...
echo.

start cmd /k "npm run dev"

echo.
echo ========================================
echo Backend restarted!
echo Revenue calculation fixed.
echo Expected Revenue: Rs 342,200
echo ========================================
echo.

pause
