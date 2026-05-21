import { supabase, supabaseAdmin } from '../config/supabase.js';
import { uploadToSupabase, deleteFromSupabase } from '../config/storage.js';
import { logAdminActivity } from '../utils/activityLog.js';

// GET /api/about - Public
export const getAbout = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('about').select('*').limit(1).single();
    if (error) throw error;

    const [expRes, eduRes, socialRes, achieveRes] = await Promise.all([
      supabase.from('experience').select('*').order('sort_order'),
      supabase.from('education').select('*').order('sort_order'),
      supabase.from('social_links').select('*').eq('is_visible', true).order('sort_order'),
      supabase.from('achievements').select('*').order('sort_order'),
    ]);

    res.json({
      success: true,
      data: {
        ...data,
        experience: expRes.data || [],
        education: eduRes.data || [],
        social_links: socialRes.data || [],
        achievements: achieveRes.data || [],
      },
    });
  } catch (err) { next(err); }
};

// PUT /api/about - Admin only
export const updateAbout = async (req, res, next) => {
  try {
    const { name, title, tagline, bio, location, email, phone, career_goal, years_of_experience, available_for_work } = req.body;

    // First get the existing row id
    const { data: existing } = await supabaseAdmin.from('about').select('id').limit(1).single();
    if (!existing) return res.status(404).json({ success: false, message: 'About record not found' });

    const { data, error } = await supabaseAdmin
      .from('about')
      .update({ name, title, tagline, bio, location, email, phone, career_goal, years_of_experience, available_for_work })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;
    await logAdminActivity('UPDATE', 'about', data.id, 'Updated about section');
    res.json({ success: true, data, message: 'About section updated' });
  } catch (err) { next(err); }
};

// PUT /api/about/profile-image - Admin only
export const updateProfileImage = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No image uploaded' });

    const { data: current } = await supabaseAdmin.from('about').select('id, profile_image_url').limit(1).single();
    if (!current) return res.status(404).json({ success: false, message: 'About record not found' });

    const imageUrl = await uploadToSupabase(req.file, 'images', 'profile');
    if (current?.profile_image_url) await deleteFromSupabase(current.profile_image_url, 'images');

    const { data, error } = await supabaseAdmin
      .from('about')
      .update({ profile_image_url: imageUrl })
      .eq('id', current.id)
      .select()
      .single();

    if (error) throw error;
    await logAdminActivity('UPDATE', 'about', data.id, 'Updated profile image');
    res.json({ success: true, data: { profile_image_url: imageUrl }, message: 'Profile image updated' });
  } catch (err) { next(err); }
};

// ─── EXPERIENCE ─────────────────────────────────────────────
export const getExperience = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('experience').select('*').order('sort_order');
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

export const createExperience = async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin.from('experience').insert([req.body]).select().single();
    if (error) throw error;
    await logAdminActivity('CREATE', 'experience', data.id, `Added: ${data.company}`);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
};

export const updateExperience = async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin.from('experience').update(req.body).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

export const deleteExperience = async (req, res, next) => {
  try {
    const { error } = await supabaseAdmin.from('experience').delete().eq('id', req.params.id);
    if (error) throw error;
    await logAdminActivity('DELETE', 'experience', req.params.id, 'Deleted experience');
    res.json({ success: true, message: 'Experience deleted' });
  } catch (err) { next(err); }
};

// ─── EDUCATION ──────────────────────────────────────────────
export const getEducation = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('education').select('*').order('sort_order');
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

export const createEducation = async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin.from('education').insert([req.body]).select().single();
    if (error) throw error;
    await logAdminActivity('CREATE', 'education', data.id, `Added: ${data.institution}`);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
};

export const updateEducation = async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin.from('education').update(req.body).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

export const deleteEducation = async (req, res, next) => {
  try {
    const { error } = await supabaseAdmin.from('education').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true, message: 'Education deleted' });
  } catch (err) { next(err); }
};