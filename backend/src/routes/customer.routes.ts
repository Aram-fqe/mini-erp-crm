import { Router } from 'express';
import {
  createCustomerController,
  getCustomersController,
  getCustomerByIdController,
  updateCustomerController,
  deleteCustomerController,
  createFollowUpController,
  getFollowUpsController,
} from '../controllers/customer.controller';
import { asyncHandler } from '../middleware/asyncHandler';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { UserRole } from '@prisma/client';

const router = Router();

// Protect all customer routes with authentication
router.use(authenticate);

// GET /api/customers — List with search, filter & pagination (ADMIN, SALES, ACCOUNTS)
router.get(
  '/',
  requireRole(UserRole.ADMIN, UserRole.SALES, UserRole.ACCOUNTS),
  asyncHandler(getCustomersController)
);

// GET /api/customers/:id — Customer details with follow-ups & counts
router.get(
  '/:id',
  requireRole(UserRole.ADMIN, UserRole.SALES, UserRole.ACCOUNTS),
  asyncHandler(getCustomerByIdController)
);

// POST /api/customers — Add new customer (ADMIN, SALES)
router.post(
  '/',
  requireRole(UserRole.ADMIN, UserRole.SALES),
  asyncHandler(createCustomerController)
);

// PUT /api/customers/:id — Edit customer details (ADMIN, SALES)
router.put(
  '/:id',
  requireRole(UserRole.ADMIN, UserRole.SALES),
  asyncHandler(updateCustomerController)
);

// DELETE /api/customers/:id — Delete customer (ADMIN only)
router.delete(
  '/:id',
  requireRole(UserRole.ADMIN),
  asyncHandler(deleteCustomerController)
);

// POST /api/customers/:id/followups — Add follow-up note (ADMIN, SALES)
router.post(
  '/:id/followups',
  requireRole(UserRole.ADMIN, UserRole.SALES),
  asyncHandler(createFollowUpController)
);

// GET /api/customers/:id/followups — Get customer follow-up history (ADMIN, SALES, ACCOUNTS)
router.get(
  '/:id/followups',
  requireRole(UserRole.ADMIN, UserRole.SALES, UserRole.ACCOUNTS),
  asyncHandler(getFollowUpsController)
);

export default router;
