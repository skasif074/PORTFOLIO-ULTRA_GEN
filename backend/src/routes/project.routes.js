import express from 'express';
import { requireAdmin } from '../middleware/auth.middleware.js';
import { uploadImage } from '../config/storage.js';
import {
  getProjects, getProjectById, createProject,
  updateProject, deleteProject, getProjectCategories,
} from '../controllers/project.controller.js';

const router = express.Router();

router.get('/', getProjects);
router.get('/categories', getProjectCategories);
router.get('/:id', getProjectById);

router.post('/', requireAdmin, uploadImage.single('thumbnail'), createProject);
router.put('/:id', requireAdmin, uploadImage.single('thumbnail'), updateProject);
router.delete('/:id', requireAdmin, deleteProject);

export default router;
