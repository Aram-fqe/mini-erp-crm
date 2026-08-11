import { Router } from 'express';
import { checkHealth } from '../controllers/health.controller';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

router.get('/', asyncHandler(checkHealth));

export default router;
