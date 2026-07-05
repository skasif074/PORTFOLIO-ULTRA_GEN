'use client';

import { motion } from 'framer-motion';
import { Github, Linkedin, Twitter, Terminal, Cpu } from 'lucide-react';
import { About } from '@/types';

const socialIcons: Record<string, any> = { github: Github, linkedin: Linkedin, twitter: Twitter };

export default function FooterSection({ about }: { about: About | null }) {
  return (
    <footer className="relative py-12 bg-[#BFFF00] border-t-4 border-black text-black font-sans selection:bg-black selection:text-[#BFFF00]">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          
          {/* Logo / Brand */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-black flex items-center justify-center border-4 border-black shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
              <Terminal size={24} className="text-[#BFFF00] stroke-[3px]" />
            </div>
            <span className="font-black text-2xl md:text-3xl uppercase tracking-tighter">
              SK ASIF HOSSAIN
            </span>
          </div>

          {/* Tech Stack Info (Brutalist Badge) */}
          <div className="font-black text-[10px] md:text-xs uppercase tracking-[0.2em] flex items-center gap-2 bg-white px-5 py-3 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            Engineered with <Cpu size={16} className="stroke-[3px]" /> Next.js + Supabase
          </div>

          {/* Social Links */}
          <div className="flex gap-4">
            {about?.social_links?.map((link) => {
              const Icon = socialIcons[link.icon?.toLowerCase()] || Github;
              return (
                <motion.a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -4, x: -4, boxShadow: "4px 4px 0px 0px rgba(0,0,0,1)" }}
                  className="w-12 h-12 bg-white flex items-center justify-center text-black border-4 border-black transition-all hover:bg-black hover:text-[#BFFF00]"
                >
                  <Icon size={20} className="stroke-[2.5px]" />
                </motion.a>
              );
            })}
          </div>
        </div>

        {/* Copyright & System Status */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t-4 border-black">
          <p className="font-bold text-[10px] md:text-xs uppercase tracking-widest text-black/70">
            © {new Date().getFullYear()} SK Asif Hossain. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 bg-black animate-pulse" />
             <p className="font-bold text-[10px] md:text-xs uppercase tracking-widest text-black">
               SYSTEM: ONLINE
             </p>
          </div>
        </div>

      </div>
    </footer>
  );
}