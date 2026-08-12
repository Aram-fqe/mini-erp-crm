import { Router } from 'express';
import { loginController, registerController, getMeController } from '../controllers/auth.controller';
import { asyncHandler } from '../middleware/asyncHandler';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public route
router.post('/login', asyncHandler(loginController));
router.post('/register', asyncHandler(registerController));

// Protected route to verify current token & user payload
router.get('/me', authenticate, asyncHandler(getMeController));

export default router;
