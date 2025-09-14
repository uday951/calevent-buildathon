import express from 'express';
import {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  toggleEventLike,
  addEventReview
} from '../controllers/eventController.js';
import { providerAuth, customerAuth, optionalAuth } from '../middleware/auth.js';
import { uploadSingle } from '../middleware/upload.js';
import { validateEventCreation } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.get('/', optionalAuth, getAllEvents);
router.get('/:id', optionalAuth, getEventById);

// Provider routes
router.post('/', providerAuth, uploadSingle('eventImage'), validateEventCreation, createEvent);
router.put('/:id', providerAuth, uploadSingle('eventImage'), updateEvent);
router.delete('/:id', providerAuth, deleteEvent);

// Customer routes
router.post('/:id/like', customerAuth, toggleEventLike);
router.post('/:id/review', customerAuth, addEventReview);

export default router;