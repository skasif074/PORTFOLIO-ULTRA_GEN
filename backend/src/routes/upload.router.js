import express from 'express';
import { requireAdmin } from '../middleware/auth.middleware.js';
import { uploadImage, uploadToSupabase } from '../config/storage.js';

const router = express.Router();

router.post('/', requireAdmin, uploadImage.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file provided' });
    const url = await uploadToSupabase(req.file, 'images', 'uploads');
    res.json({ data: { url } });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

export default router;