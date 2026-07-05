'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Code2 } from 'lucide-react';
import { Skill } from '@/types';

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-8 md:mb-12">
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

export default function SkillsSection({ skills }: { skills: Skill[] }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.05 });
  const [activeCategory, setActiveCategory] = useState<string>('All');

  // Extract unique categories
  const categories = useMemo(() => [...new Set(skills.map((s) => s.category))], [skills]);
  
  // Filter skills based on active tab
  const filteredSkills = activeCategory === 'All' 
    ? skills 
    : skills.filter((s) => s.category === activeCategory);

  return (
    <section id="skills" ref={ref} className="relative py-24 md:py-32 bg-black text-white font-sans selection:bg-[#BFFF00] selection:text-black border-b-4 border-black min-h-screen">
      
      {/* Background Graphic */}
      <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none opacity-5">
         <div className="absolute top-1/4 right-1/4 w-[800px] h-[800px] border-[40px] border-white rounded-full -translate-y-1/2 translate-x-1/4" />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <SectionTitle title="Toolkit" subtitle="// WHAT I KNOW" />
        </motion.div>

        {/* Brutalist Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-3 mb-8"
        >
          {['All', ...categories].map((cat) => {
            const isActive = activeCategory === cat;
            const count = cat === 'All' ? skills.length : skills.filter((s) => s.category === cat).length;
            
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-2 px-4 py-2 font-black text-sm uppercase tracking-widest border-4 transition-all ${
                  isActive
                    ? 'border-[#BFFF00] bg-[#BFFF00] text-black shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] translate-x-[-2px] translate-y-[-2px]'
                    : 'border-white bg-black text-white hover:bg-white hover:text-black hover:border-white'
                }`}
              >
                {cat}
                <span className={`text-[10px] px-1.5 py-0.5 border-2 ${isActive ? 'bg-black text-[#BFFF00] border-black' : 'bg-white text-black border-black'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </motion.div>

        {/* Compact, Filterable Grid */}
        <motion.div 
          layout 
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {filteredSkills.map((skill) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                key={skill.id}
                className="bg-black border-2 border-white/30 p-4 group hover:border-[#BFFF00] hover:shadow-[4px_4px_0px_0px_rgba(191,255,0,1)] hover:-translate-y-1 transition-all cursor-default"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {/* Icon */}
                    {skill.icon_url ? (
                      <div className="w-6 h-6 bg-white flex items-center justify-center border border-white group-hover:border-[#BFFF00] transition-colors p-0.5">
                        <img src={skill.icon_url} alt={skill.name} className="w-full h-full object-contain grayscale group-hover:grayscale-0" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 bg-white text-black flex items-center justify-center border border-white font-black text-xs uppercase">
                        {skill.name.charAt(0)}
                      </div>
                    )}
                    
                    {/* Skill Name */}
                    <span className="text-sm font-black uppercase text-white group-hover:text-[#BFFF00] transition-colors truncate max-w-[120px]">
                      {skill.name}
                    </span>
                  </div>
                  
                  {/* Percentage */}
                  <span className="text-xs font-black text-white/50 group-hover:text-[#BFFF00] transition-colors">
                    {skill.proficiency}%
                  </span>
                </div>

                {/* Thin Progress bar */}
                <div className="h-2 w-full border border-white/20 bg-black relative overflow-hidden group-hover:border-[#BFFF00]/50 transition-colors">
                  <motion.div
                    className="h-full bg-white group-hover:bg-[#BFFF00] transition-colors"
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.proficiency}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>

                {/* Level Text */}
                <p className="text-[9px] font-bold uppercase tracking-widest text-white/40 mt-2 text-right group-hover:text-[#BFFF00]/70 transition-colors">
                  {skill.proficiency >= 90 ? 'Expert' : skill.proficiency >= 70 ? 'Advanced' : skill.proficiency >= 50 ? 'Intermediate' : 'Familiar'}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {skills.length === 0 && (
          <div className="text-center py-16 bg-black border-4 border-white border-dashed mt-8">
            <Code2 size={48} className="text-white/20 mx-auto mb-4 stroke-[2px]" />
            <p className="font-bold uppercase tracking-widest text-sm text-white/50">Awaiting technical telemetry...</p>
          </div>
        )}
      </div>
    </section>
  );
}