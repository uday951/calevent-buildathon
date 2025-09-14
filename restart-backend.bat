@echo off
echo Restarting CALEVENT Backend Server...
cd calevent-backend
taskkill /f /im node.exe 2>nul
timeout /t 2 /nobreak >nul
npm run dev