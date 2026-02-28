@echo off
echo Creating admin user for CALEVENT...
cd calevent-backend
node seed-admin.js
pause