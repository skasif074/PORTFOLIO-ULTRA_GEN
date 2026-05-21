import express from 'express';
import { requireAdmin } from '../middleware/auth.middleware.js';
import { uploadImage } from '../config/storage.js';
import {
  getSkills, createSkill, updateSkill, deleteSkill, reorderSkills,
} from '../controllers/skill.controller.js';

const router = express.Router();

router.get('/', getSkills);
router.post('/', requireAdmin, uploadImage.single('icon'), createSkill);
router.put('/reorder', requireAdmin, reorderSkills);
router.put('/:id', requireAdmin, uploadImage.single('icon'), updateSkill);
router.delete('/:id', requireAdmin, deleteSkill);

export default router;
