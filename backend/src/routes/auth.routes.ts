import { Router } from 'express';
import { loginController, getMeController } from '../controllers/auth.controller';
import { asyncHandler } from '../middleware/asyncHandler';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public route
router.post('/login', asyncHandler(loginController));

// Protected route to verify current token & user payload
router.get('/me', authenticate, asyncHandler(getMeController));

export default router;
