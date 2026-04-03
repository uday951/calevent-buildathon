import express from 'express';
import { 
  createBooking, 
  getCustomerBookings, 
  getProviderBookings, 
  updateBookingStatus,
  getBookingById 
} from '../controllers/bookingController.js';
import { optionalAuth, verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Create new booking
router.post('/create', verifyToken, createBooking);

// Get customer bookings
router.get('/customer', verifyToken, getCustomerBookings);

// Get provider bookings  
router.get('/provider', verifyToken, getProviderBookings);

// Get booking by ID
router.get('/:bookingId', verifyToken, getBookingById);

// Update booking status (provider only)
router.put('/:bookingId/status', verifyToken, updateBookingStatus);

export default router;