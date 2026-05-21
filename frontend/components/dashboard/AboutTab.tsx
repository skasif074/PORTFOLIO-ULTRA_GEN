'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Plus, Trash2, Loader2, Upload, User, Briefcase, GraduationCap, Link2, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'experience', label: 'Experience', icon: Briefcase },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'social', label: 'Social Links', icon: Link2 },
  { id: 'achievements', label: 'Achievements', icon: Trophy },
];

const EMPTY_EXP = { company: '', role: '', description: '', start_date: '', end_date: 'Present', is_current: false, location: '', technologies: '' };
const EMPTY_EDU = { institution: '', degree: '', field: '', start_date: '', end_date: 'Present', is_current: false, gpa: '', description: '' };
const EMPTY_SOCIAL = { platform: '', url: '', icon: '', is_visible: true };
const EMPTY_ACHIEVEMENT = { title: '', description: '', icon: '🏆', date: '', photos: [] };

export default function AboutTab() {
  const [activeTab, setActiveTab] = useState('profile');
  const [about, setAbout] = useState<any>(null);
  const [experience, setExperience] = useState<any[]>([]);
  const [education, setEducation] = useState<any[]>([]);
  const [socialLinks, setSocialLinks] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imgUploading, setImgUploading] = useState(false);

  // Forms
  const [expForm, setExpForm] = useState<any>(EMPTY_EXP);
  const [expEditing, setExpEditing] = useState<string | null>(null);
  const [showExpForm, setShowExpForm] = useState(false);

  const [eduForm, setEduForm] = useState<any>(EMPTY_EDU);
  const [eduEditing, setEduEditing] = useState<string | null>(null);
  const [showEduForm, setShowEduForm] = useState(false);

  const [socialForm, setSocialForm] = useState<any>(EMPTY_SOCIAL);
  const [socialEditing, setSocialEditing] = useState<string | null>(null);
  const [showSocialForm, setShowSocialForm] = useState(false);

  const [achieveForm, setAchieveForm] = useState<any>(EMPTY_ACHIEVEMENT);
  const [achieveEditing, setAchieveEditing] = useState<string | null>(null);
  const [showAchieveForm, setShowAchieveForm] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const r = await api.get('/api/about');
      const data = r.data.data;
      setAbout(data);
      setExperience(data.experience || []);
      setEducation(data.education || []);
      setSocialLinks(data.social_links || []);
      setAchievements(data.achievements || []);
    } catch { } finally { setLoading(false); }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      await api.put('/api/about', about);
      toast.success('Profile saved!');
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const uploadImage = async (file: File) => {
    setImgUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const r = await api.put('/api/about/profile-image', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setAbout((prev: any) => ({ ...prev, profile_image_url: r.data.data.profile_image_url }));
      toast.success('Profile image updated!');
    } catch (e: any) { toast.error(e.message); }
    finally { setImgUploading(false); }
  };

  // Experience CRUD
  const saveExp = async () => {
    if (!expForm.company || !expForm.role) return toast.error('Company and role required');
    setSaving(true);
    try {
      const payload = { ...expForm, technologies: typeof expForm.technologies === 'string' ? expForm.technologies.split(',').map((s: string) => s.trim()).filter(Boolean) : expForm.technologies };
      if (expEditing) { await api.put(`/api/about/experience/${expEditing}`, payload); toast.success('Experience updated!'); }
      else { await api.post('/api/about/experience', payload); toast.success('Experience added!'); }
      setShowExpForm(false); setExpEditing(null); setExpForm(EMPTY_EXP); fetchAll();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const deleteExp = async (id: string) => {
    if (!confirm('Delete this experience?')) return;
    await api.delete(`/api/about/experience/${id}`);
    toast.success('Deleted'); fetchAll();
  };

  // Education CRUD
  const saveEdu = async () => {
    if (!eduForm.institution || !eduForm.degree) return toast.error('Institution and degree required');
    setSaving(true);
    try {
      if (eduEditing) { await api.put(`/api/about/education/${eduEditing}`, eduForm); toast.success('Education updated!'); }
      else { await api.post('/api/about/education', eduForm); toast.success('Education added!'); }
      setShowEduForm(false); setEduEditing(null); setEduForm(EMPTY_EDU); fetchAll();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const deleteEdu = async (id: string) => {
    if (!confirm('Delete this education?')) return;
    await api.delete(`/api/about/education/${id}`);
    toast.success('Deleted'); fetchAll();
  };

  // Social CRUD
  const saveSocial = async () => {
    if (!socialForm.platform || !socialForm.url) return toast.error('Platform and URL required');
    setSaving(true);
    try {
      const links = socialEditing
        ? socialLinks.map((l) => l.id === socialEditing ? { ...l, ...socialForm } : l)
        : [...socialLinks, socialForm];
      await api.put('/api/social', { links });
      toast.success('Social links saved!');
      setShowSocialForm(false); setSocialEditing(null); setSocialForm(EMPTY_SOCIAL); fetchAll();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const deleteSocial = async (id: string) => {
    if (!confirm('Delete this link?')) return;
    await api.delete(`/api/social/${id}`);
    toast.success('Deleted'); fetchAll();
  };

  // Achievements CRUD
  const saveAchieve = async () => {
    if (!achieveForm.title) return toast.error('Title required');
    setSaving(true);
    try {
      if (achieveEditing) { await api.put(`/api/achievements/${achieveEditing}`, achieveForm); toast.success('Updated!'); }
      else { await api.post('/api/achievements', achieveForm); toast.success('Added!'); }
      setShowAchieveForm(false); setAchieveEditing(null); setAchieveForm(EMPTY_ACHIEVEMENT); fetchAll();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const deleteAchieve = async (id: string) => {
    if (!confirm('Delete?')) return;
    await api.delete(`/api/achievements/${id}`);
    toast.success('Deleted'); fetchAll();
  };

  if (loading) return (
    <div className="flex justify-center h-64 items-center">
      <Loader2 className="animate-spin text-electric-blue" size={28} />
    </div>
  );

  return (
    <div className="space-y-4 max-w-3xl">
      {/* Sub tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            whileHover={{ scale: 1.03 }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-electric-blue to-neon-purple text-white'
                : 'glass text-slate-400 border border-white/5 hover:text-white'
            }`}
          >
            <tab.icon size={12} />
            {tab.label}
          </motion.button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="glass rounded-2xl p-6 border border-white/5 space-y-4">
          {/* Profile image */}
          <div className="flex items-center gap-4 pb-4 border-b border-white/5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-electric-blue/20 to-neon-purple/20 overflow-hidden border border-white/10 flex-shrink-0">
              {about?.profile_image_url
                ? <img src={about.profile_image_url} className="w-full h-full object-cover" alt="profile" />
                : <div className="w-full h-full flex items-center justify-center text-xl font-display font-black gradient-text">SK</div>}
            </div>
            <label className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-electric-blue/20 text-electric-blue text-sm cursor-pointer hover:bg-electric-blue/10 transition-all">
              {imgUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              {imgUploading ? 'Uploading...' : 'Upload Photo'}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])} />
            </label>
          </div>

          {/* Fields */}
          {[
            { key: 'name', label: 'Full Name', placeholder: 'SK Asif Hossain' },
            { key: 'title', label: 'Job Title', placeholder: 'Full Stack Developer' },
            { key: 'tagline', label: 'Tagline', placeholder: 'Building the future...' },
            { key: 'location', label: 'Location', placeholder: 'India' },
            { key: 'email', label: 'Email', placeholder: 'your@email.com' },
            { key: 'phone', label: 'Phone', placeholder: '+91 ...' },
          ].map((f) => (
            <div key={f.key}>
              <label className="text-xs text-slate-500 font-mono mb-1.5 block">{f.label}</label>
              <input
                value={about?.[f.key] || ''}
                onChange={(e) => setAbout({ ...about, [f.key]: e.target.value })}
                placeholder={f.placeholder}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-electric-blue/50"
              />
            </div>
          ))}

          <div>
            <label className="text-xs text-slate-500 font-mono mb-1.5 block">Bio</label>
            <textarea value={about?.bio || ''} onChange={(e) => setAbout({ ...about, bio: e.target.value })} rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-electric-blue/50 resize-none" />
          </div>

          <div>
            <label className="text-xs text-slate-500 font-mono mb-1.5 block">Career Goal</label>
            <textarea value={about?.career_goal || ''} onChange={(e) => setAbout({ ...about, career_goal: e.target.value })} rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-electric-blue/50 resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-500 font-mono mb-1.5 block">Years of Experience</label>
              <input type="number" value={about?.years_of_experience || 0}
                onChange={(e) => setAbout({ ...about, years_of_experience: parseInt(e.target.value) })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-electric-blue/50" />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-3 cursor-pointer">
                <div onClick={() => setAbout({ ...about, available_for_work: !about?.available_for_work })}
                  className={`w-12 h-6 rounded-full transition-colors relative ${about?.available_for_work ? 'bg-emerald-accent' : 'bg-white/10'}`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${about?.available_for_work ? 'translate-x-7' : 'translate-x-1'}`} />
                </div>
                <span className="text-sm text-slate-400">Available for work</span>
              </label>
            </div>
          </div>

          <motion.button onClick={saveProfile} disabled={saving} whileHover={{ scale: 1.02 }}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-electric-blue to-neon-purple text-white text-sm font-medium disabled:opacity-50">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? 'Saving...' : 'Save Profile'}
          </motion.button>
        </div>
      )}

      {/* Experience Tab */}
      {activeTab === 'experience' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-slate-400 text-sm">{experience.length} entries</p>
            <motion.button onClick={() => { setExpForm(EMPTY_EXP); setExpEditing(null); setShowExpForm(true); }}
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-electric-blue to-neon-purple text-white text-sm font-medium">
              <Plus size={14} /> Add Experience
            </motion.button>
          </div>

          {experience.map((exp) => (
            <div key={exp.id} className="glass rounded-xl p-4 border border-white/5">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="text-white text-sm font-semibold">{exp.role}</h4>
                  <p className="text-electric-blue text-xs">{exp.company}</p>
                  <p className="text-slate-500 text-xs">{exp.start_date} — {exp.end_date}</p>
                  {exp.description && <p className="text-slate-400 text-xs mt-1 line-clamp-2">{exp.description}</p>}
                </div>
                <div className="flex gap-2 ml-2">
                  <button onClick={() => { setExpForm({ ...exp, technologies: Array.isArray(exp.technologies) ? exp.technologies.join(', ') : exp.technologies }); setExpEditing(exp.id); setShowExpForm(true); }}
                    className="w-7 h-7 rounded-lg bg-electric-blue/10 flex items-center justify-center text-electric-blue hover:bg-electric-blue/20 transition-all">
                    <Save size={11} />
                  </button>
                  <button onClick={() => deleteExp(exp.id)}
                    className="w-7 h-7 rounded-lg bg-red-400/10 flex items-center justify-center text-red-400 hover:bg-red-400/20 transition-all">
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {experience.length === 0 && (
            <div className="glass rounded-xl p-8 border border-white/5 text-center">
              <p className="text-slate-500 text-sm">No experience added yet</p>
            </div>
          )}

          {/* Experience Form Modal */}
          <AnimatePresence>
            {showExpForm && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                  className="glass rounded-2xl border border-electric-blue/20 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between p-5 border-b border-white/5">
                    <h3 className="font-display text-sm font-bold text-white">{expEditing ? 'Edit Experience' : 'Add Experience'}</h3>
                    <button onClick={() => setShowExpForm(false)} className="text-slate-400 hover:text-white"><Plus size={18} className="rotate-45" /></button>
                  </div>
                  <div className="p-5 space-y-3">
                    {[
                      { key: 'company', label: 'Company *', placeholder: 'Google' },
                      { key: 'role', label: 'Role *', placeholder: 'Software Engineer' },
                      { key: 'location', label: 'Location', placeholder: 'Remote' },
                      { key: 'start_date', label: 'Start Date', placeholder: '2023' },
                      { key: 'end_date', label: 'End Date', placeholder: 'Present' },
                      { key: 'technologies', label: 'Technologies (comma separated)', placeholder: 'React, Node.js, AWS' },
                    ].map((f) => (
                      <div key={f.key}>
                        <label className="text-xs text-slate-500 font-mono mb-1 block">{f.label}</label>
                        <input value={expForm[f.key] || ''} onChange={(e) => setExpForm({ ...expForm, [f.key]: e.target.value })}
                          placeholder={f.placeholder}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-electric-blue/50" />
                      </div>
                    ))}
                    <div>
                      <label className="text-xs text-slate-500 font-mono mb-1 block">Description</label>
                      <textarea value={expForm.description || ''} onChange={(e) => setExpForm({ ...expForm, description: e.target.value })} rows={3}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-electric-blue/50 resize-none" />
                    </div>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div onClick={() => setExpForm({ ...expForm, is_current: !expForm.is_current })}
                        className={`w-10 h-5 rounded-full transition-colors relative ${expForm.is_current ? 'bg-emerald-accent' : 'bg-white/10'}`}>
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${expForm.is_current ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </div>
                      <span className="text-sm text-slate-400">Currently working here</span>
                    </label>
                    <div className="flex gap-3 pt-2">
                      <motion.button onClick={saveExp} disabled={saving} whileHover={{ scale: 1.02 }}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-electric-blue to-neon-purple text-white text-sm font-medium disabled:opacity-50">
                        {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        {saving ? 'Saving...' : 'Save'}
                      </motion.button>
                      <button onClick={() => setShowExpForm(false)} className="px-4 py-2.5 rounded-xl glass border border-white/10 text-slate-400 text-sm">Cancel</button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Education Tab */}
      {activeTab === 'education' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-slate-400 text-sm">{education.length} entries</p>
            <motion.button onClick={() => { setEduForm(EMPTY_EDU); setEduEditing(null); setShowEduForm(true); }}
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-electric-blue to-neon-purple text-white text-sm font-medium">
              <Plus size={14} /> Add Education
            </motion.button>
          </div>

          {education.map((edu) => (
            <div key={edu.id} className="glass rounded-xl p-4 border border-white/5">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="text-white text-sm font-semibold">{edu.degree}</h4>
                  <p className="text-neon-purple text-xs">{edu.institution}</p>
                  {edu.field && <p className="text-slate-400 text-xs">{edu.field}</p>}
                  <p className="text-slate-500 text-xs">{edu.start_date} — {edu.end_date}</p>
                  {edu.gpa && <p className="text-emerald-accent text-xs">GPA: {edu.gpa}</p>}
                </div>
                <div className="flex gap-2 ml-2">
                  <button onClick={() => { setEduForm(edu); setEduEditing(edu.id); setShowEduForm(true); }}
                    className="w-7 h-7 rounded-lg bg-neon-purple/10 flex items-center justify-center text-neon-purple hover:bg-neon-purple/20 transition-all">
                    <Save size={11} />
                  </button>
                  <button onClick={() => deleteEdu(edu.id)}
                    className="w-7 h-7 rounded-lg bg-red-400/10 flex items-center justify-center text-red-400 hover:bg-red-400/20 transition-all">
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {education.length === 0 && (
            <div className="glass rounded-xl p-8 border border-white/5 text-center">
              <p className="text-slate-500 text-sm">No education added yet</p>
            </div>
          )}

          {/* Education Form Modal */}
          <AnimatePresence>
            {showEduForm && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                  className="glass rounded-2xl border border-neon-purple/20 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between p-5 border-b border-white/5">
                    <h3 className="font-display text-sm font-bold text-white">{eduEditing ? 'Edit Education' : 'Add Education'}</h3>
                    <button onClick={() => setShowEduForm(false)} className="text-slate-400 hover:text-white"><Plus size={18} className="rotate-45" /></button>
                  </div>
                  <div className="p-5 space-y-3">
                    {[
                      { key: 'institution', label: 'Institution *', placeholder: 'MIT' },
                      { key: 'degree', label: 'Degree *', placeholder: 'B.Tech' },
                      { key: 'field', label: 'Field of Study', placeholder: 'Computer Science - AI/ML' },
                      { key: 'start_date', label: 'Start Date', placeholder: '2021' },
                      { key: 'end_date', label: 'End Date', placeholder: '2025' },
                      { key: 'gpa', label: 'GPA / Grade', placeholder: '8.5 / 10' },
                    ].map((f) => (
                      <div key={f.key}>
                        <label className="text-xs text-slate-500 font-mono mb-1 block">{f.label}</label>
                        <input value={eduForm[f.key] || ''} onChange={(e) => setEduForm({ ...eduForm, [f.key]: e.target.value })}
                          placeholder={f.placeholder}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-neon-purple/50" />
                      </div>
                    ))}
                    <div>
                      <label className="text-xs text-slate-500 font-mono mb-1 block">Description</label>
                      <textarea value={eduForm.description || ''} onChange={(e) => setEduForm({ ...eduForm, description: e.target.value })} rows={3}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-neon-purple/50 resize-none" />
                    </div>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div onClick={() => setEduForm({ ...eduForm, is_current: !eduForm.is_current })}
                        className={`w-10 h-5 rounded-full transition-colors relative ${eduForm.is_current ? 'bg-emerald-accent' : 'bg-white/10'}`}>
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${eduForm.is_current ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </div>
                      <span className="text-sm text-slate-400">Currently studying here</span>
                    </label>
                    <div className="flex gap-3 pt-2">
                      <motion.button onClick={saveEdu} disabled={saving} whileHover={{ scale: 1.02 }}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-electric-blue to-neon-purple text-white text-sm font-medium disabled:opacity-50">
                        {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        {saving ? 'Saving...' : 'Save'}
                      </motion.button>
                      <button onClick={() => setShowEduForm(false)} className="px-4 py-2.5 rounded-xl glass border border-white/10 text-slate-400 text-sm">Cancel</button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Social Links Tab */}
      {activeTab === 'social' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-slate-400 text-sm">{socialLinks.length} links</p>
            <motion.button onClick={() => { setSocialForm(EMPTY_SOCIAL); setSocialEditing(null); setShowSocialForm(true); }}
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-electric-blue to-neon-purple text-white text-sm font-medium">
              <Plus size={14} /> Add Link
            </motion.button>
          </div>

          {socialLinks.map((link) => (
            <div key={link.id} className="glass rounded-xl p-4 border border-white/5 flex items-center justify-between">
              <div>
                <p className="text-white text-sm font-medium">{link.platform}</p>
                <p className="text-slate-500 text-xs truncate max-w-xs">{link.url}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setSocialForm(link); setSocialEditing(link.id); setShowSocialForm(true); }}
                  className="w-7 h-7 rounded-lg bg-electric-blue/10 flex items-center justify-center text-electric-blue hover:bg-electric-blue/20 transition-all">
                  <Save size={11} />
                </button>
                <button onClick={() => deleteSocial(link.id)}
                  className="w-7 h-7 rounded-lg bg-red-400/10 flex items-center justify-center text-red-400 hover:bg-red-400/20 transition-all">
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
          ))}

          <AnimatePresence>
            {showSocialForm && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                  className="glass rounded-2xl border border-electric-blue/20 w-full max-w-md">
                  <div className="flex items-center justify-between p-5 border-b border-white/5">
                    <h3 className="font-display text-sm font-bold text-white">Social Link</h3>
                    <button onClick={() => setShowSocialForm(false)} className="text-slate-400 hover:text-white"><Plus size={18} className="rotate-45" /></button>
                  </div>
                  <div className="p-5 space-y-3">
                    {[
                      { key: 'platform', label: 'Platform *', placeholder: 'GitHub' },
                      { key: 'url', label: 'URL *', placeholder: 'https://github.com/username' },
                      { key: 'icon', label: 'Icon name', placeholder: 'github' },
                    ].map((f) => (
                      <div key={f.key}>
                        <label className="text-xs text-slate-500 font-mono mb-1 block">{f.label}</label>
                        <input value={socialForm[f.key] || ''} onChange={(e) => setSocialForm({ ...socialForm, [f.key]: e.target.value })}
                          placeholder={f.placeholder}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-electric-blue/50" />
                      </div>
                    ))}
                    <div className="flex gap-3 pt-2">
                      <motion.button onClick={saveSocial} disabled={saving} whileHover={{ scale: 1.02 }}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-electric-blue to-neon-purple text-white text-sm font-medium disabled:opacity-50">
                        {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        Save
                      </motion.button>
                      <button onClick={() => setShowSocialForm(false)} className="px-4 py-2.5 rounded-xl glass border border-white/10 text-slate-400 text-sm">Cancel</button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Achievements Tab */}
      {activeTab === 'achievements' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-slate-400 text-sm">{achievements.length} achievements</p>
            <motion.button onClick={() => { setAchieveForm(EMPTY_ACHIEVEMENT); setAchieveEditing(null); setShowAchieveForm(true); }}
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-electric-blue to-neon-purple text-white text-sm font-medium">
              <Plus size={14} /> Add Achievement
            </motion.button>
          </div>

          {achievements.map((ach) => (
            <div key={ach.id} className="glass rounded-xl p-4 border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{ach.icon}</span>
                <div>
                  <p className="text-white text-sm font-medium">{ach.title}</p>
                  {ach.date && <p className="text-slate-500 text-xs">{ach.date}</p>}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setAchieveForm(ach); setAchieveEditing(ach.id); setShowAchieveForm(true); }}
                  className="w-7 h-7 rounded-lg bg-electric-blue/10 flex items-center justify-center text-electric-blue hover:bg-electric-blue/20 transition-all">
                  <Save size={11} />
                </button>
                <button onClick={() => deleteAchieve(ach.id)}
                  className="w-7 h-7 rounded-lg bg-red-400/10 flex items-center justify-center text-red-400 hover:bg-red-400/20 transition-all">
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
          ))}

          <AnimatePresence>
            {showAchieveForm && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                  className="glass rounded-2xl border border-electric-blue/20 w-full max-w-md">
                  <div className="flex items-center justify-between p-5 border-b border-white/5">
                    <h3 className="font-display text-sm font-bold text-white">Achievement</h3>
                    <button onClick={() => setShowAchieveForm(false)} className="text-slate-400 hover:text-white"><Plus size={18} className="rotate-45" /></button>
                  </div>
                  <div className="p-5 space-y-3">
                    {[
                      { key: 'title', label: 'Title *', placeholder: 'Won Hackathon' },
                      { key: 'icon', label: 'Emoji Icon', placeholder: '🏆' },
                      { key: 'date', label: 'Date', placeholder: '2024' },
                    ].map((f) => (
                      <div key={f.key}>
                        <label className="text-xs text-slate-500 font-mono mb-1 block">{f.label}</label>
                        <input value={achieveForm[f.key] || ''} onChange={(e) => setAchieveForm({ ...achieveForm, [f.key]: e.target.value })}
                          placeholder={f.placeholder}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-electric-blue/50" />
                      </div>
                    ))}
                    <div>
                      <label className="text-xs text-slate-500 font-mono mb-1 block">Description</label>
                      <textarea value={achieveForm.description || ''} onChange={(e) => setAchieveForm({ ...achieveForm, description: e.target.value })} rows={2}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-electric-blue/50 resize-none" />
                    </div>

                    <div>
                      <label className="text-xs text-slate-500 font-mono mb-1 block">Photos (upload multiple)</label>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-electric-blue/10 file:text-electric-blue cursor-pointer"
                        onChange={async (e) => {
                          const files = Array.from(e.target.files || []);
                          if (!files.length) return;
                          const uploaded: string[] = [];
                          for (const file of files) {
                            const fd = new FormData();
                            fd.append('image', file);
                            try {
                              const r = await api.put('/api/about/profile-image', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                              uploaded.push(r.data.data.profile_image_url);
                            } catch { }
                          }
                          setAchieveForm((prev: any) => ({ ...prev, photos: [...(prev.photos || []), ...uploaded] }));
                          toast.success(`${uploaded.length} photo(s) uploaded`);
                        }}
                      />
                      {achieveForm.photos?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {achieveForm.photos.map((p: string, i: number) => (
                            <div key={i} className="relative">
                              <img src={p} className="w-16 h-16 rounded-lg object-cover" />
                              <button
                                onClick={() => setAchieveForm((prev: any) => ({ ...prev, photos: prev.photos.filter((_: any, idx: number) => idx !== i) }))}
                                className="absolute -top-1 -right-1 w-4 h-4 bg-red-400 rounded-full flex items-center justify-center text-white text-xs"
                              >×</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3 pt-2">
                      <motion.button onClick={saveAchieve} disabled={saving} whileHover={{ scale: 1.02 }}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-electric-blue to-neon-purple text-white text-sm font-medium disabled:opacity-50">
                        {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        Save
                      </motion.button>
                      <button onClick={() => setShowAchieveForm(false)} className="px-4 py-2.5 rounded-xl glass border border-white/10 text-slate-400 text-sm">Cancel</button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}