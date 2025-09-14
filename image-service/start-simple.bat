@echo off
echo 🚀 Starting Lightweight Image Generation Service...
echo.

REM Install basic requirements
echo 📦 Installing basic requirements...
pip install flask requests

REM Set environment variables
set PYTHON_SERVICE_PORT=5001

REM Start the lightweight service
echo 🌟 Starting service on port 5001...
python simple_service.py

pause