'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { MapPin, Mail, Briefcase, GraduationCap, Target } from 'lucide-react';
import { About } from '@/types';

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-12 md:mb-20">
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

export default function AboutSection({ about }: { about: About | null }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.05 });

  return (
    // Removed overflow-hidden here so sticky positioning works correctly
    <section id="about" ref={ref} className="relative py-24 md:py-32 bg-[#BFFF00] text-black font-sans selection:bg-black selection:text-[#BFFF00]">
      
      {/* Brutalist Background Accents */}
      <div className="absolute top-40 right-0 w-32 h-32 border-[12px] border-black opacity-10 translate-x-1/2 pointer-events-none hidden lg:block" />
      <div className="absolute bottom-40 left-10 w-24 h-24 bg-black opacity-10 pointer-events-none hidden lg:block" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <SectionTitle title="System Info" subtitle="// ABOUT ME" />
        </motion.div>

        {/* NEW LAYOUT: Sticky Sidebar (Left) + Content (Right)
          This ensures perfect organization and readability.
        */}
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start relative">
          
          {/* =======================================================
              LEFT COLUMN: STICKY SIDEBAR (Bio & Details)
          ======================================================= */}
          <div className="lg:col-span-5 flex flex-col gap-8 lg:sticky lg:top-32 lg:pb-12">
            
            {/* Bio Card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white border-4 border-black p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
            >
              <h3 className="font-black text-3xl uppercase tracking-tighter mb-4 border-b-4 border-black pb-4">
                Architecture
              </h3>
              <p className="text-black font-semibold leading-relaxed text-sm md:text-base">
                {about?.bio || 'Passionate software developer engineering intelligent systems and robust web architecture. Currently pursuing a BTech in CSE with a specialization in AI/ML at MCKV Institute of Engineering, driving focus into Java, full-stack environments, and core data logic.'}
              </p>
            </motion.div>

            {/* Details Grid */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-2 gap-4"
            >
              {[
                { icon: MapPin, label: 'Location', value: about?.location || 'India' },
                { icon: Target, label: 'Focus', value: 'Full Stack & AI' },
              ].map((item) => (
                <div key={item.label} className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <item.icon size={24} className="text-black mb-2 stroke-[3px]" />
                  <p className="text-[10px] font-bold text-black uppercase tracking-widest opacity-60 mb-1">{item.label}</p>
                  <p className="text-sm font-black text-black truncate uppercase">{item.value}</p>
                </div>
              ))}
              
              {/* Email takes full width of the sub-grid */}
              <div className="col-span-2 bg-black text-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                 <Mail size={24} className="text-[#BFFF00] mb-2 stroke-[3px]" />
                 <p className="text-[10px] font-bold text-[#BFFF00] uppercase tracking-widest opacity-80 mb-1">Email Connection</p>
                 <p className="text-sm font-black truncate uppercase">{about?.email || 'skasifx86@gmail.com'}</p>
              </div>
            </motion.div>

            {/* Career Goal */}
            {about?.career_goal && (
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-[#BFFF00] border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
              >
                <div className="flex items-center gap-3 mb-3 border-b-4 border-black pb-3">
                  <Target size={24} className="text-black stroke-[3px]" />
                  <span className="text-black font-black uppercase tracking-widest text-xl">Target Vector</span>
                </div>
                <p className="font-bold text-sm leading-relaxed">{about.career_goal}</p>
              </motion.div>
            )}
          </div>

          {/* =======================================================
              RIGHT COLUMN: SCROLLABLE TIMELINES
          ======================================================= */}
          <div className="lg:col-span-7 flex flex-col gap-16 lg:pt-0 pt-8 mt-4 lg:mt-0">
            
            {/* --- EXPERIENCE SECTION --- */}
            {(about?.experience?.length ?? 0) > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="flex items-center gap-4 mb-10 bg-black text-white p-4 inline-flex border-4 border-black shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]">
                  <Briefcase size={28} className="text-[#BFFF00] stroke-[3px]" />
                  <h3 className="font-black text-3xl uppercase tracking-tighter">Experience</h3>
                </div>

                {/* Left-Aligned Solid Timeline */}
                <div className="pl-6 md:pl-10 border-l-8 border-black space-y-12 relative">
                  {about?.experience?.map((exp, i) => (
                    <motion.div
                      key={exp.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={inView ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className="relative"
                    >
                      {/* Timeline Node */}
                      <div className="absolute -left-[40px] md:-left-[56px] top-0 w-6 h-6 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" />
                      
                      {/* Card Content */}
                      <div className="bg-white border-4 border-black p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
                        <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-4 mb-4">
                          <div>
                            <h4 className="font-black text-2xl uppercase tracking-tight">{exp.role}</h4>
                            <p className="font-black text-lg text-black/60 uppercase mt-1">{exp.company}</p>
                          </div>
                          <span className="font-bold text-xs uppercase tracking-widest bg-[#BFFF00] text-black border-2 border-black px-3 py-1 h-fit whitespace-nowrap">
                            {exp.start_date} — {exp.end_date}
                          </span>
                        </div>
                        
                        {exp.description && (
                          <p className="text-sm font-semibold leading-relaxed mb-6 mt-4 border-t-2 border-dashed border-black/20 pt-4">
                            {exp.description}
                          </p>
                        )}
                        
                        {exp.technologies?.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {exp.technologies.map((tech) => (
                              <span key={tech} className="px-3 py-1 bg-black text-white text-[10px] font-bold uppercase tracking-widest border-2 border-black">
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* --- EDUCATION SECTION --- */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="flex items-center gap-4 mb-10 bg-black text-white p-4 inline-flex border-4 border-black shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]">
                <GraduationCap size={28} className="text-[#BFFF00] stroke-[3px]" />
                <h3 className="font-black text-3xl uppercase tracking-tighter">Education</h3>
              </div>
              
              {(about?.education?.length ?? 0) > 0 ? (
                <div className="pl-6 md:pl-10 border-l-8 border-black space-y-12 relative">
                  {about?.education?.map((edu, i) => (
                    <motion.div
                      key={edu.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={inView ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      className="relative"
                    >
                      {/* Timeline Node */}
                      <div className="absolute -left-[40px] md:-left-[56px] top-0 w-6 h-6 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" />
                      
                      {/* Card Content */}
                      <div className="bg-white border-4 border-black p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
                        <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-4 mb-4">
                          <div>
                            <h4 className="font-black text-2xl uppercase tracking-tight">{edu.degree}</h4>
                            <p className="font-black text-lg text-black/60 uppercase mt-1">{edu.institution}</p>
                          </div>
                          <span className="font-bold text-xs uppercase tracking-widest bg-[#BFFF00] text-black border-2 border-black px-3 py-1 h-fit whitespace-nowrap">
                            {edu.start_date} — {edu.end_date}
                          </span>
                        </div>

                        <div className="mt-4 border-t-2 border-dashed border-black/20 pt-4 flex flex-col gap-2">
                          {edu.field && (
                            <p className="text-sm font-bold uppercase tracking-wide">
                              <span className="opacity-50 mr-2">Focus:</span> {edu.field}
                            </p>
                          )}
                          {edu.gpa && (
                            <p className="text-sm font-black uppercase tracking-wide">
                              <span className="opacity-50 mr-2">GPA:</span> {edu.gpa}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-white border-4 border-black border-dashed p-12 text-center max-w-xl">
                  <GraduationCap size={48} className="mx-auto mb-4 stroke-[2px] opacity-40" />
                  <p className="font-bold uppercase tracking-widest text-sm opacity-60">
                    Awaiting academic telemetry from dashboard...
                  </p>
                </div>
              )}
            </motion.div>
            
          </div>
        </div>
      </div>
    </section>
  );
}