@echo off
echo 🚀 Starting CALEVENT with Image Generation Service
echo ================================================
echo.

REM Start the Python image service in a new window
echo 📸 Starting Image Generation Service...
start "Image Service" cmd /k "cd image-service && start-simple.bat"

REM Wait a moment for the service to start
echo ⏳ Waiting for image service to initialize...
timeout /t 5 /nobreak > nul

REM Start the main backend
echo 🖥️ Starting CALEVENT Backend...
cd calevent-backend
start "CALEVENT Backend" cmd /k "npm run dev"

REM Wait a moment
timeout /t 3 /nobreak > nul

REM Start the frontend
echo 🌐 Starting CALEVENT Frontend...
cd ..
start "CALEVENT Frontend" cmd /k "npm run dev"

echo.
echo ✅ All services are starting up!
echo.
echo 📸 Image Service: http://localhost:5001
echo 🖥️ Backend API: http://localhost:5000  
echo 🌐 Frontend: http://localhost:5173
echo.
echo Press any key to close this window...
pause > nul