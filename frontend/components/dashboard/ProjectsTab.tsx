'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, Save, X, Loader2, Star, ExternalLink, Github } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

const EMPTY = {
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
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<any>({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [thumb, setThumb] = useState<File | null>(null);
  const [thumbPreview, setThumbPreview] = useState('');

  useEffect(() => { fetchProjects(); }, []);

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

  const openEdit = (p: any) => {
    setForm({
      ...p,
      tech_stack: Array.isArray(p.tech_stack)
        ? p.tech_stack.join(', ')
        : (p.tech_stack || ''),
    });
    setEditing(p.id);
    setThumb(null);
    setThumbPreview(p.thumbnail_url || '');
    setShowForm(true);
  };

  const handleThumbChange = (file: File) => {
    setThumb(file);
    setThumbPreview(URL.createObjectURL(file));
  };

  const save = async () => {
    if (!form.title) return toast.error('Title is required');
    if (!form.description) return toast.error('Description is required');

    setSaving(true);
    try {
      const fd = new FormData();

      fd.append('title', form.title || '');
      fd.append('description', form.description || '');
      fd.append('long_description', form.long_description || '');
      fd.append('github_url', form.github_url || '');
      fd.append('live_url', form.live_url || '');
      fd.append('category', form.category || 'Web');
      fd.append('status', form.status || 'completed');
      fd.append('is_featured', String(form.is_featured || false));
      fd.append('sort_order', String(form.sort_order || 0));

      // Parse tech_stack safely
      const techArray = typeof form.tech_stack === 'string'
        ? form.tech_stack.split(',').map((s: string) => s.trim()).filter(Boolean)
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
    if (!confirm('Delete this project?')) return;
    try {
      await api.delete(`/api/projects/${id}`);
      toast.success('Project deleted');
      fetchProjects();
    } catch (e: any) {
      toast.error(e.message);
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
            className="px-4 py-2 rounded-xl bg-electric-blue/10 border border-electric-blue/20 text-electric-blue text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <p className="text-slate-400 text-sm">{projects.length} projects</p>
        <motion.button
          onClick={openNew}
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-electric-blue to-neon-purple text-white text-sm font-medium"
        >
          <Plus size={14} /> New Project
        </motion.button>
      </div>

      {/* Project list */}
      {projects.length === 0 ? (
        <div className="glass rounded-2xl p-12 border border-white/5 text-center">
          <p className="text-slate-500 text-sm mb-4">No projects yet</p>
          <motion.button
            onClick={openNew}
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-electric-blue to-neon-purple text-white text-sm"
          >
            <Plus size={14} /> Add First Project
          </motion.button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {projects.map((p) => (
            <div
              key={p.id}
              className="glass rounded-2xl overflow-hidden border border-white/5 hover:border-electric-blue/20 transition-all"
            >
              {/* Thumbnail */}
              {p.thumbnail_url && (
                <div className="h-32 overflow-hidden">
                  <img
                    src={p.thumbnail_url}
                    alt={p.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-semibold text-white text-sm truncate">{p.title}</h3>
                      {p.is_featured && (
                        <Star size={11} className="text-orange-highlight fill-orange-highlight flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-electric-blue font-mono">{p.category}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        p.status === 'completed'
                          ? 'bg-emerald-accent/10 text-emerald-accent'
                          : p.status === 'in_progress'
                          ? 'bg-electric-blue/10 text-electric-blue'
                          : 'bg-slate-500/10 text-slate-400'
                      }`}>
                        {p.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-2 flex-shrink-0">
                    <button
                      onClick={() => openEdit(p)}
                      className="w-7 h-7 rounded-lg bg-electric-blue/10 flex items-center justify-center text-electric-blue hover:bg-electric-blue/20 transition-all"
                    >
                      <Edit2 size={11} />
                    </button>
                    <button
                      onClick={() => del(p.id)}
                      className="w-7 h-7 rounded-lg bg-red-400/10 flex items-center justify-center text-red-400 hover:bg-red-400/20 transition-all"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>

                <p className="text-slate-400 text-xs line-clamp-2 mb-3">{p.description}</p>

                {/* Tech stack */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {(Array.isArray(p.tech_stack) ? p.tech_stack : []).slice(0, 4).map((t: string) => (
                    <span key={t} className="px-1.5 py-0.5 rounded bg-white/5 text-slate-500 text-xs">
                      {t}
                    </span>
                  ))}
                  {(p.tech_stack?.length || 0) > 4 && (
                    <span className="px-1.5 py-0.5 rounded bg-white/5 text-slate-600 text-xs">
                      +{p.tech_stack.length - 4}
                    </span>
                  )}
                </div>

                {/* Links */}
                <div className="flex gap-3">
                  {p.github_url && p.github_url !== 'NA' && (
                    
                      href={p.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-slate-400 hover:text-electric-blue transition-colors"
                    >
                      <Github size={11} /> Code
                    </a>
                  )}
                  {p.live_url && p.live_url !== 'NA' && (
                    
                      href={p.live_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-slate-400 hover:text-neon-purple transition-colors"
                    >
                      <ExternalLink size={11} /> Live
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
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass rounded-2xl border border-electric-blue/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between p-5 border-b border-white/5 sticky top-0 glass z-10">
                <h2 className="font-display text-base font-bold text-white">
                  {editing ? 'Edit Project' : 'New Project'}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Thumbnail */}
                <div>
                  <label className="text-xs text-slate-500 font-mono mb-1.5 block">Thumbnail Image</label>
                  <div className="flex items-center gap-4">
                    {thumbPreview && (
                      <div className="w-20 h-20 rounded-xl overflow-hidden border border-white/10 flex-shrink-0">
                        <img src={thumbPreview} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <label className="flex items-center gap-2 px-3 py-2 rounded-xl glass border border-electric-blue/20 text-electric-blue text-xs cursor-pointer hover:bg-electric-blue/10 transition-all">
                      <Plus size={12} />
                      {thumbPreview ? 'Change Image' : 'Upload Image'}
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
                  <label className="text-xs text-slate-500 font-mono mb-1.5 block">Title *</label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="My Awesome Project"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-electric-blue/50 transition-colors"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs text-slate-500 font-mono mb-1.5 block">Short Description *</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Brief description shown on cards..."
                    rows={2}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-electric-blue/50 resize-none transition-colors"
                  />
                </div>

                {/* Long Description */}
                <div>
                  <label className="text-xs text-slate-500 font-mono mb-1.5 block">Full Description</label>
                  <textarea
                    value={form.long_description}
                    onChange={(e) => setForm({ ...form, long_description: e.target.value })}
                    placeholder="Detailed description shown in the project modal..."
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-electric-blue/50 resize-none transition-colors"
                  />
                </div>

                {/* Tech Stack */}
                <div>
                  <label className="text-xs text-slate-500 font-mono mb-1.5 block">Tech Stack (comma separated)</label>
                  <input
                    value={form.tech_stack}
                    onChange={(e) => setForm({ ...form, tech_stack: e.target.value })}
                    placeholder="React, Node.js, Supabase, Tailwind CSS"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-electric-blue/50 transition-colors"
                  />
                </div>

                {/* URLs */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-500 font-mono mb-1.5 block">GitHub URL</label>
                    <input
                      value={form.github_url}
                      onChange={(e) => setForm({ ...form, github_url: e.target.value })}
                      placeholder="https://github.com/..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-electric-blue/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 font-mono mb-1.5 block">Live URL</label>
                    <input
                      value={form.live_url}
                      onChange={(e) => setForm({ ...form, live_url: e.target.value })}
                      placeholder="https://..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-electric-blue/50 transition-colors"
                    />
                  </div>
                </div>

                {/* Category + Status */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-500 font-mono mb-1.5 block">Category</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-electric-blue/50 transition-colors"
                    >
                      {['Web', 'Mobile', 'AI/ML', 'Backend', 'Tool', 'Other'].map((c) => (
                        <option key={c} value={c} className="bg-deep-dark">{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 font-mono mb-1.5 block">Status</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-electric-blue/50 transition-colors"
                    >
                      <option value="completed" className="bg-deep-dark">Completed</option>
                      <option value="in_progress" className="bg-deep-dark">In Progress</option>
                      <option value="archived" className="bg-deep-dark">Archived</option>
                    </select>
                  </div>
                </div>

                {/* Featured toggle */}
                <div className="flex items-center gap-3">
                  <div
                    onClick={() => setForm({ ...form, is_featured: !form.is_featured })}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      form.is_featured ? 'bg-orange-highlight' : 'bg-white/10'
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      form.is_featured ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </div>
                  <span className="text-sm text-slate-400">Featured project</span>
                  {form.is_featured && (
                    <Star size={13} className="text-orange-highlight fill-orange-highlight" />
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 pt-2">
                  <motion.button
                    onClick={save}
                    disabled={saving}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-electric-blue to-neon-purple text-white text-sm font-medium disabled:opacity-50 transition-all"
                  >
                    {saving ? (
                      <><Loader2 size={14} className="animate-spin" /> Saving...</>
                    ) : (
                      <><Save size={14} /> {editing ? 'Update Project' : 'Create Project'}</>
                    )}
                  </motion.button>
                  <button
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2.5 rounded-xl glass border border-white/10 text-slate-400 text-sm hover:text-white transition-colors"
                  >
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
