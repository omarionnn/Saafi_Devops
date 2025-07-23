import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth';
const router = Router();

// Apply JWT middleware to all routes in this router
router.use(authenticateJWT);

// TODO: Add environment management endpoints

export default router; 