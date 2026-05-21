import express from 'express';
import { requireAdmin, requireAuth } from '../middleware/auth.middleware.js';
import { uploadImage } from '../config/storage.js';
import {
  getAbout, updateAbout, updateProfileImage,
  getExperience, createExperience, updateExperience, deleteExperience,
  getEducation, createEducation, updateEducation, deleteEducation,
} from '../controllers/about.controller.js';

const router = express.Router();

// Public routes
router.get('/', getAbout);
router.get('/experience', getExperience);
router.get('/education', getEducation);

// Admin routes
router.put('/', requireAdmin, updateAbout);
router.put('/profile-image', requireAdmin, uploadImage.single('image'), updateProfileImage);

router.post('/experience', requireAdmin, createExperience);
router.put('/experience/:id', requireAdmin, updateExperience);
router.delete('/experience/:id', requireAdmin, deleteExperience);

router.post('/education', requireAdmin, createEducation);
router.put('/education/:id', requireAdmin, updateEducation);
router.delete('/education/:id', requireAdmin, deleteEducation);

export default router;
