'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Search } from 'lucide-react';
import api from '@/lib/api';
import { Project } from '@/types';
import Navbar from '@/components/layout/Navbar';
import ProjectCard from '../../components/projects/ProjectCard';
import ProjectModal from '../../components/projects/ProjectModal';

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
      // Fix: Use a Set to ensure "all" and other categories are unique, 
      // preventing the double "ALL" button issue.
      const rawCategories = r.data.data || [];
      const uniqueCategories = Array.from(new Set(['all', ...rawCategories]));
      setCategories(uniqueCategories);
    } catch { 
      setCategories(['all']);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white font-sans selection:bg-[#BFFF00] selection:text-black">
      <Navbar about={null} />
      
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 pt-32 pb-24">
        
        {/* Header Section */}
        <div className="mb-12">
          <a href="/" className="inline-flex items-center gap-2 text-[#BFFF00] hover:text-white transition-colors mb-6 font-black uppercase tracking-widest text-sm">
            <ArrowLeft size={16} /> Back to Portfolio
          </a>
          <h1 className="font-black text-6xl md:text-8xl uppercase tracking-tighter text-white">
            All Projects
          </h1>
          <div className="mt-8 w-full max-w-lg h-3 bg-[#BFFF00]" />
        </div>

        {/* Filter & Search Controls */}
        <div className="flex flex-col md:flex-row gap-6 mb-12">
          {/* Search */}
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={20} />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="SEARCH PROJECTS..."
              className="w-full bg-transparent border-4 border-white p-4 pl-12 font-black text-white placeholder-white/30 focus:outline-none focus:border-[#BFFF00] transition-colors"
            />
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => { setCategory(cat); setPage(1); }}
                className={`px-6 py-4 font-black uppercase tracking-widest border-4 transition-all ${
                  category === cat 
                    ? 'bg-[#BFFF00] border-[#BFFF00] text-black shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]' 
                    : 'bg-black border-white text-white hover:bg-white hover:text-black hover:border-black'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-black border-4 border-white/20 p-8 h-[480px] flex items-center justify-center">
                 <span className="font-black text-white/20 uppercase tracking-widest">Loading...</span>
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="py-20 text-center border-4 border-white/20 border-dashed">
            <h3 className="font-black text-4xl uppercase text-white/50">No matches found</h3>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, i) => (
              <ProjectCard 
                key={project.id || i} 
                project={project} 
                index={i} 
                onClick={() => setSelected(project)} 
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-3 mt-16">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-14 h-14 font-black text-lg border-4 transition-all ${
                  page === i + 1
                    ? 'bg-[#BFFF00] border-[#BFFF00] text-black'
                    : 'bg-black border-white text-white hover:bg-white hover:text-black hover:border-black'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {selected && <ProjectModal project={selected} onClose={() => setSelected(null)} />}
    </main>
  );
}