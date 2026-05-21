import express from 'express';
import { requireAdmin } from '../middleware/auth.middleware.js';
import { uploadImage, uploadResume as uploadResumeMW } from '../config/storage.js';
import {
  getActiveResume, getAllResumes, uploadResume, deleteResume, trackResumeDownload,
  getCertifications, createCertification, updateCertification, deleteCertification,
  getSocialLinks, upsertSocialLinks, deleteSocialLink,
  getAchievements, createAchievement, updateAchievement, deleteAchievement,
} from '../controllers/content.controller.js';

const router = express.Router();

// Resume
router.get('/resume', getActiveResume);
router.get('/resume/all', requireAdmin, getAllResumes);
router.post('/resume', requireAdmin, uploadResumeMW.single('file'), uploadResume);
router.delete('/resume/:id', requireAdmin, deleteResume);
router.post('/resume/:id/download', trackResumeDownload);

// Certifications
router.get('/certifications', getCertifications);
router.post('/certifications', requireAdmin, uploadImage.single('image'), createCertification);
router.put('/certifications/:id', requireAdmin, uploadImage.single('image'), updateCertification);
router.delete('/certifications/:id', requireAdmin, deleteCertification);

// Social links
router.get('/social', getSocialLinks);
router.put('/social', requireAdmin, upsertSocialLinks);
router.delete('/social/:id', requireAdmin, deleteSocialLink);

// Achievements
router.get('/achievements', getAchievements);
router.post('/achievements', requireAdmin, createAchievement);
router.put('/achievements/:id', requireAdmin, updateAchievement);
router.delete('/achievements/:id', requireAdmin, deleteAchievement);

export default router;
