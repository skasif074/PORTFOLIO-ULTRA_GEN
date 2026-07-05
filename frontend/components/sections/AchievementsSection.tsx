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

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-12 md:mb-16">
      <motion.div 
        className="inline-block bg-black text-[#BFFF00] font-bold text-xs md:text-sm mb-4 px-3 py-1 tracking-[0.2em] uppercase border-2 border-black"
      >
        {subtitle}
      </motion.div>
      <h2 className="font-black text-5xl md:text-7xl lg:text-8xl tracking-tighter uppercase text-black leading-none">
        {title}
      </h2>
      <div className="mt-6 w-full max-w-sm h-2 bg-black" />
    </div>
  );
}

export default function AchievementsSection() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.05 });
  const [achievements, setAchievements] = useState<AchievementEvent[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get('/api/achievements').then((r) => setAchievements(r.data.data || [])).catch(() => {});
  }, []);

  // Auto-slide Effect (5s interval)
  useEffect(() => {
    const activeAchievement = achievements[activeIdx];
    if (!activeAchievement?.photos || activeAchievement.photos.length <= 1) return;

    const interval = setInterval(() => {
      if (!sliderRef.current) return;
      const slider = sliderRef.current;
      const isAtEnd = Math.ceil(slider.scrollLeft + slider.clientWidth) >= slider.scrollWidth - 10;

      if (isAtEnd) {
        slider.scrollTo({ left: 0, behavior: 'smooth' }); 
      } else {
        // Scroll one image width (approx 300px + gap)
        slider.scrollTo({ left: slider.scrollLeft + 324, behavior: 'smooth' }); 
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [activeIdx, achievements]);

  const handleTabChange = (idx: number) => {
    setActiveIdx(idx);
    if (sliderRef.current) sliderRef.current.scrollTo({ left: 0 });
  };

  if (achievements.length === 0) return null;

  return (
    <section id="achievements" ref={ref} className="relative py-24 md:py-32 overflow-hidden bg-[#BFFF00] text-black font-sans selection:bg-black selection:text-[#BFFF00]">
      
      {/* Brutalist Background Elements */}
      <div className="absolute top-20 right-[-5%] w-[400px] h-[400px] border-[16px] border-black opacity-10 rounded-full pointer-events-none hidden lg:block" />

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <SectionTitle title="Milestones" subtitle="// ACHIEVEMENTS" />
        </motion.div>

        {/* Achievement event selector (Tabs) */}
        <div className="flex flex-wrap gap-4 mb-12">
          {achievements.map((ach, i) => {
            const isActive = activeIdx === i;
            return (
              <motion.button
                key={ach.id}
                onClick={() => handleTabChange(i)}
                whileHover={{ y: -4, x: -4, boxShadow: "8px 8px 0px 0px rgba(0,0,0,1)" }}
                className={`flex items-center gap-3 px-6 py-3 font-black text-sm md:text-base uppercase tracking-widest border-4 border-black transition-all ${
                  isActive
                    ? 'bg-black text-[#BFFF00] shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]'
                    : 'bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-[#BFFF00]'
                }`}
              >
                <span className="text-xl">{ach.icon}</span>
                {ach.title}
              </motion.button>
            );
          })}
        </div>

        {/* Active achievement Display - NEW SPLIT LAYOUT */}
        {achievements[activeIdx] && (
          <motion.div
            key={activeIdx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col lg:flex-row overflow-hidden"
          >
            {/* Left Side: Info Panel */}
            <div className="lg:w-[45%] p-6 md:p-10 flex flex-col justify-center border-b-4 lg:border-b-0 lg:border-r-4 border-black bg-white relative z-10">
              
              {achievements[activeIdx].date && (
                <span className="font-bold text-xs uppercase tracking-widest bg-black text-[#BFFF00] border-2 border-black px-3 py-1 inline-block w-fit mb-4">
                  {achievements[activeIdx].date}
                </span>
              )}
              
              <h3 className="font-black text-4xl lg:text-5xl uppercase tracking-tighter mb-6 leading-none">
                {achievements[activeIdx].title}
              </h3>
              
              {achievements[activeIdx].description && (
                <div className="border-l-8 border-[#BFFF00] pl-4">
                  <p className="font-bold text-base md:text-lg leading-relaxed text-black/80">
                    {achievements[activeIdx].description}
                  </p>
                </div>
              )}
            </div>

            {/* Right Side: Media Stage */}
            <div className="lg:w-[55%] bg-[#f4f4f4] relative flex items-center min-w-0 p-6 md:p-10">
              
              {achievements[activeIdx].photos && achievements[activeIdx].photos!.length > 0 ? (
                <div className="w-full relative">
                  {/* Badge */}
                  <div className="absolute -top-4 right-0 md:-top-6 bg-black text-[#BFFF00] text-[10px] font-bold px-3 py-1.5 uppercase tracking-widest z-20 border-2 border-black">
                    DRAG / SCROLL TO EXPLORE
                  </div>

                  {/* Auto-sliding container */}
                  <div
                    ref={sliderRef}
                    className="flex gap-6 overflow-x-auto w-full scrollbar-hide py-4 px-2"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    {achievements[activeIdx].photos!.map((photo, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex-shrink-0 w-[260px] sm:w-[300px] aspect-[4/3] border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-white overflow-hidden group cursor-pointer hover:-translate-y-2 hover:-translate-x-2 hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-all"
                        onClick={() => window.open(photo, '_blank')}
                      >
                        <img
                          src={photo}
                          alt={`${achievements[activeIdx].title} documentation ${i + 1}`}
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="w-full text-center py-12 bg-white border-4 border-black border-dashed">
                  <Trophy size={40} className="text-black/20 mx-auto mb-3 stroke-[2px]" />
                  <p className="font-bold uppercase tracking-widest text-xs text-black/50">No visual documentation</p>
                </div>
              )}
            </div>
            
          </motion.div>
        )}
      </div>
    </section>
  );
}