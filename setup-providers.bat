@echo off
echo Setting up sample providers...
echo =============================

cd calevent-backend
node seed-providers.js

echo.
echo Sample providers added! Now test the connect functionality.
pause