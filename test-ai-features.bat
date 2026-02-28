@echo off
echo Testing CALEVENT AI Features...
echo.

echo 1. Testing AI Assistant...
curl -X POST http://localhost:5000/api/ai/assistant -H "Content-Type: application/json" -d "{\"budget\": 50000, \"theme\": \"Modern\", \"eventType\": \"birthday\", \"guestCount\": 50, \"location\": \"Delhi\"}"
echo.
echo.

echo 2. Testing Content Generation...
curl -X POST http://localhost:5000/api/ai/generate-content -H "Content-Type: application/json" -d "{\"type\": \"invitation\", \"eventDetails\": {\"eventType\": \"wedding\", \"theme\": \"Royal\", \"date\": \"2024-06-15\", \"venue\": \"Grand Palace\", \"hostName\": \"John & Jane\"}, \"style\": \"elegant\"}"
echo.
echo.

echo 3. Testing Health Check...
curl http://localhost:5000/health
echo.
echo.

echo ✅ AI Features Test Complete!
echo.
echo Next steps:
echo 1. Open http://localhost:5173/ai-dashboard in your browser
echo 2. Test the AI Assistant interface
echo 3. Try generating content and images
echo.
pause