import express from 'express';
import { 
  createBooking, 
  getCustomerBookings, 
  getProviderBookings, 
  updateBookingStatus,
  getBookingById 
} from '../controllers/bookingController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Create new booking
router.post('/create', optionalAuth, createBooking);

// Get customer bookings
router.get('/customer', optionalAuth, getCustomerBookings);

// Get provider bookings  
router.get('/provider', optionalAuth, getProviderBookings);

// Get booking by ID
router.get('/:bookingId', optionalAuth, getBookingById);

// Update booking status (provider only)
router.put('/:bookingId/status', optionalAuth, updateBookingStatus);

export default router;