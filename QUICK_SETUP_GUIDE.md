# 🚀 OpenAI Migration - Quick Setup Guide

## ✅ **COMPLETED STEPS:**

### 1. ✅ Dependencies Installed
```bash
✅ npm install openai@^4.28.0 - DONE
```

### 2. ✅ Environment Variables Added
```bash
✅ OPENAI_API_KEY added to .env - DONE
```

### 3. ✅ Files Migrated
```bash
✅ chatbotController.js → chatbotController-backup.js (backup created)
✅ chatbotController-openai.js → chatbotController.js (replaced)
✅ customBotRoutes.js → customBotRoutes-backup.js (backup created)  
✅ chatbotRoutes-openai.js → customBotRoutes.js (replaced)
```

## 📍 **CURRENT STATUS:**
- ✅ OpenAI package installed successfully
- ✅ API key configured (164 characters)
- ⚠️ **API quota exceeded** - Need to add billing to OpenAI account

## 🔧 **NEXT STEPS:**

### Option 1: Add OpenAI Billing (Recommended)
1. Go to https://platform.openai.com/billing
2. Add payment method
3. Set usage limits
4. Test with: `node test-openai.js`

### Option 2: Use Fallback Mode (Temporary)
The system will work with custom responses until billing is added.

## 🧪 **TEST YOUR SETUP:**

### Test 1: Environment Check
```bash
cd d:\vignan\calevent-backend
node test-openai.js
```

### Test 2: Start Server
```bash
npm start
```

### Test 3: Test Endpoints
```bash
# Health check
curl http://localhost:5000/health

# Chat endpoint (will use fallback responses)
curl -X POST http://localhost:5000/api/chatbot/chat \
  -H "Content-Type: application/json" \
  -d "{\"message\": \"hello\"}"
```

## 📂 **FILE LOCATIONS:**

### New OpenAI Files:
- `controllers/chatbotController.js` (OpenAI version)
- `routes/customBotRoutes.js` (OpenAI version)
- `test-openai.js` (API test script)

### Backup Files:
- `controllers/chatbotController-backup.js` (original Gemini)
- `routes/customBotRoutes-backup.js` (original routes)

### Configuration:
- `.env` (updated with OPENAI_API_KEY)
- `package.json` (updated with openai dependency)

## 🔄 **ROLLBACK (if needed):**
```bash
cd d:\vignan\calevent-backend\controllers
copy chatbotController-backup.js chatbotController.js

cd ..\routes  
copy customBotRoutes-backup.js customBotRoutes.js
```

## 🎯 **API ENDPOINTS READY:**

### Chat with GPT
```javascript
POST /api/chatbot/chat
{
  "message": "Help me plan a wedding",
  "context": {}
}
```

### Generate Images with DALL·E
```javascript
POST /api/chatbot/generate-image
{
  "prompt": "elegant wedding decoration",
  "size": "512x512",
  "response_format": "url"
}
```

### Analyze Images
```javascript
POST /api/chatbot/analyze-image
// multipart/form-data with image file
```

## 💡 **CURRENT BEHAVIOR:**
- ✅ Server starts successfully
- ✅ Custom responses work (greetings, services, etc.)
- ⚠️ OpenAI calls will fail gracefully until billing is added
- ✅ Fallback responses ensure chatbot still works

## 🔑 **API KEY STATUS:**
- Length: 164 characters ✅
- Format: Correct (sk-proj-...) ✅  
- Status: Valid but quota exceeded ⚠️
- Solution: Add billing at https://platform.openai.com/billing

## 📞 **SUPPORT:**
If you need help:
1. Check server logs: `npm start`
2. Test API: `node test-openai.js`
3. Verify endpoints work with fallback responses
4. Add OpenAI billing when ready for full functionality