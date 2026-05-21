import multer from 'multer';
import { supabaseAdmin } from './supabase.js';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

// Use memory storage — files go to buffer, then we push to Supabase
const memoryStorage = multer.memoryStorage();

export const uploadImage = multer({
  storage: memoryStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid image type. Allowed: jpg, png, webp, gif, svg'), false);
    }
  },
});

export const uploadResume = multer({
  storage: memoryStorage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed for resumes'), false);
    }
  },
});

// Upload a file buffer to Supabase Storage
// Returns the public URL
export const uploadToSupabase = async (file, bucket = 'images', folder = '') => {
  try {
    const ext = path.extname(file.originalname) || '.jpg';
    const fileName = `${folder ? folder + '/' : ''}${uuidv4()}${ext}`;

    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) throw error;

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  } catch (err) {
    console.error('Supabase Storage upload error:', err);
    throw err;
  }
};

// Delete a file from Supabase Storage by its public URL
export const deleteFromSupabase = async (publicUrl, bucket = 'images') => {
  try {
    // Extract file path from URL
    // URL format: https://xxx.supabase.co/storage/v1/object/public/images/folder/file.jpg
    const urlParts = publicUrl.split(`/storage/v1/object/public/${bucket}/`);
    if (urlParts.length < 2) return;

    const filePath = urlParts[1];

    const { error } = await supabaseAdmin.storage
      .from(bucket)
      .remove([filePath]);

    if (error) throw error;
  } catch (err) {
    console.error('Supabase Storage delete error:', err);
    // Don't throw — deletion failures shouldn't crash the main request
  }
};
