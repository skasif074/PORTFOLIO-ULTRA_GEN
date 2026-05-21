'use client';

import { motion } from 'framer-motion';
import { Github, Linkedin, Twitter, Terminal, Heart } from 'lucide-react';
import { About } from '@/types';

const socialIcons: Record<string, any> = { github: Github, linkedin: Linkedin, twitter: Twitter };

export default function FooterSection({ about }: { about: About | null }) {
  return (
    <footer className="relative py-12 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-electric-blue to-neon-purple flex items-center justify-center">
              <Terminal size={14} className="text-white" />
            </div>
            <span className="font-display text-sm gradient-text font-bold">SK ASIF HOSSAIN</span>
          </div>

          <p className="text-slate-600 text-xs flex items-center gap-1">
            Built with <Heart size={10} className="text-pink-glow fill-pink-glow" /> using Next.js + Supabase
          </p>

          <div className="flex gap-3">
            {about?.social_links?.map((link) => {
              const Icon = socialIcons[link.icon?.toLowerCase()] || Github;
              return (
                <motion.a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.2, y: -3 }}
                  className="w-8 h-8 rounded-lg glass flex items-center justify-center text-slate-500 hover:text-electric-blue border border-white/5 hover:border-electric-blue/20 transition-all"
                >
                  <Icon size={14} />
                </motion.a>
              );
            })}
          </div>
        </div>
        <p className="text-center text-slate-700 text-xs mt-8">
          © {new Date().getFullYear()} SK Asif Hossain. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
