'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Terminal, Zap } from 'lucide-react';
import { useUser, SignInButton, UserButton } from '@clerk/nextjs';
import { About } from '@/types';

const navLinks = [
  { label: 'Home', href: '#hero' },
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Projects', href: '#projects' },
  { label: 'Milestones', href: '#achievements' },
  { label: 'Credentials', href: '#certifications' },
  { label: 'Contact', href: '#contact' },
];

export default function Navbar({ about }: { about: About | null }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isSignedIn, user } = useUser();
  const isAdmin = user?.id === process.env.NEXT_PUBLIC_ADMIN_USER_ID;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 font-sans transition-all duration-300 ${
        scrolled 
          ? 'bg-black border-b-4 border-[#BFFF00] py-3 shadow-[0px_4px_0px_0px_rgba(191,255,0,0.2)]' 
          : 'bg-black border-b-4 border-black py-5'
      } text-white`}
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex items-center justify-between">
        
        {/* Logo block */}
        <motion.div
          className="flex items-center gap-3 cursor-pointer group"
          whileHover={{ x: 2 }}
          onClick={() => scrollTo('#hero')}
        >
          <div className="w-10 h-10 bg-[#BFFF00] border-2 border-black flex items-center justify-center group-hover:bg-white transition-colors shrink-0 shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
            <Terminal size={20} className="text-black stroke-[3px]" />
          </div>
          <span className="font-black text-2xl uppercase tracking-tighter hidden sm:block">
            SK ASIF
          </span>
        </motion.div>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => scrollTo(link.href)}
              className="px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-white/70 hover:bg-[#BFFF00] hover:text-black transition-colors"
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-4">
          
          {isAdmin && (
            <motion.a
              href="/dashboard"
              whileHover={{ y: -2, x: -2, boxShadow: "4px 4px 0px 0px rgba(191,255,0,1)" }}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-black border-2 border-[#BFFF00] text-[#BFFF00] text-[10px] font-black uppercase tracking-widest hover:bg-[#BFFF00] hover:text-black transition-all"
            >
              <Zap size={14} className="stroke-[3px]" /> SYS.ADMIN
            </motion.a>
          )}

          {isSignedIn ? (
            <div className="border-2 border-white/20 p-1 rounded-none hover:border-[#BFFF00] transition-colors">
              <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "rounded-none w-8 h-8" } }} />
            </div>
          ) : (
            <SignInButton mode="modal">
              <motion.button
                whileHover={{ y: -2, x: -2, boxShadow: "4px 4px 0px 0px rgba(255,255,255,1)" }}
                className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-[#BFFF00] text-black border-2 border-black text-[11px] font-black uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] transition-all"
              >
                Authenticate
              </motion.button>
            </SignInButton>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden text-white bg-white/10 p-2 border-2 border-transparent hover:border-[#BFFF00] hover:text-[#BFFF00] transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} className="stroke-[3px]" /> : <Menu size={24} className="stroke-[3px]" />}
          </button>
        </div>
      </div>

      {/* Mobile menu block */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-black border-t-4 border-[#BFFF00] overflow-hidden flex flex-col"
          >
            <div className="px-6 py-4 flex flex-col gap-2">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => scrollTo(link.href)}
                  className="text-left px-4 py-3 text-white font-bold text-sm uppercase tracking-widest border-l-4 border-transparent hover:border-[#BFFF00] hover:bg-white/5 hover:text-[#BFFF00] transition-all"
                >
                  {link.label}
                </button>
              ))}
              
              {/* Mobile Auth Button */}
              {!isSignedIn && (
                <div className="pt-4 mt-2 border-t-2 border-white/10">
                  <SignInButton mode="modal">
                    <button className="w-full px-4 py-3 bg-[#BFFF00] text-black font-black text-sm uppercase tracking-widest">
                      Authenticate Session
                    </button>
                  </SignInButton>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}