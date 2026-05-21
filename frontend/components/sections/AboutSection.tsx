'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { MapPin, Mail, Briefcase, GraduationCap, Target, Calendar } from 'lucide-react';
import { About } from '@/types';

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="text-center mb-16">
      <motion.p className="text-electric-blue font-mono text-sm mb-3 tracking-widest uppercase">
        {subtitle}
      </motion.p>
      <h2 className="font-display text-4xl lg:text-5xl font-black">
        <span className="gradient-text">{title}</span>
      </h2>
      <div className="mt-4 mx-auto w-24 h-0.5 bg-gradient-to-r from-electric-blue to-neon-purple rounded-full" />
    </div>
  );
}

export default function AboutSection({ about }: { about: About | null }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section id="about" ref={ref} className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neon-purple/3 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <SectionTitle title="About Me" subtitle="// who I am" />
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left — Info cards */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="glass rounded-2xl p-6 gradient-border"
            >
              <p className="text-slate-300 leading-relaxed text-base">
                {about?.bio || 'Passionate about building intelligent systems and beautiful web experiences. Currently pursuing BTech in CSE with specialization in AI/ML.'}
              </p>
            </motion.div>

            {/* Details */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="grid grid-cols-2 gap-4"
            >
              {[
                { icon: MapPin, label: 'Location', value: about?.location || 'India', color: 'text-electric-blue' },
                { icon: Mail, label: 'Email', value: about?.email || 'asif@email.com', color: 'text-neon-purple' },
                { icon: Target, label: 'Focus', value: 'AI/ML + Web Dev', color: 'text-cyan-glow' },
                
                /* 
                  FUTURE UPDATE: Uncomment the line below when you want to show your Years of Experience card 
                */
                // { icon: Calendar, label: 'Experience', value: `${about?.years_of_experience || 0}+ Years`, color: 'text-emerald-accent' },
                
              ].map((item) => (
                <div key={item.label} className="glass rounded-xl p-4 border border-white/5 hover:border-electric-blue/20 transition-all group">
                  <item.icon size={16} className={`${item.color} mb-2`} />
                  <p className="text-xs text-slate-500 mb-1">{item.label}</p>
                  <p className="text-sm text-slate-300 font-medium truncate">{item.value}</p>
                </div>
              ))}
            </motion.div>

            {/* Career goal */}
            {about?.career_goal && (
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="glass rounded-xl p-5 border border-cyan-glow/20"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Target size={16} className="text-cyan-glow" />
                  <span className="text-cyan-glow text-sm font-semibold">Career Goal</span>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">{about.career_goal}</p>
              </motion.div>
            )}
          </div>

          {/* Right — Timeline */}
          <div className="space-y-8">
            
            {/* 
              =====================================================================
              FUTURE UPDATE: EXPERIENCE SECTION
              =====================================================================
              This section is currently commented out because there is no professional
              experience to display yet. 

              HOW TO UNCOMMENT IN THE FUTURE:
              1. Remove the opening bracket-star sequence right below this message.
              2. Remove the star-bracket sequence at the very end of this section.
              3. Ensure your admin dashboard has experience data entered.
              =====================================================================
            */}
            {/* 
            {(about?.experience?.length ?? 0) > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <div className="flex items-center gap-2 mb-6">
                  <Briefcase size={18} className="text-electric-blue" />
                  <h3 className="font-display text-lg font-bold text-white">Experience</h3>
                </div>
                <div className="space-y-4 relative">
                  <div className="absolute left-3 top-0 bottom-0 w-px bg-gradient-to-b from-electric-blue/50 to-transparent" />
                  {about?.experience?.map((exp, i) => (
                    <motion.div
                      key={exp.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={inView ? { opacity: 1, y: 0 } : {}}
                      transition={{ delay: 0.4 + i * 0.1 }}
                      className="pl-8 relative"
                    >
                      <div className="absolute left-1.5 top-2 w-3 h-3 rounded-full bg-electric-blue glow-blue border-2 border-deep-dark" />
                      <div className="glass rounded-xl p-4 border border-white/5 hover:border-electric-blue/20 transition-all">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-semibold text-white text-sm">{exp.role}</h4>
                          <span className="text-xs text-slate-500 font-mono">{exp.start_date} — {exp.end_date}</span>
                        </div>
                        <p className="text-electric-blue text-xs font-medium mb-2">{exp.company}</p>
                        {exp.description && <p className="text-slate-400 text-xs leading-relaxed">{exp.description}</p>}
                        {exp.technologies?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {exp.technologies.slice(0, 4).map((tech) => (
                              <span key={tech} className="px-2 py-0.5 rounded-md bg-electric-blue/10 text-electric-blue text-xs border border-electric-blue/10">
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
            */}

            {/* Education */}
            {(about?.education?.length ?? 0) > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <div className="flex items-center gap-2 mb-6">
                  <GraduationCap size={18} className="text-neon-purple" />
                  <h3 className="font-display text-lg font-bold text-white">Education</h3>
                </div>
                <div className="space-y-4 relative">
                  <div className="absolute left-3 top-0 bottom-0 w-px bg-gradient-to-b from-neon-purple/50 to-transparent" />
                  {about?.education?.map((edu, i) => (
                    <motion.div
                      key={edu.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={inView ? { opacity: 1, y: 0 } : {}}
                      transition={{ delay: 0.6 + i * 0.1 }}
                      className="pl-8 relative"
                    >
                      <div className="absolute left-1.5 top-2 w-3 h-3 rounded-full bg-neon-purple glow-purple border-2 border-deep-dark" />
                      <div className="glass rounded-xl p-4 border border-white/5 hover:border-neon-purple/20 transition-all">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-semibold text-white text-sm">{edu.degree}</h4>
                          <span className="text-xs text-slate-500 font-mono">{edu.start_date} — {edu.end_date}</span>
                        </div>
                        <p className="text-neon-purple text-xs font-medium mb-1">{edu.institution}</p>
                        {edu.field && <p className="text-slate-400 text-xs">{edu.field}</p>}
                        {edu.gpa && <p className="text-emerald-accent text-xs mt-1">GPA: {edu.gpa}</p>}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Show placeholder if no data yet */}
            {(!about?.education?.length) && (
              <div className="glass rounded-xl p-8 border border-white/5 text-center">
                <GraduationCap size={40} className="text-neon-purple mx-auto mb-3 opacity-50" />
                <p className="text-slate-500 text-sm">Add your education from the admin dashboard</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}