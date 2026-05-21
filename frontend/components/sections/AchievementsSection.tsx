'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ChevronLeft, ChevronRight, Trophy } from 'lucide-react';
import api from '@/lib/api';

interface AchievementEvent {
  id: string;
  title: string;
  description: string;
  icon: string;
  date: string;
  photos?: string[];
}

export default function AchievementsSection() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const [achievements, setAchievements] = useState<AchievementEvent[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get('/api/achievements').then((r) => setAchievements(r.data.data || [])).catch(() => {});
  }, []);

  const scroll = (dir: 'left' | 'right') => {
    if (!sliderRef.current) return;
    sliderRef.current.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' });
  };

  if (achievements.length === 0) return null;

  return (
    <section id="achievements" ref={ref} className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-highlight/3 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <p className="text-orange-highlight font-mono text-sm mb-3 tracking-widest uppercase">// milestones</p>
          <h2 className="font-display text-4xl lg:text-5xl font-black gradient-text-pink">Achievements</h2>
          <div className="mt-4 mx-auto w-24 h-0.5 bg-gradient-to-r from-orange-highlight to-pink-glow rounded-full" />
        </motion.div>

        {/* Achievement event selector */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {achievements.map((ach, i) => (
            <motion.button
              key={ach.id}
              onClick={() => setActiveIdx(i)}
              whileHover={{ scale: 1.05 }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeIdx === i
                  ? 'bg-gradient-to-r from-orange-highlight to-pink-glow text-white'
                  : 'glass text-slate-400 border border-white/5 hover:text-white'
              }`}
            >
              <span>{ach.icon}</span>
              {ach.title}
            </motion.button>
          ))}
        </div>

        {/* Active achievement */}
        {achievements[activeIdx] && (
          <motion.div
            key={activeIdx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="text-center mb-8">
              <h3 className="font-display text-2xl font-bold text-white mb-2">
                {achievements[activeIdx].title}
              </h3>
              {achievements[activeIdx].description && (
                <p className="text-slate-400 text-sm max-w-xl mx-auto">
                  {achievements[activeIdx].description}
                </p>
              )}
              {achievements[activeIdx].date && (
                <p className="text-orange-highlight text-xs font-mono mt-2">
                  {achievements[activeIdx].date}
                </p>
              )}
            </div>

            {/* Photo slider */}
            {achievements[activeIdx].photos && achievements[activeIdx].photos!.length > 0 ? (
              <div className="relative">
                {/* Scroll buttons */}
                <button
                  onClick={() => scroll('left')}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 rounded-xl glass border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => scroll('right')}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 rounded-xl glass border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all"
                >
                  <ChevronRight size={18} />
                </button>

                {/* Scrollable photo strip */}
                <div
                  ref={sliderRef}
                  className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {achievements[activeIdx].photos!.map((photo, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="flex-shrink-0 w-72 h-48 rounded-2xl overflow-hidden border border-white/10 hover:border-electric-blue/30 transition-all cursor-pointer group"
                      onClick={() => window.open(photo, '_blank')}
                    >
                      <img
                        src={photo}
                        alt={`${achievements[activeIdx].title} ${i + 1}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 glass rounded-2xl border border-white/5">
                <Trophy size={40} className="text-orange-highlight/30 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No photos for this achievement yet</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
}