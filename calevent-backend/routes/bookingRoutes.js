import express from 'express';
import {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  addBookingRating
} from '../controllers/bookingController.js';
import { verifyToken, customerAuth, providerAuth } from '../middleware/auth.js';
import { validateBookingCreation } from '../middleware/validation.js';

const router = express.Router();

// Create booking (Customer only)
router.post('/', customerAuth, validateBookingCreation, createBooking);

// Get user's bookings (Both customer and provider)
router.get('/my-bookings', verifyToken, getMyBookings);

// Get booking by ID (Both customer and provider)
router.get('/:id', verifyToken, getBookingById);

// Update booking status (Provider only)
router.patch('/:id/status', providerAuth, updateBookingStatus);

// Cancel booking (Both customer and provider)
router.patch('/:id/cancel', verifyToken, cancelBooking);

// Add rating (Both customer and provider)
router.post('/:id/rating', verifyToken, addBookingRating);

export default router;