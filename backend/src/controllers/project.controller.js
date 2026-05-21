import { supabase, supabaseAdmin } from '../config/supabase.js';
import { uploadToSupabase, deleteFromSupabase } from '../config/storage.js';
import { logAdminActivity } from '../utils/activityLog.js';

// GET /api/projects - Public
export const getProjects = async (req, res, next) => {
  try {
    const { category, featured, search, page = 1, limit = 12 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = supabase
      .from('projects')
      .select('*', { count: 'exact' })
      .order('is_featured', { ascending: false })
      .order('sort_order')
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (category && category !== 'all') query = query.eq('category', category);
    if (featured === 'true') query = query.eq('is_featured', true);
    if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);

    const { data, error, count } = await query;
    if (error) throw error;

    res.json({
      success: true,
      data,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (err) { next(err); }
};

// GET /api/projects/categories - Public
export const getProjectCategories = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('projects').select('category');
    if (error) throw error;
    const categories = ['all', ...new Set(data.map((p) => p.category))];
    res.json({ success: true, data: categories });
  } catch (err) { next(err); }
};

// GET /api/projects/:id - Public
export const getProjectById = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('projects').select('*').eq('id', req.params.id).single();
    if (error) throw error;

    // Track view (fire and forget)
    supabaseAdmin.from('project_views').insert([{ project_id: req.params.id, ip_address: req.ip }])
      .then(() => supabaseAdmin.from('projects').update({ views: (data.views || 0) + 1 }).eq('id', req.params.id));

    res.json({ success: true, data });
  } catch (err) { next(err); }
};

// POST /api/projects - Admin only
export const createProject = async (req, res, next) => {
  try {
    let thumbnailUrl = req.body.thumbnail_url || '';

    // Upload thumbnail if file provided
    if (req.file) {
      thumbnailUrl = await uploadToSupabase(req.file, 'images', 'projects');
    }

    const projectData = {
      title: req.body.title,
      description: req.body.description,
      long_description: req.body.long_description || '',
      tech_stack: typeof req.body.tech_stack === 'string' ? JSON.parse(req.body.tech_stack) : req.body.tech_stack || [],
      github_url: req.body.github_url || '',
      live_url: req.body.live_url || '',
      thumbnail_url: thumbnailUrl,
      screenshots: typeof req.body.screenshots === 'string' ? JSON.parse(req.body.screenshots) : req.body.screenshots || [],
      category: req.body.category || 'Web',
      is_featured: req.body.is_featured === 'true' || req.body.is_featured === true,
      status: req.body.status || 'completed',
      sort_order: parseInt(req.body.sort_order) || 0,
    };

    const { data, error } = await supabaseAdmin.from('projects').insert([projectData]).select().single();
    if (error) throw error;

    await logAdminActivity('CREATE', 'project', data.id, `Created: ${data.title}`);
    res.status(201).json({ success: true, data, message: 'Project created successfully' });
  } catch (err) { next(err); }
};

// PUT /api/projects/:id - Admin only
export const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (req.file) {
      // Delete old thumbnail
      const { data: old } = await supabaseAdmin.from('projects').select('thumbnail_url').eq('id', id).single();
      if (old?.thumbnail_url) await deleteFromSupabase(old.thumbnail_url, 'images');
      updateData.thumbnail_url = await uploadToSupabase(req.file, 'images', 'projects');
    }

    if (typeof updateData.tech_stack === 'string') updateData.tech_stack = JSON.parse(updateData.tech_stack);
    if (typeof updateData.screenshots === 'string') updateData.screenshots = JSON.parse(updateData.screenshots);

    const { data, error } = await supabaseAdmin.from('projects').update(updateData).eq('id', id).select().single();
    if (error) throw error;

    await logAdminActivity('UPDATE', 'project', id, `Updated: ${data.title}`);
    res.json({ success: true, data, message: 'Project updated' });
  } catch (err) { next(err); }
};

// DELETE /api/projects/:id - Admin only
export const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data: project } = await supabaseAdmin.from('projects').select('thumbnail_url').eq('id', id).single();
    if (project?.thumbnail_url) await deleteFromSupabase(project.thumbnail_url, 'images');

    const { error } = await supabaseAdmin.from('projects').delete().eq('id', id);
    if (error) throw error;

    await logAdminActivity('DELETE', 'project', id, 'Deleted project');
    res.json({ success: true, message: 'Project deleted' });
  } catch (err) { next(err); }
};
