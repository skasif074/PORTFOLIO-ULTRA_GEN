import express from 'express';
import { requireAdmin } from '../middleware/auth.middleware.js';
import { trackEvent, getDashboardStats } from '../controllers/analytics.controller.js';

const router = express.Router();

router.post('/track', trackEvent);
router.get('/dashboard', requireAdmin, getDashboardStats);

export default router;
