import express from 'express';
import { requireAdmin, requireAuth } from '../middleware/auth.middleware.js';
import {
  sendContactMessage, getContactMessages,
  markMessageRead, deleteMessage,
  getStreamToken, getAdminStreamToken,
} from '../controllers/message.controller.js';

const router = express.Router();

// Contact form — fully public, NO auth
router.post('/contact', sendContactMessage);

// Admin only
router.get('/', requireAdmin, getContactMessages);
router.put('/:id/read', requireAdmin, markMessageRead);
router.delete('/:id', requireAdmin, deleteMessage);

// Stream tokens
router.post('/stream-token', requireAuth, getStreamToken);
router.get('/stream-token/admin', requireAdmin, getAdminStreamToken);

export default router;