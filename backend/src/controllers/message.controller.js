import { supabase, supabaseAdmin } from '../config/supabase.js';
import { generateStreamToken, upsertStreamUser } from '../config/stream.js';
import { logAdminActivity } from '../utils/activityLog.js';

export const sendContactMessage = async (req, res, next) => {
  try {
    const { name, email, subject, message, clerk_user_id } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required',
      });
    }

    const { data, error } = await supabaseAdmin
      .from('contact_messages')
      .insert([{
        name: String(name).trim(),
        email: String(email).trim().toLowerCase(),
        subject: String(subject || '').trim(),
        message: String(message).trim(),
        clerk_user_id: String(clerk_user_id || '').trim(),
        ip_address: req.ip || '',
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: "Message sent successfully! I'll get back to you soon.",
      data: { id: data.id },
    });
  } catch (err) {
    next(err);
  }
};

export const getContactMessages = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { data, error, count } = await supabaseAdmin
      .from('contact_messages')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (error) throw error;

    res.json({
      success: true,
      data,
      pagination: { total: count, page: parseInt(page), limit: parseInt(limit) },
    });
  } catch (err) {
    next(err);
  }
};

export const markMessageRead = async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('contact_messages')
      .update({ is_read: true })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const deleteMessage = async (req, res, next) => {
  try {
    const { error } = await supabaseAdmin
      .from('contact_messages')
      .delete()
      .eq('id', req.params.id);
    if (error) throw error;
    await logAdminActivity('DELETE', 'message', req.params.id, 'Deleted contact message');
    res.json({ success: true, message: 'Message deleted' });
  } catch (err) {
    next(err);
  }
};

export const getStreamToken = async (req, res, next) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    await upsertStreamUser(userId, {
      name: req.body.name || 'User',
      image: req.body.image || '',
    });

    const token = generateStreamToken(userId);

    res.json({
      success: true,
      data: { token, userId, apiKey: process.env.STREAM_API_KEY },
    });
  } catch (err) {
    next(err);
  }
};

export const getAdminStreamToken = async (req, res, next) => {
  try {
    const adminId = process.env.ADMIN_CLERK_USER_ID;
    const token = generateStreamToken(adminId);
    res.json({
      success: true,
      data: { token, userId: adminId, apiKey: process.env.STREAM_API_KEY },
    });
  } catch (err) {
    next(err);
  }
};