@echo off
echo Starting CALEVENT Full Stack Application...
echo.

REM Check if backend dependencies are installed
if not exist "calevent-backend\node_modules" (
    echo Installing backend dependencies...
    cd calevent-backend
    npm install
    cd ..
    echo.
)

REM Check if frontend dependencies are installed
if not exist "node_modules" (
    echo Installing frontend dependencies...
    npm install
    echo.
)

REM Check if backend .env file exists
if not exist "calevent-backend\.env" (
    echo Warning: Backend .env file not found!
    echo Please create calevent-backend\.env file with required environment variables.
    echo See SETUP.md for details.
    echo.
    pause
    exit /b 1
)

echo Starting backend server...
start "CALEVENT Backend" cmd /k "cd calevent-backend && npm run dev"

echo Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo Starting frontend server...
start "CALEVENT Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo CALEVENT Full Stack Application Started
echo ========================================
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo Health:   http://localhost:5000/health
echo ========================================
echo.
echo Press any key to close this window...
pause > nul