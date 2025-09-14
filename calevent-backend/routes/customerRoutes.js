import express from 'express';
import {
  getCustomerProfile,
  updateCustomerProfile,
  getCustomerStats,
  followProvider,
  unfollowProvider,
  checkFollowStatus,
  getFollowedProviders,
  addReview,
  updateReview,
  deleteReview,
  getMyReviews,
  sendMessage,
  getConversations,
  getMessages,
  markAsRead,
  replyToMessage
} from '../controllers/customerController.js';
import { customerAuth } from '../middleware/auth.js';
import { uploadFields } from '../middleware/upload.js';

const router = express.Router();

// Customer authenticated routes
router.get('/profile', customerAuth, getCustomerProfile);
router.put('/profile', customerAuth, uploadFields([
  { name: 'profileImage', maxCount: 1 }
]), updateCustomerProfile);
router.get('/stats', customerAuth, getCustomerStats);

// Follow routes
router.post('/follow/:providerId', customerAuth, followProvider);
router.delete('/follow/:providerId', customerAuth, unfollowProvider);
router.get('/follow/status/:providerId', customerAuth, checkFollowStatus);
router.get('/following', customerAuth, getFollowedProviders);

// Review routes
router.post('/reviews/:providerId', customerAuth, addReview);
router.put('/reviews/:reviewId', customerAuth, updateReview);
router.delete('/reviews/:reviewId', customerAuth, deleteReview);
router.get('/reviews', customerAuth, getMyReviews);

// Message routes
router.post('/messages/:providerId', customerAuth, sendMessage);
router.get('/conversations', customerAuth, getConversations);
router.get('/messages/:conversationId', customerAuth, getMessages);
router.patch('/messages/:conversationId/read', customerAuth, markAsRead);
router.post('/messages/:conversationId/reply', customerAuth, replyToMessage);

export default router;