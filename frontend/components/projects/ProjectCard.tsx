'use client';

import { motion } from 'framer-motion';
import { Github, ExternalLink, Eye, Star } from 'lucide-react';
import { Project } from '@/types';

interface Props {
  project: Project;
  index: number;
  onClick: () => void;
}

export default function ProjectCard({ project, index, onClick }: Props) {
  const hasGithub = project.github_url && project.github_url !== 'NA' && project.github_url.trim() !== '';
  const hasLive = project.live_url && project.live_url !== 'NA' && project.live_url.trim() !== '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      onClick={onClick}
      className="group glass rounded-2xl overflow-hidden border border-white/5 hover:border-electric-blue/30 transition-all duration-300 flex flex-col cursor-pointer"
      whileHover={{ y: -6 }}
    >
      {/* Thumbnail */}
      <div className="relative h-44 bg-gradient-to-br from-electric-blue/10 to-neon-purple/10 overflow-hidden flex-shrink-0">
        {project.thumbnail_url ? (
          <img
            src={project.thumbnail_url}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-display text-5xl font-black gradient-text opacity-20">
              {project.title.charAt(0)}
            </span>
          </div>
        )}

        {/* Hover overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          className="absolute inset-0 bg-deep-dark/70 flex items-center justify-center"
        >
          <span className="px-4 py-2 rounded-xl bg-gradient-to-r from-electric-blue to-neon-purple text-white text-xs font-semibold">
            View Details
          </span>
        </motion.div>

        {project.is_featured && (
          <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-orange-highlight/20 border border-orange-highlight/30 text-orange-highlight text-xs font-medium">
            <Star size={10} fill="currentColor" /> Featured
          </div>
        )}

        <div className={`absolute top-3 right-3 px-2 py-1 rounded-lg text-xs font-medium ${
          project.status === 'completed' ? 'bg-emerald-accent/20 text-emerald-accent border border-emerald-accent/30' :
          project.status === 'in_progress' ? 'bg-electric-blue/20 text-electric-blue border border-electric-blue/30' :
          'bg-slate-500/20 text-slate-400 border border-slate-500/30'
        }`}>
          {project.status === 'in_progress' ? 'In Progress' : project.status}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-electric-blue font-mono bg-electric-blue/10 px-2 py-0.5 rounded-md">
            {project.category}
          </span>
          <div className="flex items-center gap-1 text-slate-500 text-xs">
            <Eye size={11} /> {project.views || 0}
          </div>
        </div>

        <h3 className="font-display font-bold text-white text-base mb-2 group-hover:text-electric-blue transition-colors">
          {project.title}
        </h3>

        <p className="text-slate-400 text-xs leading-relaxed flex-1 line-clamp-2">
          {project.description}
        </p>

        {/* Tech stack */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {project.tech_stack?.slice(0, 4).map((tech) => (
            <span key={tech} className="px-2 py-0.5 rounded-md bg-white/5 text-slate-400 text-xs border border-white/5">
              {tech}
            </span>
          ))}
          {(project.tech_stack?.length || 0) > 4 && (
            <span className="px-2 py-0.5 rounded-md bg-white/5 text-slate-500 text-xs">
              +{project.tech_stack.length - 4}
            </span>
          )}
        </div>

        {/* Links — only show if not NA */}
        {(hasGithub || hasLive) && (
          <div className="flex gap-3 mt-4 pt-3 border-t border-white/5">
            {hasGithub && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-electric-blue transition-colors"
              >
                <Github size={13} /> Code
              </a>
            )}
            {hasLive && (
              <a
                href={project.live_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-neon-purple transition-colors"
              >
                <ExternalLink size={13} /> Live Demo
              </a>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}