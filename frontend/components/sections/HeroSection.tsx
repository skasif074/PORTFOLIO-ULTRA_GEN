'use client';

import { motion } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import { Play, Plus } from 'lucide-react';
import Image from 'next/image';
import { About } from '@/types';
import api from '@/lib/api';

export default function HeroSection({ about }: { about: About | null }) {
  const handleResumeDownload = async () => {
    try {
      const res = await api.get('/api/resume');
      if (res.data.data?.file_url) {
        window.open(res.data.data.file_url, '_blank');
        await api.post(`/api/resume/${res.data.data.id}/download`);
      }
    } catch {}
  };

  return (
    <section id="hero" className="relative min-h-screen w-full bg-[#BFFF00] text-black font-sans overflow-hidden selection:bg-black selection:text-[#BFFF00]">
      
      {/* Top Right Spinning Text & Play Icon - Hidden on mobile */}
      {/* Pushed slightly lower (top-24) so it doesn't clip into your new global Navbar */}
      <div className="absolute top-24 right-12 w-32 h-32 items-center justify-center z-40 hidden xl:flex">
        <div className="absolute inset-0 animate-[spin_10s_linear_infinite]">
          <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
            <path id="circlePath" d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" fill="transparent" />
            <text className="text-[10.5px] font-bold tracking-[0.18em] uppercase" fill="black">
              <textPath href="#circlePath" startOffset="0%">
                • AI / ML • FULL STACK • JAVA DEV 
              </textPath>
            </text>
          </svg>
        </div>
        <Play size={20} className="fill-black text-black ml-1" />
      </div>

      {/* Main Layout Grid - Added extra top padding (pt-32) to account for global Navbar */}
      <div className="relative z-10 max-w-[1600px] mx-auto px-6 md:px-12 pt-32 pb-24 md:pb-12 min-h-screen flex items-center">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center w-full">
          
          {/* Left Column: Text & Buttons */}
          <div className="lg:col-span-7 flex flex-col gap-8 md:gap-12 relative z-20">
            
            {/* Massive Name */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="font-black text-[16vw] sm:text-[12vw] lg:text-[7.5rem] xl:text-[9rem] leading-[0.85] tracking-tighter uppercase text-black select-none">
                SK ASIF
                <br />
                HOSSAIN
              </h1>
            </motion.div>

            {/* Description Area */}
            <div className="flex gap-4 max-w-lg items-start">
              <div className="w-8 h-[2px] bg-black mt-2 md:mt-3 shrink-0 hidden sm:block" />
              <div className="text-black font-medium text-sm md:text-base leading-relaxed">
                <p>
                   I deliver the decisive advantage through full-stack architecture, Java systems, and artificial intelligence algorithms.
                </p>
                <div className="mt-4 font-bold uppercase tracking-widest text-xs opacity-70 bg-black text-[#BFFF00] inline-block px-3 py-1">
                  <TypeAnimation
                    sequence={[
                      'Fresher Software Developer', 2000,
                      'BTech CSE-AIML Student', 2000,
                      'Problem Solver', 2000,
                    ]}
                    wrapper="span"
                    speed={50}
                    repeat={Infinity}
                  />
                </div>
              </div>
            </div>

            {/* Brutalist Buttons */}
            <div className="flex border-2 border-black bg-black shrink-0 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)] transition-shadow w-fit">
              <button 
                onClick={handleResumeDownload}
                className="bg-black text-white px-6 md:px-10 py-4 md:py-5 font-bold uppercase text-xs md:text-sm tracking-widest hover:bg-[#BFFF00] hover:text-black transition-colors flex items-center justify-center"
              >
                DOWNLOAD RESUME
              </button>
              
              <a 
                href="#contact"
                className="bg-black text-white w-14 md:w-16 flex items-center justify-center hover:bg-[#BFFF00] hover:text-black transition-colors cursor-pointer border-l-2 border-white/20"
              >
                 <Plus size={20} className="stroke-[3px]" />
              </a>
            </div>

          </div>

          {/* Right Column: Brutalist ID Card Animation */}
          <div className="lg:col-span-5 h-[560px] sm:h-[600px] flex items-start justify-center relative w-full mt-6 lg:mt-0" style={{ perspective: 1200 }}>
            
            {/* Lanyard clip anchor */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="absolute top-0 w-8 h-8 rounded-full bg-black border-4 border-white z-30 shadow-[0_4px_0_0_rgba(0,0,0,0.2)] flex items-center justify-center"
            >
              <div className="w-2 h-2 rounded-full bg-[#BFFF00]" />
            </motion.div>

            {/* Lanyard strap */}
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 95, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5, ease: 'easeOut' }}
              className="absolute top-4 w-2 bg-black z-20 origin-top"
            />

            {/* Falling Container */}
            <motion.div
              initial={{ y: -500, opacity: 0, rotateZ: -15, rotateX: 45 }}
              animate={{ y: 95, opacity: 1, rotateZ: 0, rotateX: 0 }}
              transition={{
                type: "spring",
                damping: 14,
                stiffness: 90,
                mass: 1.2,
                delay: 0.4
              }}
              style={{ transformOrigin: 'top center' }}
              className="relative z-10 cursor-grab active:cursor-grabbing w-full max-w-[260px] sm:max-w-[280px]"
            >
              {/* Swaying & Hover Container */}
              <motion.div
                animate={{ 
                  rotateZ: [0, 3, 0, -3, 0], 
                  rotateY: [0, 8, 0, -8, 0] 
                }}
                transition={{ 
                  duration: 6, 
                  repeat: Infinity, 
                  ease: 'easeInOut', 
                  delay: 1.5 
                }}
                whileHover={{ 
                  scale: 1.05, 
                  rotateY: 0, 
                  rotateZ: 0,
                  y: -10,
                  transition: { duration: 0.3 }
                }}
                style={{ transformOrigin: 'top center', transformStyle: 'preserve-3d' }}
                className="w-full flex justify-center"
              >
                {/* Brutalist Card Body */}
                <div className="relative w-full rounded-none bg-white border-[4px] border-black p-4 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] group">
                  
                  {/* Card clip notch */}
                  <div className="absolute -top-[14px] left-1/2 -translate-x-1/2 w-12 h-6 rounded-b-full bg-[#BFFF00] border-4 border-t-0 border-black z-20" />

                  {/* Top Bar Decoration */}
                  <div className="w-full h-8 bg-black mb-3 flex items-center px-2">
                     <span className="text-white text-[10px] font-bold tracking-widest uppercase">ID: SKA-2026</span>
                  </div>

                  {/* Photo Container */}
                  <div className="relative w-full aspect-square border-4 border-black overflow-hidden group-hover:border-[#BFFF00] transition-colors duration-300">
                    
                    {about?.profile_image_url ? (
                      <Image
                        src={about.profile_image_url}
                        alt={about.name || 'Profile'}
                        fill
                        className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                        priority
                      />
                    ) : (
                      <div className="w-full h-full bg-[#BFFF00] flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
                        <span className="font-black text-6xl text-black">AH</span>
                      </div>
                    )}
                  </div>

                  {/* ID Info */}
                  <div className="mt-4 text-center relative z-20">
                    <div className="font-black text-2xl text-black tracking-tighter uppercase leading-none">
                      {about?.name || 'SK ASIF HOSSAIN'}
                    </div>
                    <div className="font-bold text-[10px] text-black tracking-widest uppercase mt-2 opacity-60">
                      {'ENGINEERING & AI DEPT'}
                    </div>
                  </div>

                  {/* Barcode-ish decoration */}
                  <div className="mt-4 h-6 flex items-end justify-between gap-[2px]">
                    {[3, 5, 2, 7, 4, 2, 5, 3, 8, 4, 2, 5, 3, 4, 6, 2, 8, 4, 2, 5].map((h, i) => (
                      <div 
                        key={i} 
                        className="w-[3px] bg-black" 
                        style={{ height: `${h * 3}px` }} 
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}