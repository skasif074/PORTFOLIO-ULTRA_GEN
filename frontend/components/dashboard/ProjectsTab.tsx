'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, Save, X, Loader2, Star, ExternalLink, Github } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

const EMPTY = { title: '', description: '', long_description: '', tech_stack: '', github_url: '', live_url: '', category: 'Web', is_featured: false, status: 'completed' };

export default function ProjectsTab() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [thumb, setThumb] = useState<File | null>(null);

  const fetch = async () => {
    const r = await api.get('/api/projects?limit=50');
    setProjects(r.data.data);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const openNew = () => { setForm(EMPTY); setEditing(null); setThumb(null); setShowForm(true); };
  const openEdit = (p: any) => {
    setForm({ ...p, tech_stack: Array.isArray(p.tech_stack) ? p.tech_stack.join(', ') : p.tech_stack });
    setEditing(p.id); setThumb(null); setShowForm(true);
  };

  const save = async () => {
    if (!form.title || !form.description) return toast.error('Title and description required');
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'tech_stack') fd.append(k, JSON.stringify((v as string).split(',').map((s: string) => s.trim()).filter(Boolean)));
        else fd.append(k, String(v));
      });
      if (thumb) fd.append('thumbnail', thumb);

      if (editing) await api.put(`/api/projects/${editing}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      else await api.post('/api/projects', fd, { headers: { 'Content-Type': 'multipart/form-data' } });

      toast.success(editing ? 'Project updated!' : 'Project created!');
      setShowForm(false); fetch();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const del = async (id: string) => {
    if (!confirm('Delete this project?')) return;
    await api.delete(`/api/projects/${id}`);
    toast.success('Project deleted');
    fetch();
  };

  if (loading) return <div className="flex justify-center h-64 items-center"><Loader2 className="animate-spin text-electric-blue" size={28} /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-slate-400 text-sm">{projects.length} projects</p>
        <motion.button onClick={openNew} whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-electric-blue to-neon-purple text-white text-sm font-medium">
          <Plus size={14} /> New Project
        </motion.button>
      </div>

      {/* Project cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {projects.map(p => (
          <div key={p.id} className="glass rounded-2xl p-4 border border-white/5 hover:border-electric-blue/20 transition-all">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-white text-sm truncate">{p.title}</h3>
                  {p.is_featured && <Star size={12} className="text-orange-highlight fill-orange-highlight flex-shrink-0" />}
                </div>
                <span className="text-xs text-electric-blue font-mono">{p.category}</span>
              </div>
              <div className="flex gap-2 ml-2">
                <button onClick={() => openEdit(p)} className="w-7 h-7 rounded-lg bg-electric-blue/10 flex items-center justify-center text-electric-blue hover:bg-electric-blue/20 transition-all">
                  <Edit2 size={12} />
                </button>
                <button onClick={() => del(p.id)} className="w-7 h-7 rounded-lg bg-red-400/10 flex items-center justify-center text-red-400 hover:bg-red-400/20 transition-all">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
            <p className="text-slate-400 text-xs line-clamp-2 mb-3">{p.description}</p>
            <div className="flex flex-wrap gap-1">
              {p.tech_stack?.slice(0, 4).map((t: string) => (
                <span key={t} className="px-1.5 py-0.5 rounded bg-white/5 text-slate-500 text-xs">{t}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Form modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="glass rounded-2xl border border-electric-blue/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <h2 className="font-display text-base font-bold text-white">{editing ? 'Edit Project' : 'New Project'}</h2>
                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white"><X size={18} /></button>
              </div>
              <div className="p-6 space-y-4">
                {[
                  { key: 'title', label: 'Title *', placeholder: 'My Awesome Project' },
                  { key: 'github_url', label: 'GitHub URL', placeholder: 'https://github.com/...' },
                  { key: 'live_url', label: 'Live URL', placeholder: 'https://...' },
                  { key: 'tech_stack', label: 'Tech Stack (comma separated)', placeholder: 'React, Node.js, Supabase' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-xs text-slate-500 font-mono mb-1.5 block">{f.label}</label>
                    <input value={form[f.key] || ''} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                      placeholder={f.placeholder}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-electric-blue/50" />
                  </div>
                ))}

                <div>
                  <label className="text-xs text-slate-500 font-mono mb-1.5 block">Description *</label>
                  <textarea value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })}
                    rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-electric-blue/50 resize-none" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-500 font-mono mb-1.5 block">Category</label>
                    <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-electric-blue/50">
                      {['Web', 'Mobile', 'AI/ML', 'Backend', 'Tool', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 font-mono mb-1.5 block">Status</label>
                    <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-electric-blue/50">
                      <option value="completed">Completed</option>
                      <option value="in_progress">In Progress</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-500 font-mono mb-1.5 block">Thumbnail Image</label>
                  <input type="file" accept="image/*" onChange={e => setThumb(e.target.files?.[0] || null)}
                    className="w-full text-sm text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-electric-blue/10 file:text-electric-blue file:text-xs cursor-pointer" />
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <div onClick={() => setForm({ ...form, is_featured: !form.is_featured })}
                    className={`w-10 h-5 rounded-full transition-colors relative ${form.is_featured ? 'bg-orange-highlight' : 'bg-white/10'}`}>
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${form.is_featured ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </div>
                  <span className="text-sm text-slate-400">Featured project</span>
                </label>

                <div className="flex gap-3 pt-2">
                  <motion.button onClick={save} disabled={saving} whileHover={{ scale: 1.02 }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-electric-blue to-neon-purple text-white text-sm font-medium disabled:opacity-50">
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    {saving ? 'Saving...' : 'Save Project'}
                  </motion.button>
                  <button onClick={() => setShowForm(false)}
                    className="px-4 py-2.5 rounded-xl glass border border-white/10 text-slate-400 text-sm hover:text-white transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}