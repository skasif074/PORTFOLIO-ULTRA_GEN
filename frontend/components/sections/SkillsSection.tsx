'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ChevronDown } from 'lucide-react';
import { Skill } from '@/types';

const CATEGORY_COLORS: Record<string, string> = {
  Frontend: '#3B82F6',
  Backend: '#8B5CF6',
  'AI/ML': '#06B6D4',
  Database: '#10B981',
  DevOps: '#F97316',
  Tools: '#EC4899',
  Other: '#94A3B8',
};

export default function SkillsSection({ skills }: { skills: Skill[] }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const categories = [...new Set(skills.map((s) => s.category))];

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const filtered = activeCategory === 'All' ? skills : skills.filter((s) => s.category === activeCategory);

  const grouped = filtered.reduce((acc: Record<string, Skill[]>, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {});

  return (
    <section id="skills" ref={ref} className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-electric-blue/3 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="text-electric-blue font-mono text-sm mb-3 tracking-widest uppercase">// what I know</p>
          <h2 className="font-display text-4xl lg:text-5xl font-black gradient-text">Skills & Tech</h2>
          <div className="mt-4 mx-auto w-24 h-0.5 bg-gradient-to-r from-electric-blue to-neon-purple rounded-full" />
        </motion.div>

        {/* Category filter pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 mb-10"
        >
          {['All', ...categories].map((cat) => (
            <motion.button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                activeCategory === cat
                  ? 'bg-gradient-to-r from-electric-blue to-neon-purple text-white border-transparent glow-blue'
                  : 'glass text-slate-400 border-white/5 hover:text-white hover:border-electric-blue/20'
              }`}
            >
              {cat}
              <span className="ml-1.5 text-xs opacity-60">
                ({cat === 'All' ? skills.length : skills.filter((s) => s.category === cat).length})
              </span>
            </motion.button>
          ))}
        </motion.div>

        {/* Grouped categories — collapsed by default */}
        <div className="space-y-3">
          {Object.entries(grouped).map(([cat, catSkills], gi) => {
            const color = CATEGORY_COLORS[cat] || '#3B82F6';
            const isExpanded = expandedCategories[cat] ?? false;

            return (
              <motion.div
                key={cat}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.1 + gi * 0.05 }}
                className="glass rounded-2xl border border-white/5 overflow-hidden"
              >
                {/* Category header — clickable to expand */}
                <motion.button
                  onClick={() => toggleCategory(cat)}
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                  className="w-full flex items-center justify-between px-5 py-4 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ background: color, boxShadow: `0 0 8px ${color}60` }}
                    />
                    <span
                      className="font-display text-sm font-bold uppercase tracking-widest"
                      style={{ color }}
                    >
                      {cat}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      {catSkills.length} {catSkills.length === 1 ? 'skill' : 'skills'}
                    </span>
                  </div>
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown size={16} className="text-slate-400" />
                  </motion.div>
                </motion.button>

                {/* Skills list — shown when expanded */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {catSkills.map((skill, i) => (
                          <motion.div
                            key={skill.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                            whileHover={{ y: -2, scale: 1.02 }}
                            className="rounded-xl p-4 border border-white/5 hover:border-electric-blue/20 transition-all group"
                            style={{ background: 'rgba(255,255,255,0.03)' }}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                {skill.icon_url ? (
                                  <img src={skill.icon_url} alt={skill.name} className="w-6 h-6 object-contain" />
                                ) : (
                                  <div
                                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                                    style={{ background: `${color}20`, color }}
                                  >
                                    {skill.name.charAt(0)}
                                  </div>
                                )}
                                <span className="text-sm text-white font-medium">{skill.name}</span>
                              </div>
                              <span className="text-xs font-mono font-bold" style={{ color }}>
                                {skill.proficiency}%
                              </span>
                            </div>

                            {/* Progress bar */}
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${skill.proficiency}%` }}
                                transition={{ duration: 1.2, delay: i * 0.05, ease: 'easeOut' }}
                                style={{
                                  background: `linear-gradient(90deg, ${color}60, ${color})`,
                                }}
                              />
                            </div>

                            <p className="text-xs text-slate-600 mt-1 text-right">
                              {skill.proficiency >= 90 ? 'Expert' : skill.proficiency >= 70 ? 'Advanced' : skill.proficiency >= 50 ? 'Intermediate' : 'Beginner'}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {skills.length === 0 && (
          <div className="text-center py-16">
            <p className="text-slate-500 text-sm">No skills added yet. Add from the admin dashboard.</p>
          </div>
        )}
      </div>
    </section>
  );
}