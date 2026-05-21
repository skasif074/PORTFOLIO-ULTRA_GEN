'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal } from 'lucide-react';

export function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const update = () => {
      const el = document.documentElement;
      const scrolled = el.scrollTop / (el.scrollHeight - el.clientHeight);
      setProgress(scrolled * 100);
    };
    window.addEventListener('scroll', update);
    return () => window.removeEventListener('scroll', update);
  }, []);
  return <div className="scroll-progress" style={{ width: `${progress}%` }} />;
}

export function CursorGlow() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  useEffect(() => {
    const update = (e: MouseEvent) => setPos({ x: e.clientX - 10, y: e.clientY - 10 });
    window.addEventListener('mousemove', update);
    return () => window.removeEventListener('mousemove', update);
  }, []);
  return (
    <div
      className="cursor-glow pointer-events-none hidden lg:block"
      style={{ left: pos.x, top: pos.y }}
    />
  );
}

export function LoadingScreen() {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="loading-screen"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 rounded-2xl bg-gradient-to-br from-electric-blue to-neon-purple flex items-center justify-center glow-blue"
        >
          <Terminal size={28} className="text-white" />
        </motion.div>
        <div className="text-center space-y-2">
          <p className="font-display text-xl font-bold gradient-text">SK ASIF HOSSAIN</p>
          <p className="font-mono text-xs text-slate-500">Initializing portfolio...</p>
        </div>
        <div className="w-48 h-0.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-electric-blue to-neon-purple rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default ScrollProgress;
