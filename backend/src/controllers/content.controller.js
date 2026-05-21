import { supabase, supabaseAdmin } from '../config/supabase.js';
import { uploadToSupabase, deleteFromSupabase } from '../config/storage.js';
import { logAdminActivity } from '../utils/activityLog.js';

// ─── RESUMES ─────────────────────────────────────────────────

export const getActiveResume = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('resumes').select('*').eq('is_active', true)
      .order('created_at', { ascending: false }).limit(1).single();
    if (error && error.code !== 'PGRST116') throw error;
    res.json({ success: true, data: data || null });
  } catch (err) { next(err); }
};

export const getAllResumes = async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin.from('resumes').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

export const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const fileUrl = await uploadToSupabase(req.file, 'resumes', '');
    const isActive = req.body.is_active !== 'false';

    // Deactivate all others if setting as active
    if (isActive) {
      await supabaseAdmin.from('resumes').update({ is_active: false }).eq('is_active', true);
    }

    const { data, error } = await supabaseAdmin
      .from('resumes')
      .insert([{ title: req.body.title || 'Resume', file_url: fileUrl, is_active: isActive }])
      .select().single();
    if (error) throw error;

    await logAdminActivity('CREATE', 'resume', data.id, `Uploaded: ${data.title}`);
    res.status(201).json({ success: true, data, message: 'Resume uploaded successfully' });
  } catch (err) { next(err); }
};

export const deleteResume = async (req, res, next) => {
  try {
    const { data: resume } = await supabaseAdmin.from('resumes').select('file_url').eq('id', req.params.id).single();
    if (resume?.file_url) await deleteFromSupabase(resume.file_url, 'resumes');
    const { error } = await supabaseAdmin.from('resumes').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true, message: 'Resume deleted' });
  } catch (err) { next(err); }
};

export const trackResumeDownload = async (req, res, next) => {
  try {
    const { data } = await supabase.from('resumes').select('download_count').eq('id', req.params.id).single();
    await supabaseAdmin.from('resumes').update({ download_count: (data?.download_count || 0) + 1 }).eq('id', req.params.id);
    res.json({ success: true });
  } catch (err) { next(err); }
};

// ─── CERTIFICATIONS ──────────────────────────────────────────

export const getCertifications = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('certifications').select('*').order('sort_order');
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

export const createCertification = async (req, res, next) => {
  try {
    let imageUrl = req.body.image_url || '';
    if (req.file) imageUrl = await uploadToSupabase(req.file, 'images', 'certifications');
    const { data, error } = await supabaseAdmin.from('certifications').insert([{ ...req.body, image_url: imageUrl }]).select().single();
    if (error) throw error;
    await logAdminActivity('CREATE', 'certification', data.id, `Added: ${data.title}`);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
};

export const updateCertification = async (req, res, next) => {
  try {
    const updateData = { ...req.body };
    if (req.file) updateData.image_url = await uploadToSupabase(req.file, 'images', 'certifications');
    const { data, error } = await supabaseAdmin.from('certifications').update(updateData).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

export const deleteCertification = async (req, res, next) => {
  try {
    const { error } = await supabaseAdmin.from('certifications').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true, message: 'Certification deleted' });
  } catch (err) { next(err); }
};

// ─── SOCIAL LINKS ─────────────────────────────────────────────

export const getSocialLinks = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('social_links').select('*').eq('is_visible', true).order('sort_order');
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

export const upsertSocialLinks = async (req, res, next) => {
  try {
    const { links } = req.body;
    const { data, error } = await supabaseAdmin.from('social_links').upsert(links, { onConflict: 'id' }).select();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

export const deleteSocialLink = async (req, res, next) => {
  try {
    const { error } = await supabaseAdmin.from('social_links').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true, message: 'Social link deleted' });
  } catch (err) { next(err); }
};

// ─── ACHIEVEMENTS ─────────────────────────────────────────────

export const getAchievements = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('achievements').select('*').order('sort_order');
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

export const createAchievement = async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin.from('achievements').insert([req.body]).select().single();
    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
};

export const updateAchievement = async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin.from('achievements').update(req.body).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

export const deleteAchievement = async (req, res, next) => {
  try {
    const { error } = await supabaseAdmin.from('achievements').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true, message: 'Achievement deleted' });
  } catch (err) { next(err); }
};
