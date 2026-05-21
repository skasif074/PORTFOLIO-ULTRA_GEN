'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ArrowRight } from 'lucide-react';
import { Project } from '@/types';
import ProjectCard from '../../components/projects/ProjectCard';
import ProjectModal from '../../components/projects/ProjectModal';



export default function ProjectsSection({ projects }: { projects: Project[] }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const [selected, setSelected] = useState<Project | null>(null);

  return (
    <section id="projects" ref={ref} className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neon-purple/3 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="text-neon-purple font-mono text-sm mb-3 tracking-widest uppercase">// what I built</p>
          <h2 className="font-display text-4xl lg:text-5xl font-black gradient-text">Featured Projects</h2>
          <div className="mt-4 mx-auto w-24 h-0.5 bg-gradient-to-r from-electric-blue to-neon-purple rounded-full" />
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.length > 0 ? (
            projects.map((project, i) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={i}
                onClick={() => setSelected(project)}
              />
            ))
          ) : (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="glass rounded-2xl overflow-hidden border border-white/5 h-72 animate-pulse">
                <div className="h-44 bg-white/5" />
                <div className="p-5 space-y-2">
                  <div className="h-4 bg-white/5 rounded w-3/4" />
                  <div className="h-3 bg-white/5 rounded w-full" />
                </div>
              </div>
            ))
          )}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
          className="text-center mt-12"
        >
          <a href="/projects">
            <motion.button
              whileHover={{ scale: 1.05, x: 5 }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl glass gradient-border text-slate-300 hover:text-white text-sm font-medium transition-all"
            >
              View All Projects <ArrowRight size={16} />
            </motion.button>
          </a>
        </motion.div>
      </div>

      {selected && <ProjectModal project={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}