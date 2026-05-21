import { supabase, supabaseAdmin } from '../config/supabase.js';

// POST /api/analytics/track - Public
export const trackEvent = async (req, res, next) => {
  try {
    const { page, event_type = 'page_view', metadata = {} } = req.body;

    await supabaseAdmin.from('analytics').insert([
      {
        page,
        event_type,
        metadata,
        ip_address: req.ip || '',
        user_agent: req.headers['user-agent'] || '',
      },
    ]);

    res.json({ success: true });
  } catch (err) {
    // Don't block the user if analytics fails
    res.json({ success: false });
  }
};

// GET /api/analytics/dashboard - Admin only
export const getDashboardStats = async (req, res, next) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [
      totalViews,
      recentViews,
      totalMessages,
      unreadMessages,
      totalProjects,
      projectViews,
      topPages,
      dailyViews,
      activityLog,
    ] = await Promise.all([
      // Total page views
      supabaseAdmin
        .from('analytics')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'page_view'),

      // Views last 7 days
      supabaseAdmin
        .from('analytics')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'page_view')
        .gte('created_at', sevenDaysAgo),

      // Total contact messages
      supabaseAdmin
        .from('contact_messages')
        .select('*', { count: 'exact', head: true }),

      // Unread messages
      supabaseAdmin
        .from('contact_messages')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false),

      // Total projects
      supabaseAdmin
        .from('projects')
        .select('*', { count: 'exact', head: true }),

      // Total project views
      supabaseAdmin
        .from('projects')
        .select('views'),

      // Top pages last 30 days
      supabaseAdmin
        .from('analytics')
        .select('page')
        .gte('created_at', thirtyDaysAgo)
        .eq('event_type', 'page_view'),

      // Daily views last 7 days (raw data)
      supabaseAdmin
        .from('analytics')
        .select('created_at')
        .eq('event_type', 'page_view')
        .gte('created_at', sevenDaysAgo)
        .order('created_at'),

      // Recent admin activity
      supabaseAdmin
        .from('admin_activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10),
    ]);

    // Calculate total project view count
    const totalProjectViews = (projectViews.data || []).reduce(
      (sum, p) => sum + (p.views || 0),
      0
    );

    // Group top pages
    const pageCount = {};
    (topPages.data || []).forEach(({ page }) => {
      pageCount[page] = (pageCount[page] || 0) + 1;
    });
    const topPagesFormatted = Object.entries(pageCount)
      .map(([page, count]) => ({ page, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Group daily views by date
    const dailyMap = {};
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000);
      const key = date.toISOString().split('T')[0];
      dailyMap[key] = 0;
    }
    (dailyViews.data || []).forEach(({ created_at }) => {
      const key = created_at.split('T')[0];
      if (dailyMap[key] !== undefined) dailyMap[key]++;
    });
    const dailyViewsFormatted = Object.entries(dailyMap).map(([date, count]) => ({
      date,
      count,
    }));

    res.json({
      success: true,
      data: {
        stats: {
          totalViews: totalViews.count || 0,
          recentViews: recentViews.count || 0,
          totalMessages: totalMessages.count || 0,
          unreadMessages: unreadMessages.count || 0,
          totalProjects: totalProjects.count || 0,
          totalProjectViews,
        },
        topPages: topPagesFormatted,
        dailyViews: dailyViewsFormatted,
        recentActivity: activityLog.data || [],
      },
    });
  } catch (err) {
    next(err);
  }
};
