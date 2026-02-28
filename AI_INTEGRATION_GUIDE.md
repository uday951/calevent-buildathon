# CALEVENT AI Integration Guide

## 🚀 Features Added

### 1. AI Event Assistant
- **Endpoint**: `POST /api/ai/assistant`
- **Features**: Budget-based vendor recommendations, decoration ideas, sample schedules
- **Fallback**: OpenAI → Hugging Face

### 2. Content Generation
- **Endpoint**: `POST /api/ai/generate-content`
- **Features**: Invitation text, brochure content
- **Fallback**: OpenAI → Hugging Face text models

### 3. Image Generation
- **Endpoint**: `POST /api/ai/generate-image`
- **Features**: Event themes, invitation designs
- **Fallback**: DALL·E → Stable Diffusion

### 4. Review Summarizer
- **Endpoint**: `GET /api/ai/reviews/:providerId`
- **Features**: AI-powered pros/cons analysis
- **Fallback**: OpenAI → BART/T5 models

### 5. Vision Analysis
- **Endpoint**: `POST /api/ai/analyze-image`
- **Features**: Venue/decoration optimization suggestions
- **Fallback**: OpenAI Vision → HF image models

## 🛠️ Setup Instructions

### 1. Install Dependencies
```bash
# Run the installation script
install-ai-dependencies.bat

# Or manually:
cd calevent-backend
npm install openai node-fetch

cd ../
npm install framer-motion lucide-react
```

### 2. Environment Configuration
Update your `.env` file:
```env
# AI Services
OPENAI_API_KEY=sk-your-openai-key
HF_TOKEN=hf_your-hugging-face-token

# Optional settings
AI_TIMEOUT=30000
AI_MAX_RETRIES=3
AI_FALLBACK_ENABLED=true
```

### 3. Add Route to React App
In your main App.jsx or router configuration:
```jsx
import AIDashboardPage from './pages/AIDashboardPage';

// Add to your routes
<Route path="/ai-dashboard" element={<AIDashboardPage />} />
```

### 4. Add Navigation Link
```jsx
<Link to="/ai-dashboard" className="nav-link">
  🤖 AI Assistant
</Link>
```

## 🔧 API Usage Examples

### Event Assistant
```javascript
const response = await fetch('/api/ai/assistant', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    budget: 100000,
    theme: 'Royal',
    eventType: 'wedding',
    guestCount: 150,
    location: 'Mumbai'
  })
});
```

### Generate Content
```javascript
const response = await fetch('/api/ai/generate-content', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'invitation',
    eventDetails: {
      eventType: 'wedding',
      theme: 'Royal',
      date: '2024-06-15',
      venue: 'Grand Palace Hotel'
    },
    style: 'elegant'
  })
});
```

### Generate Images
```javascript
const response = await fetch('/api/ai/generate-image', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'decoration',
    prompt: 'Royal wedding stage with gold and red decorations',
    eventDetails: {
      eventType: 'wedding',
      theme: 'Royal'
    }
  })
});
```

## 🎯 Fallback Logic

The `callAIService()` function automatically handles:
1. **Primary**: Try OpenAI API first
2. **Fallback**: Switch to Hugging Face on failure
3. **Error Handling**: Graceful degradation with user feedback

## 🔍 Testing

### 1. Test AI Assistant
- Navigate to `/ai-dashboard`
- Fill out event planning form
- Verify AI suggestions appear

### 2. Test Image Generation
- Use the Images tab
- Enter decoration prompt
- Check generated image displays

### 3. Test Fallback
- Temporarily disable OpenAI key
- Verify Hugging Face fallback works

## 📊 Monitoring

Check console logs for:
- `🤖 AI Service: [type] request`
- `✅ OpenAI success` / `❌ OpenAI failed`
- `🔄 Falling back to Hugging Face...`
- `✅ Hugging Face success`

## 🚀 Deployment Notes

### Environment Variables
Ensure all AI service keys are set in production:
- `OPENAI_API_KEY`
- `HF_TOKEN`
- `AI_FALLBACK_ENABLED=true`

### Rate Limits
- OpenAI: Monitor usage dashboard
- Hugging Face: Free tier has limits
- Consider implementing request queuing for high traffic

## 🎉 Success Metrics

Your CALEVENT platform now has:
- ✅ AI-powered event planning assistance
- ✅ Automated content generation
- ✅ Creative image generation
- ✅ Smart review analysis
- ✅ Vision-based optimization
- ✅ Robust fallback system
- ✅ User-friendly AI dashboard

Perfect for Generative AI hackathons! 🏆