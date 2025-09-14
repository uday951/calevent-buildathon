import express from 'express';
import {
  getAllProviders,
  getTopProviders,
  getProviderDashboardStats,
  getProviderEventsByCategory,
  searchProviderEvents,
  getProviderProfile,
  getMyProfile,
  updateProviderProfile,
  getFollowers,
  getMessages,
  replyToMessage,
  markMessageAsRead,
  getProviderReviews
} from '../controllers/providerController.js';
import { providerAuth, optionalAuth } from '../middleware/auth.js';
import { uploadFields } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', getAllProviders);
router.get('/top', getTopProviders);
router.get('/profile/:id', getProviderProfile);

// Provider authenticated routes
router.get('/dashboard/stats', providerAuth, getProviderDashboardStats);
router.get('/events/grouped-by-category', providerAuth, getProviderEventsByCategory);
router.get('/events/search', providerAuth, searchProviderEvents);

// Profile management
router.get('/profile', providerAuth, getMyProfile);
router.put('/profile', providerAuth, uploadFields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 }
]), updateProviderProfile);

// Followers, reviews and messages
router.get('/followers', providerAuth, getFollowers);
router.get('/reviews', providerAuth, getProviderReviews);
router.get('/messages', providerAuth, getMessages);
router.post('/messages/:messageId/reply', providerAuth, replyToMessage);
router.patch('/messages/:messageId/read', providerAuth, markMessageAsRead);

export default router;