import express from 'express';
import { handleChatMessage, testGeminiAPI, debugProviders, handleImageAnalysis } from '../controllers/chatbotController.js';
import multer from 'multer';

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed'), false);
    }
  }
});
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Chat endpoint (optional auth for personalized responses)
router.post('/chat', optionalAuth, handleChatMessage);

// Test Gemini API
router.get('/test-gemini', testGeminiAPI);

// Debug providers
router.get('/debug-providers', debugProviders);

// Image analysis for decoration matching
router.post('/analyze-image', upload.single('image'), handleImageAnalysis);



export default router;