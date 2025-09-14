@echo off
echo 🔧 CALEVENT Image Service Fix
echo ============================
echo.

echo 1. Testing current image service...
cd calevent-backend
node test-image-service.js
echo.

echo 2. Stopping any existing image service...
taskkill /f /im python.exe 2>nul
echo.

echo 3. Starting lightweight image service...
cd ..\image-service
start "Image Service" cmd /k "start-simple.bat"
echo.

echo 4. Waiting for service to start...
timeout /t 5 /nobreak > nul
echo.

echo 5. Testing the new service...
cd ..\calevent-backend
node test-image-service.js
echo.

echo ✅ Image service fix complete!
echo.
echo If the service is working, your chatbot should now be able to generate images.
echo Test it by asking: "Design a corporate event stage"
echo.
pause