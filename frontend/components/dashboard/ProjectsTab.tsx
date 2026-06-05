'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, Save, X, Loader2, Star, ExternalLink, Github } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

interface Project {
  id: string;
  title: string;
  description: string;
  long_description?: string;
  tech_stack: string[];
  github_url?: string;
  live_url?: string;
  category: string;
  is_featured: boolean;
  status: 'completed' | 'in_progress' | 'archived';
  sort_order: number;
  thumbnail_url?: string;
}

interface ProjectForm {
  title: string;
  description: string;
  long_description: string;
  tech_stack: string | string[];
  github_url: string;
  live_url: string;
  category: string;
  is_featured: boolean;
  status: string;
  sort_order: number;
}

const EMPTY: ProjectForm = {
  title: '',
  description: '',
  long_description: '',
  tech_stack: '',
  github_url: '',
  live_url: '',
  category: 'Web',
  is_featured: false,
  status: 'completed',
  sort_order: 0,
};

export default function ProjectsTab() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<ProjectForm>({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [thumb, setThumb] = useState<File | null>(null);
  const [thumbPreview, setThumbPreview] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    setError('');
    try {
      const r = await api.get('/api/projects?limit=50');
      setProjects(r.data.data || []);
    } catch (e: any) {
      setError(e.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const openNew = () => {
    setForm({ ...EMPTY });
    setEditing(null);
    setThumb(null);
    setThumbPreview('');
    setShowForm(true);
  };

  const openEdit = (p: Project) => {
    // Explicitly mapping fields resolves the TS error and prevents excess properties (like id) from entering the form state
    setForm({
      title: p.title,
      description: p.description,
      long_description: p.long_description || '',
      tech_stack: Array.isArray(p.tech_stack) ? p.tech_stack.join(', ') : (p.tech_stack || ''),
      github_url: p.github_url || '',
      live_url: p.live_url || '',
      category: p.category,
      is_featured: p.is_featured,
      status: p.status,
      sort_order: p.sort_order,
    });
    setEditing(p.id);
    setThumb(null);
    setThumbPreview(p.thumbnail_url || '');
    setShowForm(true);
  };

  const handleThumbChange = (file: File) => {
    setThumb(file);
    if (thumbPreview && !thumbPreview.startsWith('http')) {
      URL.revokeObjectURL(thumbPreview); // Cleanup old object URL
    }
    setThumbPreview(URL.createObjectURL(file));
  };

  const save = async () => {
    if (!form.title) return toast.error('Title is required');
    if (!form.description) return toast.error('Description is required');

    setSaving(true);
    try {
      const fd = new FormData();

      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('long_description', form.long_description);
      fd.append('github_url', form.github_url);
      fd.append('live_url', form.live_url);
      fd.append('category', form.category);
      fd.append('status', form.status);
      fd.append('is_featured', String(form.is_featured));
      fd.append('sort_order', String(form.sort_order));

      // Parse tech_stack safely into an array
      const techArray = typeof form.tech_stack === 'string'
        ? form.tech_stack.split(',').map((s) => s.trim()).filter(Boolean)
        : (Array.isArray(form.tech_stack) ? form.tech_stack : []);
        
      fd.append('tech_stack', JSON.stringify(techArray));
      fd.append('screenshots', JSON.stringify([]));

      if (thumb) fd.append('thumbnail', thumb);

      if (editing) {
        await api.put(`/api/projects/${editing}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Project updated!');
      } else {
        await api.post('/api/projects', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Project created!');
      }

      setShowForm(false);
      setEditing(null);
      setForm({ ...EMPTY });
      setThumb(null);
      setThumbPreview('');
      fetchProjects();
    } catch (e: any) {
      toast.error(e.message || 'Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  const del = async (id: string) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await api.delete(`/api/projects/${id}`);
      toast.success('Project deleted');
      fetchProjects();
    } catch (e: any) {
      toast.error(e.message || 'Failed to delete project');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center h-64 items-center gap-3">
        <Loader2 className="animate-spin text-electric-blue" size={28} />
        <p className="text-slate-500 text-xs font-mono">Loading projects...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center h-64 items-center gap-4">
        <div className="glass rounded-2xl p-6 border border-red-400/20 text-center max-w-md">
          <p className="text-red-400 text-sm font-medium mb-2">Failed to load projects</p>
          <p className="text-slate-500 text-xs mb-4 font-mono">{error}</p>
          <button
            onClick={fetchProjects}
            className="px-4 py-2 rounded-xl bg-electric-blue/10 border border-electric-blue/20 text-electric-blue text-sm hover:bg-electric-blue/20 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-200">
      {/* Header */}
      <div className="flex justify-between items-center">
        <p className="text-slate-400 text-sm font-mono">{projects.length} projects</p>
        <motion.button
          onClick={openNew}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-electric-blue to-neon-purple text-white text-sm font-medium shadow-lg shadow-electric-blue/20"
        >
          <Plus size={14} /> New Project
        </motion.button>
      </div>

      {/* Project list */}
      {projects.length === 0 ? (
        <div className="glass rounded-2xl p-12 border border-white/5 text-center">
          <p className="text-slate-500 text-sm mb-4">No projects yet in the database.</p>
          <motion.button
            onClick={openNew}
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-electric-blue to-neon-purple text-white text-sm shadow-lg shadow-neon-purple/20"
          >
            <Plus size={14} /> Add First Project
          </motion.button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {projects.map((p) => (
            <div
              key={p.id}
              className="glass rounded-2xl overflow-hidden border border-white/5 hover:border-electric-blue/40 transition-all duration-300 group"
            >
              {/* Thumbnail */}
              {p.thumbnail_url && (
                <div className="h-32 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent z-10" />
                  <img
                    src={p.thumbnail_url}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}

              <div className="p-4 relative z-20 -mt-2">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-semibold text-white text-sm truncate">{p.title}</h3>
                      {p.is_featured && (
                        <Star size={12} className="text-orange-500 fill-orange-500 flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-electric-blue font-mono uppercase tracking-wider">{p.category}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium uppercase tracking-wider ${
                        p.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : p.status === 'in_progress'
                          ? 'bg-electric-blue/10 text-electric-blue border border-electric-blue/20'
                          : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                      }`}>
                        {p.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-2 flex-shrink-0">
                    <button
                      onClick={() => openEdit(p)}
                      className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-electric-blue hover:bg-electric-blue/10 hover:border-electric-blue/30 transition-all"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={() => del(p.id)}
                      className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-red-400 hover:bg-red-400/10 hover:border-red-400/30 transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                <p className="text-slate-400 text-xs line-clamp-2 mb-4 leading-relaxed">{p.description}</p>

                {/* Tech stack */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {(Array.isArray(p.tech_stack) ? p.tech_stack : []).slice(0, 4).map((t) => (
                    <span key={t} className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-slate-300 text-[10px] font-mono">
                      {t}
                    </span>
                  ))}
                  {(p.tech_stack?.length || 0) > 4 && (
                    <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-slate-400 text-[10px] font-mono">
                      +{p.tech_stack.length - 4}
                    </span>
                  )}
                </div>

                {/* Links */}
                <div className="flex gap-4 pt-2 border-t border-white/5">
                  {p.github_url && p.github_url !== 'NA' && (
                    <a
                      href={p.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-electric-blue transition-colors font-medium"
                    >
                      <Github size={12} /> Code
                    </a>
                  )}
                  {p.live_url && p.live_url !== 'NA' && (
                    <a
                      href={p.live_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-neon-purple transition-colors font-medium"
                    >
                      <ExternalLink size={12} /> Live
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="glass rounded-2xl border border-electric-blue/30 shadow-2xl shadow-electric-blue/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between p-5 border-b border-white/10 sticky top-0 glass z-10">
                <h2 className="font-display text-base font-bold text-white tracking-wide">
                  {editing ? 'Update Protocol' : 'Initialize New Project'}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Thumbnail */}
                <div>
                  <label className="text-xs text-electric-blue font-mono uppercase tracking-wider mb-2 block">Visual Assets</label>
                  <div className="flex items-center gap-4">
                    {thumbPreview && (
                      <div className="w-24 h-24 rounded-xl overflow-hidden border border-white/10 shadow-inner flex-shrink-0">
                        <img src={thumbPreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-sm cursor-pointer hover:bg-electric-blue/10 hover:border-electric-blue/30 hover:text-electric-blue transition-all">
                      <Plus size={14} />
                      {thumbPreview ? 'Replace Image' : 'Upload Thumbnail'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleThumbChange(e.target.files[0])}
                      />
                    </label>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="text-xs text-electric-blue font-mono uppercase tracking-wider mb-2 block">Project Designation *</label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. SmartShelfX"
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-electric-blue/60 focus:ring-1 focus:ring-electric-blue/60 transition-all"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs text-electric-blue font-mono uppercase tracking-wider mb-2 block">Brief Overview *</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="A short punchy description..."
                    rows={2}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-electric-blue/60 focus:ring-1 focus:ring-electric-blue/60 resize-none transition-all"
                  />
                </div>

                {/* Long Description */}
                <div>
                  <label className="text-xs text-electric-blue font-mono uppercase tracking-wider mb-2 block">Detailed Specifications</label>
                  <textarea
                    value={form.long_description}
                    onChange={(e) => setForm({ ...form, long_description: e.target.value })}
                    placeholder="Full technical details and architecture..."
                    rows={4}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-electric-blue/60 focus:ring-1 focus:ring-electric-blue/60 resize-none transition-all"
                  />
                </div>

                {/* Tech Stack */}
                <div>
                  <label className="text-xs text-electric-blue font-mono uppercase tracking-wider mb-2 block">Technology Stack</label>
                  <input
                    value={form.tech_stack}
                    onChange={(e) => setForm({ ...form, tech_stack: e.target.value })}
                    placeholder="React, Spring Boot, MongoDB, Tailwind (comma separated)"
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-electric-blue/60 focus:ring-1 focus:ring-electric-blue/60 transition-all font-mono"
                  />
                </div>

                {/* URLs */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-electric-blue font-mono uppercase tracking-wider mb-2 block">Repository URL</label>
                    <input
                      value={form.github_url}
                      onChange={(e) => setForm({ ...form, github_url: e.target.value })}
                      placeholder="https://github.com/..."
                      className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-electric-blue/60 focus:ring-1 focus:ring-electric-blue/60 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-electric-blue font-mono uppercase tracking-wider mb-2 block">Deployment URL</label>
                    <input
                      value={form.live_url}
                      onChange={(e) => setForm({ ...form, live_url: e.target.value })}
                      placeholder="https://..."
                      className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-electric-blue/60 focus:ring-1 focus:ring-electric-blue/60 transition-all"
                    />
                  </div>
                </div>

                {/* Category + Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-electric-blue font-mono uppercase tracking-wider mb-2 block">Classification</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-electric-blue/60 focus:ring-1 focus:ring-electric-blue/60 transition-all appearance-none"
                    >
                      {['Web', 'Mobile', 'AI/ML', 'Backend', 'Tool', 'Hardware', 'Other'].map((c) => (
                        <option key={c} value={c} className="bg-slate-900">{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-electric-blue font-mono uppercase tracking-wider mb-2 block">Current Status</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                      className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-electric-blue/60 focus:ring-1 focus:ring-electric-blue/60 transition-all appearance-none"
                    >
                      <option value="completed" className="bg-slate-900">Completed</option>
                      <option value="in_progress" className="bg-slate-900">In Progress</option>
                      <option value="archived" className="bg-slate-900">Archived</option>
                    </select>
                  </div>
                </div>

                {/* Featured toggle */}
                <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                  <div
                    onClick={() => setForm({ ...form, is_featured: !form.is_featured })}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                      form.is_featured ? 'bg-orange-500' : 'bg-slate-700'
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform shadow-sm ${
                      form.is_featured ? 'translate-x-7' : 'translate-x-1'
                    }`} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-white flex items-center gap-1.5">
                      Highlight Project {form.is_featured && <Star size={12} className="text-orange-400 fill-orange-400" />}
                    </span>
                    <span className="text-[10px] text-slate-400">Display prominently on main portfolio view</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 pt-4 border-t border-white/10 mt-6">
                  <motion.button
                    onClick={save}
                    disabled={saving}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-electric-blue to-neon-purple text-white text-sm font-bold tracking-wide disabled:opacity-50 transition-all shadow-lg shadow-electric-blue/20"
                  >
                    {saving ? (
                      <><Loader2 size={16} className="animate-spin" /> Transmitting...</>
                    ) : (
                      <><Save size={16} /> {editing ? 'Update Database' : 'Execute Creation'}</>
                    )}
                  </motion.button>
                  <button
                    onClick={() => setShowForm(false)}
                    className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-sm font-medium hover:bg-white/10 hover:text-white transition-all"
                  >
                    Abort
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
