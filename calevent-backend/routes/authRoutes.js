import express from 'express';
import { 
  registerCustomer, 
  loginCustomer, 
  registerProvider, 
  loginProvider, 
  verifyToken 
} from '../controllers/authController.js';
import { 
  validateCustomerRegistration, 
  validateProviderRegistration, 
  validateLogin 
} from '../middleware/validation.js';
import { verifyToken as verifyTokenMiddleware } from '../middleware/auth.js';
import { authLimiter } from '../middleware/security.js';

const router = express.Router();

// Customer routes
router.post('/customer/register', authLimiter, validateCustomerRegistration, registerCustomer);
router.post('/customer/login', authLimiter, validateLogin, loginCustomer);

// Provider routes
router.post('/provider/register', authLimiter, validateProviderRegistration, registerProvider);
router.post('/provider/login', authLimiter, validateLogin, loginProvider);

// Token verification
router.get('/verify', verifyTokenMiddleware, verifyToken);

export default router;