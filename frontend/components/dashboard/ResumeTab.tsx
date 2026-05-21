'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Trash2, CheckCircle, FileText, Loader2, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

export default function ResumeTab() {
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');

  const fetch = async () => {
    const r = await api.get('/api/resume/all');
    setResumes(r.data.data);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const upload = async (file: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('title', title || file.name.replace('.pdf', ''));
      fd.append('is_active', 'true');
      await api.post('/api/resume', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Resume uploaded!');
      setTitle('');
      fetch();
    } catch (e: any) { toast.error(e.message); }
    finally { setUploading(false); }
  };

  const del = async (id: string) => {
    if (!confirm('Delete this resume?')) return;
    await api.delete(`/api/resume/${id}`);
    toast.success('Resume deleted');
    fetch();
  };

  if (loading) return <div className="flex justify-center h-64 items-center"><Loader2 className="animate-spin text-electric-blue" size={28} /></div>;

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Upload */}
      <div className="glass rounded-2xl p-6 border border-white/5">
        <h3 className="font-display text-sm font-bold text-white mb-4">Upload New Resume</h3>
        <div className="space-y-3">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Resume title (optional)"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-electric-blue/50" />
          <label className={`flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed transition-all cursor-pointer ${uploading ? 'border-electric-blue/30 bg-electric-blue/5' : 'border-white/10 hover:border-electric-blue/30 hover:bg-electric-blue/5'}`}>
            {uploading ? <Loader2 size={24} className="text-electric-blue animate-spin" /> : <Upload size={24} className="text-slate-400" />}
            <div className="text-center">
              <p className="text-sm text-slate-300">{uploading ? 'Uploading...' : 'Click to upload PDF'}</p>
              <p className="text-xs text-slate-500 mt-1">PDF only · Max 20MB</p>
            </div>
            <input type="file" accept=".pdf" className="hidden" disabled={uploading}
              onChange={e => e.target.files?.[0] && upload(e.target.files[0])} />
          </label>
        </div>
      </div>

      {/* List */}
      <div className="glass rounded-2xl p-6 border border-white/5">
        <h3 className="font-display text-sm font-bold text-white mb-4">All Resumes</h3>
        {resumes.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8">No resumes uploaded yet</p>
        ) : (
          <div className="space-y-3">
            {resumes.map(r => (
              <div key={r.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/3 border border-white/5">
                <div className="w-10 h-10 rounded-xl bg-red-400/10 flex items-center justify-center flex-shrink-0">
                  <FileText size={18} className="text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-white truncate">{r.title}</p>
                    {r.is_active && <span className="flex items-center gap-1 text-xs text-emerald-accent"><CheckCircle size={10} /> Active</span>}
                  </div>
                  <p className="text-xs text-slate-500">{r.download_count} downloads · {new Date(r.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <a href={r.file_url} target="_blank" rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-electric-blue/10 flex items-center justify-center text-electric-blue hover:bg-electric-blue/20 transition-all">
                    <Download size={13} />
                  </a>
                  <button onClick={() => del(r.id)}
                    className="w-8 h-8 rounded-lg bg-red-400/10 flex items-center justify-center text-red-400 hover:bg-red-400/20 transition-all">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}