@echo off
echo Starting CALEVENT Backend Development Server...
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    echo.
)

REM Check if .env file exists
if not exist ".env" (
    echo Warning: .env file not found!
    echo Please create .env file with required environment variables.
    echo See README.md for details.
    echo.
    pause
    exit /b 1
)

echo Starting server in development mode...
echo Server will be available at: http://localhost:5000
echo Health check: http://localhost:5000/health
echo API Documentation: http://localhost:5000/
echo.
echo Press Ctrl+C to stop the server
echo.

npm run dev