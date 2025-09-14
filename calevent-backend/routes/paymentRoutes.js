import express from 'express';
import {
  createPaymentOrder,
  verifyPayment,
  getPaymentHistory,
  handleWebhook,
  getPaymentById
} from '../controllers/paymentController.js';
import { verifyToken, customerAuth } from '../middleware/auth.js';

const router = express.Router();

// Create payment order (Customer only)
router.post('/create-order', customerAuth, createPaymentOrder);

// Verify payment (Customer only)
router.post('/verify', customerAuth, verifyPayment);

// Get payment history (Both customer and provider)
router.get('/history', verifyToken, getPaymentHistory);

// Get payment by ID (Both customer and provider)
router.get('/:id', verifyToken, getPaymentById);

// Webhook endpoint (No auth required)
router.post('/webhook', handleWebhook);

export default router;