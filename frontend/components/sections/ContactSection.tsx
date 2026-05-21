'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Send, Mail, MapPin, MessageSquare, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useUser, SignInButton } from '@clerk/nextjs';
import api from '@/lib/api';
import { About } from '@/types';

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
      toast.error('Please sign in to send a message');
      return;
    }
    if (!form.message) {
      toast.error('Please write a message');
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
      toast.success("Message sent! I'll get back to you soon 🚀");
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err: any) {
      toast.error(err.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" ref={ref} className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-glow/3 to-transparent" />
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <p className="text-cyan-glow font-mono text-sm mb-3 tracking-widest uppercase">// get in touch</p>
          <h2 className="font-display text-4xl lg:text-5xl font-black gradient-text">Contact Me</h2>
          <div className="mt-4 mx-auto w-24 h-0.5 bg-gradient-to-r from-electric-blue to-neon-purple rounded-full" />
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-12 items-start">
          {/* Left info */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            <div className="glass rounded-2xl p-6 gradient-border">
              <h3 className="font-display text-xl font-bold text-white mb-4">Let's Build Something</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Open to internship opportunities, freelance projects, and collaborations.
                Sign in and send me a message — I'll reply directly in the chat bubble!
              </p>
            </div>

            {[
              { icon: Mail, label: 'Email', value: about?.email || 'your@email.com', color: 'text-electric-blue', bg: 'bg-electric-blue/10' },
              { icon: MapPin, label: 'Location', value: about?.location || 'India', color: 'text-neon-purple', bg: 'bg-neon-purple/10' },
              { icon: MessageSquare, label: 'Response Time', value: 'Within 24 hours', color: 'text-cyan-glow', bg: 'bg-cyan-glow/10' },
            ].map((item) => (
              <motion.div
                key={item.label}
                whileHover={{ x: 4 }}
                className="flex items-center gap-4 glass rounded-xl p-4 border border-white/5 hover:border-electric-blue/20 transition-all"
              >
                <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center`}>
                  <item.icon size={18} className={item.color} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">{item.label}</p>
                  <p className="text-sm text-slate-300 font-medium">{item.value}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Right form */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3 }}
            className="lg:col-span-3"
          >
            {!isSignedIn ? (
              /* Not signed in — show sign in prompt */
              <div className="glass rounded-2xl p-12 gradient-border text-center space-y-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-electric-blue/20 to-neon-purple/20 flex items-center justify-center mx-auto">
                  <MessageSquare size={28} className="text-electric-blue" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-white mb-2">Sign in to send a message</h3>
                  <p className="text-slate-400 text-sm">
                    Sign in with Google to send me a message and get a reply directly in the chat bubble.
                  </p>
                </div>
                <SignInButton mode="modal">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-electric-blue to-neon-purple text-white font-semibold glow-blue"
                  >
                    Sign In with Google
                  </motion.button>
                </SignInButton>
              </div>
            ) : (
              /* Signed in — show form */
              <form onSubmit={handleSubmit} className="glass rounded-2xl p-8 gradient-border space-y-5">
                {/* Signed in as */}
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-accent/5 border border-emerald-accent/20">
                  <img src={user?.imageUrl} className="w-8 h-8 rounded-full" alt="avatar" />
                  <div>
                    <p className="text-emerald-accent text-xs font-medium">Signed in as</p>
                    <p className="text-white text-sm">{user?.fullName || user?.firstName}</p>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-500 font-mono mb-2 block">Subject</label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder="What's this about?"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-electric-blue/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-500 font-mono mb-2 block">Message *</label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Tell me about your project or idea..."
                    rows={6}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-electric-blue/50 transition-colors resize-none"
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-electric-blue to-neon-purple text-white font-semibold text-sm glow-blue disabled:opacity-50 transition-all"
                >
                  {loading ? <><Loader2 size={16} className="animate-spin" /> Sending...</> : <><Send size={16} /> Send Message</>}
                </motion.button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}