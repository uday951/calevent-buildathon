import express from 'express';
import {
  adminLogin,
  getDashboardStats,
  getPendingProviders,
  verifyProvider,
  getAllUsers,
  toggleUserStatus,
  getAnalytics
} from '../controllers/adminController.js';
import { adminAuth } from '../middleware/adminAuth.js';

const router = express.Router();

// Auth routes
router.post('/login', adminLogin);

// Protected admin routes
router.use(adminAuth); // Apply admin authentication to all routes below

// Dashboard
router.get('/dashboard', getDashboardStats);
router.get('/analytics', getAnalytics);

// Provider management
router.get('/providers/pending', getPendingProviders);
router.patch('/providers/:providerId/verify', verifyProvider);

// User management
router.get('/users', getAllUsers);
router.patch('/users/:userId/:userType/toggle-status', toggleUserStatus);

export default router;