import { supabaseAdmin } from '../config/supabase.js';

export const logAdminActivity = async (action, entity, entityId = '', description = '', metadata = {}) => {
  try {
    await supabaseAdmin.from('admin_activity_log').insert([
      { action, entity, entity_id: entityId, description, metadata },
    ]);
  } catch (err) {
    // Never let logging crash the main request
    console.error('Activity log error:', err.message);
  }
};
