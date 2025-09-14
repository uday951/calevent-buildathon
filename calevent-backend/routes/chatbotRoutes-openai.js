import express from 'express';
import multer from 'multer';
import { 
  handleChatMessage, 
  generateImage, 
  handleImageAnalysis, 
  testOpenAIAPI 
} from '../controllers/chatbotController-openai.js';

const router = express.Router();

// Configure multer for image uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Chat endpoint - handles text/chat queries with GPT-4o
router.post('/chat', handleChatMessage);

// Image generation endpoint - uses DALL·E
router.post('/generate-image', generateImage);

// Image analysis endpoint - uses OpenAI Vision
router.post('/analyze-image', upload.single('image'), handleImageAnalysis);

// Test OpenAI API connection
router.get('/test-openai', testOpenAIAPI);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'OpenAI Chatbot API is running',
    timestamp: new Date().toISOString()
  });
});

export default router;