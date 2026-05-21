'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, ArrowLeft } from 'lucide-react';
import api from '@/lib/api';
import { Project } from '@/types';
import Navbar from '@/components/layout/Navbar';
//import ProjectCard from '/components/projects/ProjectCard';
//import ProjectModal from '@/components/projects/ProjectModal';

import ProjectCard from '../../components/projects/ProjectCard'
import ProjectModal from '../../components/projects/ProjectModal'

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [categories, setCategories] = useState<string[]>(['all']);
  const [selected, setSelected] = useState<Project | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchProjects();
    fetchCategories();
  }, [search, category, page]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '12',
        ...(search && { search }),
        ...(category !== 'all' && { category }),
      });
      const r = await api.get(`/api/projects?${params}`);
      setProjects(r.data.data);
      setTotalPages(r.data.pagination?.totalPages || 1);
    } catch { } finally { setLoading(false); }
  };

  const fetchCategories = async () => {
    try {
      const r = await api.get('/api/projects/categories');
      setCategories(r.data.data);
    } catch { }
  };

  return (
    <div className="min-h-screen bg-deep-dark">
      <Navbar about={null} />
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-20">

        {/* Header */}
        <div className="mb-12">
          <a href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-electric-blue text-sm mb-6 transition-colors">
            <ArrowLeft size={14} /> Back to Portfolio
          </a>
          <p className="text-electric-blue font-mono text-sm mb-3 tracking-widest uppercase">// my work</p>
          <h1 className="font-display text-4xl lg:text-6xl font-black gradient-text">All Projects</h1>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search projects..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-electric-blue/50 transition-colors"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <motion.button
                key={cat}
                onClick={() => { setCategory(cat); setPage(1); }}
                whileHover={{ scale: 1.05 }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
                  category === cat
                    ? 'bg-gradient-to-r from-electric-blue to-neon-purple text-white'
                    : 'glass text-slate-400 border border-white/5 hover:text-white'
                }`}
              >
                {cat}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass rounded-2xl h-72 animate-pulse border border-white/5" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-500">No projects found</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} onClick={() => setSelected(project)} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-12">
            {Array.from({ length: totalPages }).map((_, i) => (
              <motion.button
                key={i}
                onClick={() => setPage(i + 1)}
                whileHover={{ scale: 1.1 }}
                className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                  page === i + 1
                    ? 'bg-gradient-to-r from-electric-blue to-neon-purple text-white'
                    : 'glass text-slate-400 border border-white/5 hover:text-white'
                }`}
              >
                {i + 1}
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Project detail modal */}
      {selected && <ProjectModal project={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}