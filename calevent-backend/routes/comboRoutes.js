import express from 'express';
import {
  getAllComboPackages,
  getComboPackageById,
  createComboPackage,
  updateComboPackage,
  deleteComboPackage
} from '../controllers/comboController.js';
import { providerAuth, optionalAuth } from '../middleware/auth.js';
import { uploadMultiple } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', optionalAuth, getAllComboPackages);
router.get('/:id', optionalAuth, getComboPackageById);

// Provider routes
router.post('/', providerAuth, uploadMultiple('images', 5), createComboPackage);
router.put('/:id', providerAuth, uploadMultiple('images', 5), updateComboPackage);
router.delete('/:id', providerAuth, deleteComboPackage);

export default router;