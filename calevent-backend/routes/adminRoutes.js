import express from 'express';
import {
  adminLogin,
  getDashboardStats,
  getPendingProviders,
  getAllProviders,
  verifyProvider,
  getAllBookings,
  getBookingById,
  assignProvider,
  updateBookingAdminStatus,
  getAllUsers,
  toggleUserStatus,
  getAnalytics,
  createAdminEvent,
  updateAdminEvent,
  deleteAdminEvent,
  getAllAdminEvents
} from '../controllers/adminController.js';
import { adminAuth } from '../middleware/adminAuth.js';
import { uploadSingle } from '../middleware/upload.js';

const router = express.Router();

// Public
router.post('/login', adminLogin);

// All routes below require admin token
router.use(adminAuth);

// Dashboard & analytics
router.get('/dashboard', getDashboardStats);
router.get('/analytics', getAnalytics);

// Provider management
router.get('/providers', getAllProviders);
router.get('/providers/pending', getPendingProviders);
router.patch('/providers/:providerId/verify', verifyProvider);

// Booking management (core admin workflow)
router.get('/bookings', getAllBookings);
router.get('/bookings/:bookingId', getBookingById);
router.patch('/bookings/:bookingId/assign-provider', assignProvider);
router.patch('/bookings/:bookingId/status', updateBookingAdminStatus);

// User management
router.get('/users', getAllUsers);
router.patch('/users/:userId/:userType/toggle-status', toggleUserStatus);

// Admin Event Management
router.get('/events', getAllAdminEvents);
router.post('/events', uploadSingle('eventImage'), createAdminEvent);
router.put('/events/:eventId', uploadSingle('eventImage'), updateAdminEvent);
router.delete('/events/:eventId', deleteAdminEvent);

export default router;
