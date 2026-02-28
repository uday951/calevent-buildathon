@echo off
echo Testing CALEVENT Hugging Face Integration...
echo.

echo 1. Testing AI Assistant with Mistral-7B fallback...
curl -X POST http://localhost:5000/api/ai/assistant -H "Content-Type: application/json" -d "{\"budget\": 75000, \"theme\": \"Elegant\", \"eventType\": \"wedding\", \"guestCount\": 100, \"location\": \"Bangalore\"}"
echo.
echo.

echo 2. Testing Content Generation...
curl -X POST http://localhost:5000/api/ai/generate-content -H "Content-Type: application/json" -d "{\"type\": \"invitation\", \"eventDetails\": {\"eventType\": \"birthday\", \"theme\": \"Modern\", \"date\": \"2024-07-20\", \"venue\": \"City Hall\", \"hostName\": \"Sarah\"}, \"style\": \"modern\"}"
echo.
echo.

echo 3. Testing Image Generation with Stable Diffusion 2.1...
curl -X POST http://localhost:5000/api/ai/generate-image -H "Content-Type: application/json" -d "{\"type\": \"decoration\", \"prompt\": \"elegant wedding decoration with white flowers\", \"eventDetails\": {\"eventType\": \"wedding\", \"theme\": \"elegant\"}}"
echo.
echo.

echo ✅ Hugging Face Integration Test Complete!
echo.
echo Models being used:
echo - Text: mistralai/Mistral-7B-Instruct-v0.1
echo - Summarization: facebook/bart-large-cnn  
echo - Images: stabilityai/stable-diffusion-2-1
echo - Image Edit: timbrooks/instruct-pix2pix
echo.
pause