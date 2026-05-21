'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Save, X, Loader2, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

const EMPTY = { title: '', description: '', icon: '🏆', date: '', photos: [] as string[] };

export default function AchievementsTab() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<any>({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try {
      const r = await api.get('/api/achievements');
      setItems(r.data.data || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const openNew = () => {
    setForm({ ...EMPTY, photos: [] });
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (item: any) => {
    setForm({ ...item, photos: item.photos || [] });
    setEditing(item.id);
    setShowForm(true);
  };

  const save = async () => {
    if (!form.title) return toast.error('Title is required');
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/api/achievements/${editing}`, form);
        toast.success('Achievement updated!');
      } else {
        await api.post('/api/achievements', form);
        toast.success('Achievement added!');
      }
      setShowForm(false);
      setEditing(null);
      setForm({ ...EMPTY, photos: [] });
      fetchItems();
    } catch (e: any) {
      toast.error(e.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const del = async (id: string) => {
    if (!confirm('Delete this achievement?')) return;
    try {
      await api.delete(`/api/achievements/${id}`);
      toast.success('Deleted');
      fetchItems();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const uploadPhotos = async (files: FileList) => {
    setPhotoUploading(true);
    const uploaded: string[] = [];
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append('image', file);
        const r = await api.put('/api/about/profile-image', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        uploaded.push(r.data.data.profile_image_url);
      }
      setForm((prev: any) => ({
        ...prev,
        photos: [...(prev.photos || []), ...uploaded],
      }));
      toast.success(`${uploaded.length} photo(s) uploaded`);
    } catch {
      toast.error('Some photos failed to upload');
    } finally {
      setPhotoUploading(false);
    }
  };

  const removePhoto = (idx: number) => {
    setForm((prev: any) => ({
      ...prev,
      photos: prev.photos.filter((_: string, i: number) => i !== idx),
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center h-64 items-center">
        <Loader2 className="animate-spin text-electric-blue" size={28} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-slate-400 text-sm">{items.length} achievements</p>
        <motion.button
          onClick={openNew}
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-electric-blue to-neon-purple text-white text-sm font-medium"
        >
          <Plus size={14} /> Add Achievement
        </motion.button>
      </div>

      {/* List */}
      {items.length === 0 ? (
        <div className="glass rounded-2xl p-12 border border-white/5 text-center">
          <Trophy size={40} className="text-orange-highlight/30 mx-auto mb-3" />
          <p className="text-slate-500 text-sm mb-4">No achievements yet</p>
          <motion.button
            onClick={openNew}
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-electric-blue to-neon-purple text-white text-sm"
          >
            <Plus size={14} /> Add First Achievement
          </motion.button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {items.map((item) => (
            <div key={item.id} className="glass rounded-2xl p-5 border border-white/5 hover:border-orange-highlight/20 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{item.icon}</span>
                  <div>
                    <h3 className="text-white font-semibold text-sm">{item.title}</h3>
                    {item.date && <p className="text-orange-highlight text-xs">{item.date}</p>}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => openEdit(item)}
                    className="w-7 h-7 rounded-lg bg-electric-blue/10 flex items-center justify-center text-electric-blue hover:bg-electric-blue/20 transition-all"
                  >
                    <Save size={11} />
                  </button>
                  <button
                    onClick={() => del(item.id)}
                    className="w-7 h-7 rounded-lg bg-red-400/10 flex items-center justify-center text-red-400 hover:bg-red-400/20 transition-all"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>

              {item.description && (
                <p className="text-slate-400 text-xs leading-relaxed mb-3 line-clamp-2">
                  {item.description}
                </p>
              )}

              {item.photos?.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {item.photos.slice(0, 5).map((p: string, i: number) => (
                    <img
                      key={i}
                      src={p}
                      alt=""
                      className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-white/10"
                    />
                  ))}
                  {item.photos.length > 5 && (
                    <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 text-xs flex-shrink-0 border border-white/10">
                      +{item.photos.length - 5}
                    </div>
                  )}
                </div>
              )}
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
              className="glass rounded-2xl border border-orange-highlight/20 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-5 border-b border-white/5">
                <h3 className="font-display text-sm font-bold text-white">
                  {editing ? 'Edit Achievement' : 'New Achievement'}
                </h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-500 font-mono mb-1.5 block">Title *</label>
                    <input
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="Won Hackathon"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-highlight/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 font-mono mb-1.5 block">Emoji Icon</label>
                    <input
                      value={form.icon}
                      onChange={(e) => setForm({ ...form, icon: e.target.value })}
                      placeholder="🏆"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-highlight/50 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-500 font-mono mb-1.5 block">Date</label>
                  <input
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    placeholder="March 2024"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-highlight/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-500 font-mono mb-1.5 block">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Describe this achievement..."
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-highlight/50 resize-none transition-colors"
                  />
                </div>

                {/* Photo upload */}
                <div>
                  <label className="text-xs text-slate-500 font-mono mb-1.5 block">
                    Photos {form.photos?.length > 0 && `(${form.photos.length} uploaded)`}
                  </label>
                  <label className={`flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed transition-all cursor-pointer ${
                    photoUploading
                      ? 'border-orange-highlight/30 bg-orange-highlight/5'
                      : 'border-white/10 hover:border-orange-highlight/30 hover:bg-orange-highlight/5'
                  }`}>
                    {photoUploading ? (
                      <>
                        <Loader2 size={20} className="animate-spin text-orange-highlight" />
                        <p className="text-xs text-slate-400">Uploading...</p>
                      </>
                    ) : (
                      <>
                        <Plus size={20} className="text-slate-400" />
                        <p className="text-xs text-slate-300 font-medium">Click to upload photos</p>
                        <p className="text-xs text-slate-600">Multiple files supported · JPG, PNG, WebP</p>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      disabled={photoUploading}
                      onChange={(e) => e.target.files && uploadPhotos(e.target.files)}
                    />
                  </label>

                  {/* Photo previews */}
                  {form.photos?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {form.photos.map((p: string, i: number) => (
                        <div key={i} className="relative group">
                          <img
                            src={p}
                            alt=""
                            className="w-16 h-16 rounded-xl object-cover border border-white/10"
                          />
                          <button
                            onClick={() => removePhoto(i)}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-400 rounded-full flex items-center justify-center text-white text-xs hover:bg-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <motion.button
                    onClick={save}
                    disabled={saving}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-orange-highlight to-pink-glow text-white text-sm font-medium disabled:opacity-50"
                  >
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    {saving ? 'Saving...' : 'Save Achievement'}
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