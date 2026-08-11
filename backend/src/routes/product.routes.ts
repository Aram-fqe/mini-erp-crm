import { Router } from 'express';
import {
  createProductController,
  getProductsController,
  getProductByIdController,
  updateProductController,
  adjustStockController,
  getStockMovementsController,
  getCategoriesController,
} from '../controllers/product.controller';
import { asyncHandler } from '../middleware/asyncHandler';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { UserRole } from '@prisma/client';

const router = Router();

// Protect all product routes with authentication
router.use(authenticate);

// GET /api/products/categories — List distinct product categories
router.get('/categories', asyncHandler(getCategoriesController));

// GET /api/products — List products (all authenticated users: ADMIN, SALES, WAREHOUSE, ACCOUNTS)
router.get('/', asyncHandler(getProductsController));

// GET /api/products/:id — Product details with isLowStock flag
router.get('/:id', asyncHandler(getProductByIdController));

// POST /api/products — Create product (ADMIN, WAREHOUSE)
router.post(
  '/',
  requireRole(UserRole.ADMIN, UserRole.WAREHOUSE),
  asyncHandler(createProductController)
);

// PUT /api/products/:id — Edit product (ADMIN, WAREHOUSE)
router.put(
  '/:id',
  requireRole(UserRole.ADMIN, UserRole.WAREHOUSE),
  asyncHandler(updateProductController)
);

// POST /api/products/:id/stock — Stock IN / OUT movement (ADMIN, WAREHOUSE)
router.post(
  '/:id/stock',
  requireRole(UserRole.ADMIN, UserRole.WAREHOUSE),
  asyncHandler(adjustStockController)
);

// GET /api/products/:id/stock-movements — Stock movement history
router.get(
  '/:id/stock-movements',
  asyncHandler(getStockMovementsController)
);

export default router;
