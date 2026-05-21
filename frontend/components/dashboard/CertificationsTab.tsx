'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Save, X, Loader2, Award, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

const EMPTY = {
  title: '',
  issuer: '',
  issue_date: '',
  expiry_date: '',
  credential_id: '',
  credential_url: '',
  image_url: '',
};

export default function CertificationsTab() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<any>({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [imgUploading, setImgUploading] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const r = await api.get('/api/certifications');
      setItems(r.data.data || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const openNew = () => {
    setForm({ ...EMPTY });
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (item: any) => {
    setForm(item);
    setEditing(item.id);
    setShowForm(true);
  };

  const save = async () => {
    if (!form.title || !form.issuer || !form.issue_date) {
      return toast.error('Title, issuer and issue date are required');
    }
    setSaving(true);
    try {
      const payload = { ...form };
      if (editing) {
        await api.put(`/api/certifications/${editing}`, payload);
        toast.success('Certification updated!');
      } else {
        await api.post('/api/certifications', payload);
        toast.success('Certification added!');
      }
      setShowForm(false);
      setEditing(null);
      setForm({ ...EMPTY });
      fetchItems();
    } catch (e: any) {
      toast.error(e.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const uploadImage = async (file: File) => {
    setImgUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      // Note: Make sure this is the correct endpoint for certification images
      const r = await api.put('/api/about/profile-image', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // Ensure the returned key matches your API response (e.g., profile_image_url vs image_url)
      setForm((prev: any) => ({ ...prev, image_url: r.data.data.profile_image_url }));
      toast.success('Image uploaded!');
    } catch {
      toast.error('Upload failed');
    } finally {
      setImgUploading(false);
    }
  };

  const del = async (id: string) => {
    if (!confirm('Delete this certification?')) return;
    try {
      await api.delete(`/api/certifications/${id}`);
      toast.success('Deleted');
      fetchItems();
    } catch (e: any) {
      toast.error(e.message);
    }
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
        <p className="text-slate-400 text-sm">{items.length} certifications</p>
        <motion.button
          onClick={openNew}
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-accent to-electric-blue text-white text-sm font-medium"
        >
          <Plus size={14} /> Add Certification
        </motion.button>
      </div>

      {/* Grid */}
      {items.length === 0 ? (
        <div className="glass rounded-2xl p-12 border border-white/5 text-center">
          <Award size={40} className="text-emerald-accent/30 mx-auto mb-3" />
          <p className="text-slate-500 text-sm mb-4">No certifications yet</p>
          <motion.button
            onClick={openNew}
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-accent to-electric-blue text-white text-sm"
          >
            <Plus size={14} /> Add First Certification
          </motion.button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="glass rounded-2xl overflow-hidden border border-white/5 hover:border-emerald-accent/20 transition-all"
            >
              {/* Image */}
              <div className="h-36 bg-gradient-to-br from-emerald-accent/10 to-electric-blue/10 overflow-hidden relative">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Award size={40} className="text-emerald-accent opacity-20" />
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3 className="text-white text-sm font-semibold line-clamp-1 mb-1">{item.title}</h3>
                <p className="text-emerald-accent text-xs font-medium mb-1">{item.issuer}</p>
                <p className="text-slate-500 text-xs mb-3">
                  {item.issue_date}
                  {item.expiry_date && ` · Expires ${item.expiry_date}`}
                </p>

                {item.credential_url && item.credential_url !== 'NA' && (
                  /* FIXED: Added missing "<a" here */
                  <a
                    href={item.credential_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-electric-blue hover:text-neon-purple transition-colors mb-3"
                  >
                    <ExternalLink size={10} /> View Certificate
                  </a>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(item)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-electric-blue/10 text-electric-blue text-xs hover:bg-electric-blue/20 transition-all"
                  >
                    <Save size={11} /> Edit
                  </button>
                  <button
                    onClick={() => del(item.id)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-red-400/10 text-red-400 text-xs hover:bg-red-400/20 transition-all"
                  >
                    <Trash2 size={11} /> Delete
                  </button>
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
              className="glass rounded-2xl border border-emerald-accent/20 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-5 border-b border-white/5">
                <h3 className="font-display text-sm font-bold text-white">
                  {editing ? 'Edit Certification' : 'New Certification'}
                </h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Image upload */}
                <div>
                  <label className="text-xs text-slate-500 font-mono mb-1.5 block">
                    Certificate Image / Badge
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-emerald-accent/10 to-electric-blue/10 overflow-hidden border border-white/10 flex-shrink-0">
                      {form.image_url ? (
                        <img src={form.image_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Award size={28} className="text-emerald-accent opacity-30" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <label className="flex items-center gap-2 px-3 py-2 rounded-xl glass border border-emerald-accent/20 text-emerald-accent text-xs cursor-pointer hover:bg-emerald-accent/10 transition-all w-fit">
                        {imgUploading ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                        {imgUploading ? 'Uploading...' : 'Upload Image'}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={imgUploading}
                          onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])}
                        />
                      </label>
                      <p className="text-slate-600 text-xs mt-1.5">JPG, PNG, WebP supported</p>
                    </div>
                  </div>
                </div>

                {/* Fields */}
                {[
                  { key: 'title', label: 'Certificate Title *', placeholder: 'AWS Solutions Architect' },
                  { key: 'issuer', label: 'Issuer *', placeholder: 'Amazon Web Services' },
                  { key: 'issue_date', label: 'Issue Date *', placeholder: 'March 2024' },
                  { key: 'expiry_date', label: 'Expiry Date', placeholder: 'March 2027 (leave blank if no expiry)' },
                  { key: 'credential_id', label: 'Credential ID', placeholder: 'ABC-123-XYZ' },
                  { key: 'credential_url', label: 'Verify URL', placeholder: 'https://verify.credly.com/...' },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="text-xs text-slate-500 font-mono mb-1.5 block">{f.label}</label>
                    <input
                      value={form[f.key] || ''}
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                      placeholder={f.placeholder}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-accent/50 transition-colors"
                    />
                  </div>
                ))}

                <div className="flex gap-3 pt-2">
                  <motion.button
                    onClick={save}
                    disabled={saving}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-accent to-electric-blue text-white text-sm font-medium disabled:opacity-50"
                  >
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    {saving ? 'Saving...' : 'Save Certification'}
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