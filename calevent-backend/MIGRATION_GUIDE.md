# OpenAI Migration Guide

## Overview
This guide helps you migrate from Gemini + Hugging Face to OpenAI APIs (GPT + DALL·E).

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
npm install openai@^4.28.0
```

### 2. Environment Variables
Add to your `.env` file:
```env
OPENAI_API_KEY=sk-proj-your-openai-api-key-here
```

### 3. Update Routes
Replace your existing chatbot routes with:
```javascript
// In your main app.js or server.js
import chatbotRoutes from './routes/chatbotRoutes-openai.js';
app.use('/api/chatbot', chatbotRoutes);
```

## 📋 API Endpoints

### Chat Endpoint
```
POST /api/chatbot/chat
Content-Type: application/json

{
  "message": "Hello, help me plan a wedding",
  "context": {}
}
```

### Image Generation Endpoint
```
POST /api/chatbot/generate-image
Content-Type: application/json

{
  "prompt": "elegant wedding decoration with red roses and golden lighting",
  "size": "512x512",
  "n": 1,
  "response_format": "url"
}
```

### Image Analysis Endpoint
```
POST /api/chatbot/analyze-image
Content-Type: multipart/form-data

image: [file upload]
```

## 🔧 Configuration Options

### GPT Models
- **gpt-4o**: Best performance, higher cost
- **gpt-4**: Good performance, moderate cost
- **gpt-3.5-turbo**: Fast, lower cost

### DALL·E Options
- **Model**: dall-e-3 (recommended) or dall-e-2
- **Sizes**: 256x256, 512x512, 1024x1024
- **Quality**: standard or hd
- **Response Format**: url or b64_json

## 💰 Cost Optimization

### 1. Model Selection
```javascript
// Use GPT-3.5-turbo for simple queries
const model = message.length < 50 ? "gpt-3.5-turbo" : "gpt-4o";
```

### 2. Token Limits
```javascript
max_tokens: 200, // Limit response length
temperature: 0.7, // Balance creativity vs consistency
```

### 3. Caching Strategy
```javascript
// Cache common responses
const cache = new Map();
const cacheKey = message.toLowerCase().trim();
if (cache.has(cacheKey)) {
  return cache.get(cacheKey);
}
```

## 🔒 Security Best Practices

### 1. Environment Variables
```bash
# Never commit API keys to version control
echo "OPENAI_API_KEY=*" >> .gitignore
```

### 2. Rate Limiting
```javascript
import rateLimit from 'express-rate-limit';

const chatLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

router.post('/chat', chatLimit, handleChatMessage);
```

### 3. Input Validation
```javascript
// Validate and sanitize inputs
if (!message || typeof message !== 'string' || message.length > 1000) {
  return res.status(400).json({ error: 'Invalid message' });
}
```

## 🔄 Migration Steps

### Step 1: Backup Current Implementation
```bash
cp controllers/chatbotController.js controllers/chatbotController-backup.js
```

### Step 2: Install OpenAI
```bash
npm install openai@^4.28.0
```

### Step 3: Update Environment
```bash
# Add to .env
OPENAI_API_KEY=your-key-here
```

### Step 4: Replace Controller
```bash
# Use the new OpenAI controller
cp controllers/chatbotController-openai.js controllers/chatbotController.js
```

### Step 5: Update Routes
```bash
# Use the new OpenAI routes
cp routes/chatbotRoutes-openai.js routes/chatbotRoutes.js
```

### Step 6: Test Integration
```bash
# Test the API
curl -X POST http://localhost:5000/api/chatbot/test-openai
```

## 📊 Comparison: Old vs New

| Feature | Gemini + HF | OpenAI | Improvement |
|---------|-------------|---------|-------------|
| **Text Generation** | Gemini 1.5 | GPT-4o | Better reasoning, more reliable |
| **Image Generation** | Stable Diffusion | DALL·E 3 | Higher quality, better prompt following |
| **Image Analysis** | Gemini Vision | GPT-4o Vision | More accurate analysis |
| **API Reliability** | 503 errors common | 99.9% uptime | Much more stable |
| **Response Speed** | 2-5 seconds | 1-3 seconds | Faster responses |
| **Cost** | Free tier limited | Pay-per-use | Predictable pricing |
| **Rate Limits** | Strict quotas | Generous limits | Better scalability |
| **Error Handling** | Complex retry logic | Simple error codes | Easier debugging |

## 🎯 Key Improvements

### 1. Better Reliability
- No more 503 "model overloaded" errors
- Consistent API availability
- Simpler error handling

### 2. Higher Quality Output
- GPT-4o provides more accurate and contextual responses
- DALL·E 3 generates higher quality images with better prompt adherence
- GPT-4o Vision offers superior image analysis

### 3. Simplified Code
- Removed complex retry logic with exponential backoff
- No need for model fallback chains
- Cleaner error handling

### 4. Better Performance
- Faster response times
- More predictable latency
- Better concurrent request handling

## 🚨 Breaking Changes

### 1. API Response Format
```javascript
// Old Gemini format
response.data.candidates[0].content.parts[0].text

// New OpenAI format
response.choices[0].message.content
```

### 2. Image Generation
```javascript
// Old Hugging Face format
{
  "response_format": "b64_json",
  "model": "stabilityai/stable-diffusion-xl-base-1.0"
}

// New DALL·E format
{
  "model": "dall-e-3",
  "response_format": "b64_json"
}
```

### 3. Error Codes
```javascript
// Old error handling
if (status === 503 || status === 429) { /* retry logic */ }

// New error handling
if (error.code === 'rate_limit_exceeded') { /* handle rate limit */ }
```

## 🔧 Troubleshooting

### Common Issues

1. **API Key Invalid**
   ```bash
   Error: 401 Unauthorized
   Solution: Check OPENAI_API_KEY in .env file
   ```

2. **Rate Limit Exceeded**
   ```bash
   Error: 429 Too Many Requests
   Solution: Implement exponential backoff or upgrade plan
   ```

3. **Content Policy Violation**
   ```bash
   Error: content_policy_violation
   Solution: Modify prompt to comply with OpenAI usage policies
   ```

### Testing Commands
```bash
# Test chat endpoint
curl -X POST http://localhost:5000/api/chatbot/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'

# Test image generation
curl -X POST http://localhost:5000/api/chatbot/generate-image \
  -H "Content-Type: application/json" \
  -d '{"prompt": "wedding decoration", "size": "512x512"}'

# Test API connection
curl http://localhost:5000/api/chatbot/test-openai
```

## 📈 Monitoring & Analytics

### 1. Usage Tracking
```javascript
// Track API usage
const usage = {
  totalRequests: 0,
  totalTokens: 0,
  totalCost: 0
};

// Log after each request
console.log(`Tokens used: ${response.usage.total_tokens}`);
```

### 2. Performance Monitoring
```javascript
// Monitor response times
const startTime = Date.now();
const response = await openai.chat.completions.create(params);
const responseTime = Date.now() - startTime;
console.log(`Response time: ${responseTime}ms`);
```

## 🎉 Next Steps

1. **Deploy the new implementation**
2. **Monitor performance and costs**
3. **Optimize prompts for better results**
4. **Implement advanced features like function calling**
5. **Add conversation memory for better context**

## 📞 Support

If you encounter issues during migration:
1. Check the troubleshooting section above
2. Review OpenAI documentation: https://platform.openai.com/docs
3. Test with the provided curl commands
4. Verify environment variables are set correctly