import express from 'express';
import multer from 'multer';
import { 
  getEventSuggestions, 
  generateContent, 
  generateImage,
  editImage, 
  summarizeReviews, 
  analyzeImage,
  analyzeVisionDETR,
  batchAnalyzeReviews,
  compareImages,
  findProviders,
  sendImageRequest,
  getProviderRequests,
  respondToImageRequest,
  getCustomerRequests
} from '../controllers/aiController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for image uploads
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

// AI Event Assistant
router.post('/assistant', optionalAuth, getEventSuggestions);

// Content Generation
router.post('/generate-content', optionalAuth, generateContent);

// Image Generation
router.post('/generate-image', optionalAuth, generateImage);

// Image Editing
router.post('/edit-image', optionalAuth, editImage);

// Review Summarizer
router.get('/reviews/:providerId', summarizeReviews);

// Vision Analysis
router.post('/analyze-image', upload.single('image'), analyzeImage);

// AI Vision Analysis with DETR
router.post('/vision', upload.single('image'), analyzeVisionDETR);

// Batch Review Analysis
router.post('/batch-reviews', optionalAuth, batchAnalyzeReviews);

// Image Comparison
router.post('/compare-images', upload.array('images', 4), compareImages);

// Find Providers for Generated Image
router.post('/find-providers', optionalAuth, findProviders);

// Send Image Request to Provider
router.post('/send-request', optionalAuth, sendImageRequest);

// Provider Routes
router.get('/provider-requests', optionalAuth, getProviderRequests);
router.put('/respond-request/:requestId', optionalAuth, respondToImageRequest);

// Customer Routes
router.get('/customer-requests', optionalAuth, getCustomerRequests);

export default router;