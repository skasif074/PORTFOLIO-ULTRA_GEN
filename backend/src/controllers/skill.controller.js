import { supabase, supabaseAdmin } from '../config/supabase.js';
import { uploadToSupabase } from '../config/storage.js';
import { logAdminActivity } from '../utils/activityLog.js';

// GET /api/skills - Public
export const getSkills = async (req, res, next) => {
  try {
    const { category } = req.query;
    let query = supabase.from('skills').select('*').order('category').order('sort_order');
    if (category) query = query.eq('category', category);

    const { data, error } = await query;
    if (error) throw error;

    // Group by category
    const grouped = data.reduce((acc, skill) => {
      if (!acc[skill.category]) acc[skill.category] = [];
      acc[skill.category].push(skill);
      return acc;
    }, {});

    res.json({ success: true, data, grouped });
  } catch (err) { next(err); }
};

// POST /api/skills - Admin only
export const createSkill = async (req, res, next) => {
  try {
    let iconUrl = req.body.icon_url || '';
    if (req.file) iconUrl = await uploadToSupabase(req.file, 'images', 'skills');

    const skillData = {
      name: req.body.name,
      category: req.body.category || 'Other',
      proficiency: parseInt(req.body.proficiency) || 80,
      icon_url: iconUrl,
      color: req.body.color || '#3B82F6',
      is_featured: req.body.is_featured === 'true' || req.body.is_featured === true,
      sort_order: parseInt(req.body.sort_order) || 0,
    };

    const { data, error } = await supabaseAdmin.from('skills').insert([skillData]).select().single();
    if (error) throw error;

    await logAdminActivity('CREATE', 'skill', data.id, `Added skill: ${data.name}`);
    res.status(201).json({ success: true, data, message: 'Skill added' });
  } catch (err) { next(err); }
};

// PUT /api/skills/:id - Admin only
export const updateSkill = async (req, res, next) => {
  try {
    const updateData = { ...req.body };
    if (req.file) updateData.icon_url = await uploadToSupabase(req.file, 'images', 'skills');
    if (updateData.proficiency) updateData.proficiency = parseInt(updateData.proficiency);

    const { data, error } = await supabaseAdmin.from('skills').update(updateData).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json({ success: true, data, message: 'Skill updated' });
  } catch (err) { next(err); }
};

// DELETE /api/skills/:id - Admin only
export const deleteSkill = async (req, res, next) => {
  try {
    const { error } = await supabaseAdmin.from('skills').delete().eq('id', req.params.id);
    if (error) throw error;
    await logAdminActivity('DELETE', 'skill', req.params.id, 'Deleted skill');
    res.json({ success: true, message: 'Skill deleted' });
  } catch (err) { next(err); }
};

// PUT /api/skills/reorder - Admin only
export const reorderSkills = async (req, res, next) => {
  try {
    const { skills } = req.body;
    await Promise.all(skills.map(({ id, sort_order }) =>
      supabaseAdmin.from('skills').update({ sort_order }).eq('id', id)
    ));
    res.json({ success: true, message: 'Skills reordered' });
  } catch (err) { next(err); }
};
