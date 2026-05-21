'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, Save, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

const CATEGORIES = ['Frontend', 'Backend', 'AI/ML', 'Database', 'DevOps', 'Tools', 'Other'];
const EMPTY = { name: '', category: 'Frontend', proficiency: 80, color: '#3B82F6', is_featured: false };

export default function SkillsTab() {
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<any>(EMPTY);
  const [saving, setSaving] = useState(false);

  const fetch = async () => {
    const r = await api.get('/api/skills');
    setSkills(r.data.data);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const openNew = () => { setForm(EMPTY); setEditing(null); setShowForm(true); };
  const openEdit = (s: any) => { setForm(s); setEditing(s.id); setShowForm(true); };

  const save = async () => {
    if (!form.name) return toast.error('Skill name required');
    setSaving(true);
    try {
      if (editing) await api.put(`/api/skills/${editing}`, form);
      else await api.post('/api/skills', form);
      toast.success(editing ? 'Skill updated!' : 'Skill added!');
      setShowForm(false); fetch();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const del = async (id: string) => {
    if (!confirm('Delete this skill?')) return;
    await api.delete(`/api/skills/${id}`);
    toast.success('Skill deleted');
    fetch();
  };

  if (loading) return <div className="flex justify-center h-64 items-center"><Loader2 className="animate-spin text-electric-blue" size={28} /></div>;

  const grouped = skills.reduce((acc: any, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-slate-400 text-sm">{skills.length} skills</p>
        <motion.button onClick={openNew} whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-electric-blue to-neon-purple text-white text-sm font-medium">
          <Plus size={14} /> Add Skill
        </motion.button>
      </div>

      {Object.entries(grouped).map(([cat, catSkills]: any) => (
        <div key={cat} className="glass rounded-2xl p-5 border border-white/5">
          <h3 className="font-display text-xs font-bold text-electric-blue uppercase tracking-widest mb-4">{cat}</h3>
          <div className="space-y-3">
            {catSkills.map((skill: any) => (
              <div key={skill.id} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{ background: `${skill.color}20`, color: skill.color }}>
                  {skill.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white font-medium">{skill.name}</span>
                    <span className="text-xs font-mono" style={{ color: skill.color }}>{skill.proficiency}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${skill.proficiency}%`, background: `linear-gradient(90deg, ${skill.color}80, ${skill.color})` }} />
                  </div>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <button onClick={() => openEdit(skill)} className="w-7 h-7 rounded-lg bg-electric-blue/10 flex items-center justify-center text-electric-blue hover:bg-electric-blue/20 transition-all">
                    <Edit2 size={11} />
                  </button>
                  <button onClick={() => del(skill.id)} className="w-7 h-7 rounded-lg bg-red-400/10 flex items-center justify-center text-red-400 hover:bg-red-400/20 transition-all">
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {skills.length === 0 && (
        <div className="glass rounded-2xl p-12 border border-white/5 text-center">
          <p className="text-slate-500 text-sm">No skills yet. Add your first skill!</p>
        </div>
      )}

      {/* Form modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="glass rounded-2xl border border-electric-blue/20 w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <h2 className="font-display text-base font-bold text-white">{editing ? 'Edit Skill' : 'Add Skill'}</h2>
                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white"><X size={18} /></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-xs text-slate-500 font-mono mb-1.5 block">Skill Name *</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. React, Python, Docker"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-electric-blue/50" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 font-mono mb-1.5 block">Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-electric-blue/50">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500 font-mono mb-1.5 block">Proficiency: {form.proficiency}%</label>
                  <input type="range" min={0} max={100} value={form.proficiency}
                    onChange={e => setForm({ ...form, proficiency: parseInt(e.target.value) })}
                    className="w-full accent-electric-blue" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 font-mono mb-1.5 block">Color</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })}
                      className="w-10 h-10 rounded-lg border-0 bg-transparent cursor-pointer" />
                    <span className="text-sm text-slate-400 font-mono">{form.color}</span>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <motion.button onClick={save} disabled={saving} whileHover={{ scale: 1.02 }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-electric-blue to-neon-purple text-white text-sm font-medium disabled:opacity-50">
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    {saving ? 'Saving...' : 'Save Skill'}
                  </motion.button>
                  <button onClick={() => setShowForm(false)}
                    className="px-4 py-2.5 rounded-xl glass border border-white/10 text-slate-400 text-sm">Cancel</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}