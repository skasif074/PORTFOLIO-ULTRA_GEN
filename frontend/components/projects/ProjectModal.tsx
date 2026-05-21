'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Github, ExternalLink, Eye, Star, Calendar } from 'lucide-react';
import { Project } from '@/types';
import { useState } from 'react';

interface Props {
  project: Project;
  onClose: () => void;
}

export default function ProjectModal({ project, onClose }: Props) {
  const [imgIndex, setImgIndex] = useState(0);
  const hasGithub = project.github_url && project.github_url !== 'NA' && project.github_url.trim() !== '';
  const hasLive = project.live_url && project.live_url !== 'NA' && project.live_url.trim() !== '';
  const images = [project.thumbnail_url, ...(project.screenshots || [])].filter(Boolean);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="glass rounded-2xl border border-electric-blue/20 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl"
        >
          {/* Image carousel */}
          {images.length > 0 && (
            <div className="relative h-56 md:h-72 overflow-hidden rounded-t-2xl bg-gradient-to-br from-electric-blue/10 to-neon-purple/10">
              <motion.img
                key={imgIndex}
                src={images[imgIndex]}
                alt={project.title}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full h-full object-cover"
              />
              {images.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setImgIndex(i)}
                      className={`w-2 h-2 rounded-full transition-all ${i === imgIndex ? 'bg-white w-5' : 'bg-white/40'}`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="p-6 space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-electric-blue font-mono bg-electric-blue/10 px-2 py-0.5 rounded-md">
                    {project.category}
                  </span>
                  {project.is_featured && (
                    <span className="flex items-center gap-1 text-xs text-orange-highlight bg-orange-highlight/10 px-2 py-0.5 rounded-md border border-orange-highlight/20">
                      <Star size={9} fill="currentColor" /> Featured
                    </span>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded-md ${
                    project.status === 'completed' ? 'bg-emerald-accent/10 text-emerald-accent' :
                    'bg-electric-blue/10 text-electric-blue'
                  }`}>
                    {project.status}
                  </span>
                </div>
                <h2 className="font-display text-2xl font-black text-white">{project.title}</h2>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all flex-shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* Description */}
            <div className="glass rounded-xl p-4 border border-white/5">
              <p className="text-slate-300 text-sm leading-relaxed">
                {project.long_description || project.description}
              </p>
            </div>

            {/* Stats */}
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Eye size={13} /> {project.views || 0} views
              </div>
              {project.created_at && (
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Calendar size={13} />
                  {new Date(project.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </div>
              )}
            </div>

            {/* Tech stack */}
            <div>
              <p className="text-xs text-slate-500 font-mono mb-2 uppercase tracking-widest">Tech Stack</p>
              <div className="flex flex-wrap gap-2">
                {project.tech_stack?.map((tech) => (
                  <span key={tech} className="px-3 py-1 rounded-lg bg-white/5 text-slate-300 text-xs border border-white/5">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Links */}
            {(hasGithub || hasLive) && (
              <div className="flex gap-3 pt-2">
                {hasGithub && (
                  <a
                    href={project.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl glass border border-electric-blue/20 text-electric-blue text-sm font-medium hover:bg-electric-blue/10 transition-all"
                  >
                    <Github size={15} /> View Code
                  </a>
                )}
                {hasLive && (
                  <a
                    href={project.live_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-electric-blue to-neon-purple text-white text-sm font-medium glow-blue hover:shadow-lg transition-all"
                  >
                    <ExternalLink size={15} /> Live Demo
                  </a>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}