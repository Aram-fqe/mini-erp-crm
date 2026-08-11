import { Router } from 'express';
import {
  createChallanController,
  getChallansController,
  getChallanByIdController,
  confirmChallanController,
  cancelChallanController,
} from '../controllers/challan.controller';
import { asyncHandler } from '../middleware/asyncHandler';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { UserRole } from '@prisma/client';

const router = Router();

// Protect all challan routes with authentication
router.use(authenticate);

// GET /api/challans — List challans (ADMIN, SALES, WAREHOUSE, ACCOUNTS)
router.get('/', asyncHandler(getChallansController));

// GET /api/challans/:id — Get details of a single challan
router.get('/:id', asyncHandler(getChallanByIdController));

// POST /api/challans — Create new challan DRAFT (ADMIN, SALES)
router.post(
  '/',
  requireRole(UserRole.ADMIN, UserRole.SALES),
  asyncHandler(createChallanController)
);

// PUT /api/challans/:id/confirm — Confirm challan & trigger inventory reduction (ADMIN, SALES, WAREHOUSE)
router.put(
  '/:id/confirm',
  requireRole(UserRole.ADMIN, UserRole.SALES, UserRole.WAREHOUSE),
  asyncHandler(confirmChallanController)
);

// PUT /api/challans/:id/cancel — Cancel challan (ADMIN, SALES)
router.put(
  '/:id/cancel',
  requireRole(UserRole.ADMIN, UserRole.SALES),
  asyncHandler(cancelChallanController)
);

export default router;
