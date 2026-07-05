'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Send, Mail, MapPin, MessageSquare, Loader2, Key } from 'lucide-react';
import toast from 'react-hot-toast';
import { useUser, SignInButton } from '@clerk/nextjs';
import api from '@/lib/api';
import { About } from '@/types';

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-12 md:mb-16">
      <motion.div 
        className="inline-block bg-[#BFFF00] text-black font-bold text-xs md:text-sm mb-4 px-3 py-1 tracking-[0.2em] uppercase border-2 border-[#BFFF00]"
      >
        {subtitle}
      </motion.div>
      <h2 className="font-black text-5xl md:text-7xl lg:text-8xl tracking-tighter uppercase text-white leading-none">
        {title}
      </h2>
      <div className="mt-6 w-full max-w-sm h-2 bg-[#BFFF00]" />
    </div>
  );
}

export default function ContactSection({ about }: { about: About | null }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const { isSignedIn, user } = useUser();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  // Pre-fill name and email if signed in
  const name = isSignedIn ? (user?.fullName || user?.firstName || form.name) : form.name;
  const email = isSignedIn ? (user?.primaryEmailAddress?.emailAddress || form.email) : form.email;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignedIn) {
      toast.error('Authentication required to transmit data.');
      return;
    }
    if (!form.message) {
      toast.error('Message payload cannot be empty.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/api/messages/contact', {
        name,
        email,
        subject: form.subject,
        message: form.message,
        clerk_user_id: user?.id,
      });
      toast.success("Transmission successful. Awaiting response.");
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err: any) {
      toast.error(err.message || 'Transmission failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" ref={ref} className="relative py-24 md:py-32 bg-black text-white font-sans selection:bg-[#BFFF00] selection:text-black">
      
      {/* Brutalist Background Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <SectionTitle title="Communicate" subtitle="// GET IN TOUCH" />
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-12 items-start mt-12">
          
          {/* LEFT: Info Panel */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="lg:col-span-5 space-y-6"
          >
            <div className="bg-[#BFFF00] border-4 border-[#BFFF00] p-8 shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] text-black">
              <h3 className="font-black text-3xl md:text-4xl uppercase tracking-tighter mb-4 border-b-4 border-black pb-4">
                Initialize Connect
              </h3>
              <p className="font-bold text-sm leading-relaxed opacity-80">
                Open to internship opportunities, freelance architecture, and system collaborations.
                Authenticate your session to open a direct comm-link.
              </p>
            </div>

            <div className="space-y-4 pt-4">
              {[
                { icon: Mail, label: 'Email', value: about?.email || 'skasifx86@gmail.com' },
                { icon: MapPin, label: 'Location', value: about?.location || 'India' },
                { icon: MessageSquare, label: 'Ping Latency', value: '< 24 Hours' },
              ].map((item) => (
                <motion.div
                  key={item.label}
                  whileHover={{ x: 8 }}
                  className="flex items-center gap-6 bg-black border-4 border-white p-4 hover:bg-white hover:text-black transition-colors group cursor-default"
                >
                  <div className="w-12 h-12 bg-white flex items-center justify-center border-4 border-white group-hover:border-black group-hover:bg-black transition-colors shrink-0">
                    <item.icon size={24} className="text-black group-hover:text-white stroke-[3px]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">{item.label}</p>
                    <p className="text-base font-black uppercase tracking-tight">{item.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* RIGHT: Form / Auth Panel */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3 }}
            className="lg:col-span-7"
          >
            {!isSignedIn ? (
              
              /* --- UNAUTHENTICATED STATE --- */
              <div className="bg-white border-4 border-white p-10 md:p-16 text-black shadow-[12px_12px_0px_0px_rgba(191,255,0,1)] text-center space-y-8 h-full flex flex-col justify-center items-center">
                <div className="w-24 h-24 bg-black flex items-center justify-center border-4 border-black shadow-[6px_6px_0px_0px_rgba(191,255,0,1)]">
                  <Key size={48} className="text-[#BFFF00] stroke-[2px]" />
                </div>
                <div>
                  <h3 className="font-black text-3xl uppercase tracking-tighter mb-4">Handshake Required</h3>
                  <p className="font-bold text-sm text-black/60 max-w-sm mx-auto">
                    System requires Google authentication to establish a secure, spam-free communication channel.
                  </p>
                </div>
                <SignInButton mode="modal">
                  <motion.button
                    whileHover={{ y: -4, x: -4, boxShadow: "6px 6px 0px 0px rgba(0,0,0,1)" }}
                    className="px-10 py-5 bg-[#BFFF00] border-4 border-black text-black font-black uppercase tracking-widest transition-all"
                  >
                    Authenticate Session
                  </motion.button>
                </SignInButton>
              </div>

            ) : (

              /* --- AUTHENTICATED FORM STATE --- */
              <form onSubmit={handleSubmit} className="bg-white border-4 border-white p-8 md:p-10 text-black shadow-[12px_12px_0px_0px_rgba(191,255,0,1)] space-y-6">
                
                {/* User Identity Block */}
                <div className="flex items-center gap-4 bg-gray-100 border-4 border-black p-4">
                  <img src={user?.imageUrl} className="w-12 h-12 border-2 border-black grayscale object-cover" alt="User Avatar" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-black/50 mb-0.5">Session Active</p>
                    <p className="font-black text-base uppercase tracking-tight">{user?.fullName || user?.firstName}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Subject Input */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-black mb-2 block">
                      Transmission Subject
                    </label>
                    <input
                      type="text"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      placeholder="What is the objective?"
                      className="w-full bg-white border-4 border-black p-4 text-black font-bold placeholder-black/30 focus:outline-none focus:bg-[#BFFF00]/20 focus:border-black transition-colors"
                    />
                  </div>

                  {/* Message Input */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-black mb-2 block">
                      Message Payload *
                    </label>
                    <textarea
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Detail your parameters here..."
                      rows={5}
                      className="w-full bg-white border-4 border-black p-4 text-black font-bold placeholder-black/30 focus:outline-none focus:bg-[#BFFF00]/20 focus:border-black transition-colors resize-none"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={!loading ? { y: -4, x: -4, boxShadow: "6px 6px 0px 0px rgba(0,0,0,1)" } : {}}
                  className="w-full flex items-center justify-center gap-3 py-5 bg-black text-[#BFFF00] border-4 border-black font-black uppercase tracking-widest disabled:opacity-50 transition-all cursor-pointer hover:bg-[#BFFF00] hover:text-black mt-4"
                >
                  {loading ? (
                    <>
                      <Loader2 size={20} className="animate-spin stroke-[3px]" /> Transmitting...
                    </>
                  ) : (
                    <>
                      <Send size={20} className="stroke-[3px]" /> Dispatch Data
                    </>
                  )}
                </motion.button>
              </form>
            )}
          </motion.div>

        </div>
      </div>
    </section>
  );
}