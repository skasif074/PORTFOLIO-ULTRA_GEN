'use client';

import { motion } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import { Download, MessageCircle, Github, Linkedin, Twitter, ArrowDown, Sparkles, Code2, Brain } from 'lucide-react';
import Image from 'next/image';
import { About } from '@/types';
import api from '@/lib/api';

const socialIcons: Record<string, any> = {
  github: Github,
  linkedin: Linkedin,
  twitter: Twitter,
};

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
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden cyber-grid">
      {/* Ambient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-electric-blue/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-purple/10 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-glow/5 rounded-full blur-3xl" />

      {/* Scan line effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-electric-blue/30 to-transparent animate-scan-line" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-32 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left content */}
        <div className="space-y-8">
          {/* Status badge */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-blue border border-electric-blue/20"
          >
            <span className="w-2 h-2 bg-emerald-accent rounded-full animate-pulse" />
            <span className="text-xs font-mono text-electric-blue">
              {about?.available_for_work ? 'Available for opportunities' : 'Currently busy'}
            </span>
            <Sparkles size={12} className="text-electric-blue" />
          </motion.div>

          {/* Name */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="font-display text-5xl lg:text-7xl font-black leading-tight tracking-tight">
              <span className="text-white">SK </span>
              <span className="gradient-text">ASIF</span>
              <br />
              <span className="text-white">HOSSAIN</span>
            </h1>
          </motion.div>

          {/* Typing animation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-3"
          >
            <span className="text-slate-500 font-mono text-sm">{'>'}</span>
            <div className="font-mono text-lg text-electric-blue">
              <TypeAnimation
                sequence={[
                  'Full Stack Developer',
                  2000,
                  'AI / ML Enthusiast',
                  2000,
                  'BTech CSE-AIML Student',
                  2000,
                  'Problem Solver',
                  2000,
                  'Open Source Contributor',
                  2000,
                ]}
                wrapper="span"
                speed={50}
                repeat={Infinity}
                className="text-glow-blue"
              />
              <span className="cursor-blink text-neon-purple ml-1">_</span>
            </div>
          </motion.div>

          {/* Bio */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-slate-400 text-base leading-relaxed max-w-lg"
          >
            {about?.bio || 'Passionate developer crafting intelligent web applications at the intersection of software engineering and artificial intelligence.'}
          </motion.p>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex gap-8"
          >
            {[
              /* 
                FUTURE UPDATE: Uncomment the line below when you want to show your Years of Experience stat 
              */
              // { label: 'Years Exp.', value: `${about?.years_of_experience || 0}+`, icon: Code2 },
              { label: 'Projects', value: '10+', icon: Brain },
              { label: 'Technologies', value: '15+', icon: Sparkles },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-display text-2xl font-bold gradient-text">{stat.value}</div>
                <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="flex flex-wrap gap-4"
          >
            <motion.button
              onClick={handleResumeDownload}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-electric-blue to-neon-purple text-white font-semibold text-sm glow-blue hover:shadow-2xl transition-all"
            >
              <Download size={16} />
              Download Resume
            </motion.button>

            <motion.a
              href="#contact"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => { e.preventDefault(); document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' }); }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl glass gradient-border text-slate-300 hover:text-white font-semibold text-sm transition-all"
            >
              <MessageCircle size={16} />
              Let's Talk
            </motion.a>
          </motion.div>

          {/* Social links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="flex gap-3"
          >
            {about?.social_links?.map((link) => {
              const Icon = socialIcons[link.icon?.toLowerCase()] || Github;
              return (
                <motion.a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.2, y: -4 }}
                  className="w-10 h-10 rounded-xl glass flex items-center justify-center text-slate-400 hover:text-electric-blue hover:border-electric-blue/30 border border-white/5 transition-all"
                >
                  <Icon size={18} />
                </motion.a>
              );
            })}
          </motion.div>
        </div>

        {/* Right — Profile image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, x: 50 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
          className="hidden lg:flex items-center justify-center"
        >
          <div className="relative">
            {/* Rotating ring */}
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-electric-blue/20 animate-spin-slow" style={{ inset: '-20px' }} />
            <div className="absolute inset-0 rounded-full border border-neon-purple/20 animate-spin-slow" style={{ inset: '-40px', animationDirection: 'reverse', animationDuration: '12s' }} />

            {/* Glowing orbs around image */}
            {[0, 60, 120, 180, 240, 300].map((deg, i) => (
              <div
                key={i}
                className="absolute w-3 h-3 rounded-full bg-electric-blue glow-blue"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: `rotate(${deg}deg) translateX(160px) translateY(-50%)`,
                  animationDelay: `${i * 0.3}s`,
                }}
              />
            ))}

            {/* Profile image */}
            <div className="relative w-72 h-72 rounded-full overflow-hidden animate-pulse-glow">
              <div className="absolute inset-0 bg-gradient-to-br from-electric-blue/20 via-transparent to-neon-purple/20 z-10 rounded-full" />
              {about?.profile_image_url ? (
                <Image
                  src={about.profile_image_url}
                  alt={about.name || 'Profile'}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-electric-blue/20 to-neon-purple/20 flex items-center justify-center">
                  <span className="font-display text-6xl font-black gradient-text">SK</span>
                </div>
              )}
            </div>

            {/* Floating badges */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -top-4 -right-4 glass-blue px-3 py-2 rounded-xl border border-electric-blue/20 text-xs font-mono text-electric-blue"
            >
              {'<AI/ML />'}
            </motion.div>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 4, repeat: Infinity, delay: 1 }}
              className="absolute -bottom-4 -left-4 glass-blue px-3 py-2 rounded-xl border border-neon-purple/20 text-xs font-mono text-neon-purple"
            >
              {'{ fullstack }'}
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-xs text-slate-600 font-mono">scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ArrowDown size={16} className="text-electric-blue" />
        </motion.div>
      </motion.div>
    </section>
  );
}