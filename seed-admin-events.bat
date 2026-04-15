@echo off
echo ========================================
echo   CALEVENT - Seed Admin Events
echo ========================================
echo.

cd calevent-backend
node seed-admin-events.js

echo.
echo ========================================
echo   Seeding Complete!
echo ========================================
pause
