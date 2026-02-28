@echo off
echo Installing AI Dependencies for CALEVENT...
echo.

cd calevent-backend
echo Installing backend AI dependencies...
npm install openai node-fetch

cd ..
echo Installing frontend dependencies...
npm install framer-motion lucide-react

echo.
echo ✅ AI Dependencies installed successfully!
echo.
echo Next steps:
echo 1. Update your .env file with API keys
echo 2. Add AI Dashboard route to your React app
echo 3. Test the AI features
echo.
pause