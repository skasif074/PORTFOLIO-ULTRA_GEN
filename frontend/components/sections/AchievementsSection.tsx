'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Trophy } from 'lucide-react';
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

  // Auto-slide Effect (5s interval)
  useEffect(() => {
    const activeAchievement = achievements[activeIdx];
    // Stop the interval if there's only 1 (or 0) photos
    if (!activeAchievement?.photos || activeAchievement.photos.length <= 1) return;

    const interval = setInterval(() => {
      if (!sliderRef.current) return;
      const slider = sliderRef.current;
      const isAtEnd = Math.ceil(slider.scrollLeft + slider.clientWidth) >= slider.scrollWidth - 10;

      if (isAtEnd) {
        slider.scrollTo({ left: 0, behavior: 'smooth' }); // Loop back to start
      } else {
        slider.scrollTo({ left: slider.scrollLeft + 304, behavior: 'smooth' }); // Scroll one image width
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [activeIdx, achievements]);

  // Handle tab switching
  const handleTabChange = (idx: number) => {
    setActiveIdx(idx);
    // Instantly reset scroll to start when switching tabs
    if (sliderRef.current) sliderRef.current.scrollTo({ left: 0 });
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
              onClick={() => handleTabChange(i)}
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
              
              // Centering wrapper: text-center on parent + inline-flex on child
              <div className="relative w-full max-w-5xl mx-auto text-center mt-6">
                
                {/* Auto-sliding container (No manual buttons) */}
                <div
                  ref={sliderRef}
                  className="inline-flex gap-4 overflow-x-auto max-w-full scrollbar-hide py-4 text-left"
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