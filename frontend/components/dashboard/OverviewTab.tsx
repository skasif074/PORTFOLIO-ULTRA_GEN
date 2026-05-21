'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, Mail, FolderKanban, TrendingUp, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '@/lib/api';

export default function OverviewTab() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/analytics/dashboard')
      .then(r => setStats(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin text-electric-blue" size={28} />
    </div>
  );

  const cards = [
    { label: 'Total Views',    value: stats?.stats?.totalViews || 0,    icon: Eye,          color: 'text-electric-blue', bg: 'bg-electric-blue/10', border: 'border-electric-blue/20' },
    { label: 'Messages',       value: stats?.stats?.totalMessages || 0,  icon: Mail,         color: 'text-neon-purple',   bg: 'bg-neon-purple/10',   border: 'border-neon-purple/20' },
    { label: 'Projects',       value: stats?.stats?.totalProjects || 0,  icon: FolderKanban, color: 'text-cyan-glow',     bg: 'bg-cyan-glow/10',     border: 'border-cyan-glow/20' },
    { label: 'Unread Msgs',    value: stats?.stats?.unreadMessages || 0, icon: TrendingUp,   color: 'text-pink-glow',     bg: 'bg-pink-glow/10',     border: 'border-pink-glow/20' },
  ];

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`glass rounded-2xl p-5 border ${card.border}`}
          >
            <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
              <card.icon size={18} className={card.color} />
            </div>
            <p className={`font-display text-3xl font-black ${card.color}`}>{card.value}</p>
            <p className="text-slate-500 text-xs mt-1">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass rounded-2xl p-6 border border-white/5"
      >
        <h3 className="font-display text-sm font-bold text-white mb-6">Daily Views (Last 7 Days)</h3>
        {stats?.dailyViews?.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.dailyViews}>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: '#111827', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '12px', fontSize: '12px' }}
                labelStyle={{ color: '#94a3b8' }}
                itemStyle={{ color: '#3B82F6' }}
              />
              <Bar dataKey="count" fill="url(#blueGrad)" radius={[4, 4, 0, 0]} />
              <defs>
                <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-48 flex items-center justify-center text-slate-500 text-sm">
            No analytics data yet. Views will appear after visitors browse your portfolio.
          </div>
        )}
      </motion.div>

      {/* Recent activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass rounded-2xl p-6 border border-white/5"
      >
        <h3 className="font-display text-sm font-bold text-white mb-4">Recent Activity</h3>
        {stats?.recentActivity?.length > 0 ? (
          <div className="space-y-3">
            {stats.recentActivity.map((log: any) => (
              <div key={log.id} className="flex items-center gap-3 text-sm">
                <span className={`px-2 py-0.5 rounded-md text-xs font-mono ${
                  log.action === 'CREATE' ? 'bg-emerald-accent/10 text-emerald-accent' :
                  log.action === 'UPDATE' ? 'bg-electric-blue/10 text-electric-blue' :
                  'bg-red-400/10 text-red-400'
                }`}>{log.action}</span>
                <span className="text-slate-400 flex-1">{log.description}</span>
                <span className="text-slate-600 text-xs font-mono">{new Date(log.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-sm">No activity yet. Start editing your portfolio!</p>
        )}
      </motion.div>
    </div>
  );
}