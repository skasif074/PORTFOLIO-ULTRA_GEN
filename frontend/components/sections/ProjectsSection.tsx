'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ArrowRight, Terminal } from 'lucide-react';
import { Project } from '@/types';
import ProjectCard from '../../components/projects/ProjectCard';
import ProjectModal from '../../components/projects/ProjectModal';

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-12 md:mb-16">
      <motion.div 
        className="inline-block bg-[#BFFF00] text-black font-bold text-xs md:text-sm mb-4 px-3 py-1 tracking-[0.2em] uppercase border-2 border-[#BFFF00]"
      >
        {subtitle}
      </motion.div>
      <h2 className="font-black text-5xl md:text-7xl lg:text-8xl tracking-tighter uppercase text-white leading-none">
        {title}
      </h2>
      <div className="mt-6 w-full max-w-sm h-2 bg-[#BFFF00]" />
    </div>
  );
}

export default function ProjectsSection({ projects }: { projects: Project[] }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.05 });
  const [selected, setSelected] = useState<Project | null>(null);

  // Filter out any blank rows or projects missing a title before rendering
  const validProjects = projects ? projects.filter((p) => p && p.title) : [];

  return (
    <section id="projects" ref={ref} className="relative py-24 md:py-32 bg-black text-white font-sans selection:bg-[#BFFF00] selection:text-black border-y-4 border-black">
      
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <SectionTitle title="Execution" subtitle="// WHAT I BUILT" />
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {validProjects.length > 0 ? (
            validProjects.map((project, i) => (
              <ProjectCard
                key={project.id || `project-${i}`}
                project={project}
                index={i}
                onClick={() => setSelected(project)}
              />
            ))
          ) : (
            // Brutalist Loading Skeletons (shows while fetching or if all data is invalid)
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-black border-4 border-white/20 border-dashed p-8 h-[480px] flex flex-col items-center justify-center relative group hover:border-[#BFFF00] transition-colors">
                <div className="absolute top-4 left-4 font-bold text-[10px] uppercase tracking-widest text-white/40 group-hover:text-[#BFFF00]">
                  System.load({i})
                </div>
                <Terminal size={48} className="text-white/20 mb-6 group-hover:text-[#BFFF00] transition-colors" strokeWidth={1.5} />
                <div className="w-full space-y-4">
                  <div className="h-8 bg-white/10 w-3/4 group-hover:bg-[#BFFF00]/20 transition-colors" />
                  <div className="h-4 bg-white/10 w-full group-hover:bg-[#BFFF00]/20 transition-colors" />
                  <div className="h-4 bg-white/10 w-5/6 group-hover:bg-[#BFFF00]/20 transition-colors" />
                </div>
              </div>
            ))
          )}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.4 }}
          className="mt-16 md:mt-24 flex justify-center"
        >
          <a href="/projects">
            <motion.button
              whileHover={{ y: -4, x: -4, boxShadow: "8px 8px 0px 0px rgba(191,255,0,1)" }}
              className="inline-flex items-center gap-3 px-8 py-4 font-black text-sm md:text-base uppercase tracking-widest border-4 border-[#BFFF00] bg-black text-[#BFFF00] transition-all hover:bg-[#BFFF00] hover:text-black cursor-pointer"
            >
              Access All Projects <ArrowRight size={20} className="stroke-[3px]" />
            </motion.button>
          </a>
        </motion.div>
      </div>

      {selected && <ProjectModal project={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}