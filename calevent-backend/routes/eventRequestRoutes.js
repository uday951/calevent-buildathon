import express from 'express';
import {
  createRequest, getMyRequests, getMyRequestById, approveQuote, cancelRequest,
  adminGetAll, adminGetById, adminGetStats, adminUpdateStatus,
  adminAssignProvider, adminRemoveAssignment, adminCreateQuotation, adminSearchProviders,
  providerGetAssignments, providerRespond
} from '../controllers/eventRequestController.js';
import { verifyToken } from '../middleware/auth.js';
import { adminAuth } from '../middleware/adminAuth.js';

const router = express.Router();

// ── Customer routes ──────────────────────────────────────────────────────────
router.post('/',                       verifyToken, createRequest);
router.get('/my',                      verifyToken, getMyRequests);
router.get('/my/:id',                  verifyToken, getMyRequestById);
router.patch('/my/:id/approve-quote',  verifyToken, approveQuote);
router.patch('/my/:id/cancel',         verifyToken, cancelRequest);

// ── Admin routes — SPECIFIC routes MUST come before /:id ────────────────────
router.get('/admin/all',                              adminAuth, adminGetAll);
router.get('/admin/stats',                            adminAuth, adminGetStats);
router.get('/admin/providers/search',                 adminAuth, adminSearchProviders);
// /:id routes below
router.get('/admin/:id',                              adminAuth, adminGetById);
router.patch('/admin/:id/status',                     adminAuth, adminUpdateStatus);
router.post('/admin/:id/assign-provider',             adminAuth, adminAssignProvider);
router.delete('/admin/:id/assignments/:assignmentId', adminAuth, adminRemoveAssignment);
router.post('/admin/:id/quotation',                   adminAuth, adminCreateQuotation);

// ── Provider routes ──────────────────────────────────────────────────────────
router.get('/provider/assignments',                          verifyToken, providerGetAssignments);
router.patch('/provider/assignments/:assignmentId/respond',  verifyToken, providerRespond);

export default router;
