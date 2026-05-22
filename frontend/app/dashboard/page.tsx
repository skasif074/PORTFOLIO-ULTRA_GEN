'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, FolderKanban, Wrench, User, Mail,
  FileText, Award, Link2, Trophy, LogOut, Menu, X,
  BarChart3, Loader2
} from 'lucide-react';
import { useClerk } from '@clerk/nextjs';

import OverviewTab from '@/components/dashboard/OverviewTab';
import AboutTab from '@/components/dashboard/AboutTab';
import ProjectsTab from '@/components/dashboard/ProjectsTab';
import SkillsTab from '@/components/dashboard/SkillsTab';
import MessagesTab from '@/components/dashboard/MessagesTab';
import ResumeTab from '@/components/dashboard/ResumeTab';
import AchievementsTab from '@/components/dashboard/AchievementsTab';
import CertificationsTab from '@/components/dashboard/CertificationsTab';

const tabs = [
  { id: 'overview',       label: 'Overview',       icon: LayoutDashboard },
  { id: 'about',          label: 'About',          icon: User },
  { id: 'projects',       label: 'Projects',       icon: FolderKanban },
  { id: 'skills',         label: 'Skills',         icon: Wrench },
  { id: 'achievements',   label: 'Achievements',   icon: Trophy },
  { id: 'certifications', label: 'Certifications', icon: Award },
  { id: 'messages',       label: 'Messages',       icon: Mail },
  { id: 'resume',         label: 'Resume',         icon: FileText },
];

export default function DashboardPage() {
  const { isSignedIn, user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isAdmin = user?.id === process.env.NEXT_PUBLIC_ADMIN_USER_ID;

  useEffect(() => {
    if (isLoaded && (!isSignedIn || !isAdmin)) router.push('/');
  }, [isLoaded, isSignedIn, isAdmin]);

  if (!isLoaded) return (
    <div className="min-h-screen bg-deep-dark flex items-center justify-center">
      <Loader2 className="animate-spin text-electric-blue" size={32} />
    </div>
  );

  if (!isSignedIn || !isAdmin) return null;

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':       return <OverviewTab />;
      case 'about':          return <AboutTab />;
      case 'projects':       return <ProjectsTab />;
      case 'skills':         return <SkillsTab />;
      case 'achievements':   return <AchievementsTab />;
      case 'certifications': return <CertificationsTab />;
      case 'messages':       return <MessagesTab />;
      case 'resume':         return <ResumeTab />;
      default:               return <OverviewTab />;
    }
  };

  return (
    <div className="min-h-screen bg-deep-dark flex">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 glass border-r border-white/5 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-electric-blue to-neon-purple flex items-center justify-center glow-blue">
              <BarChart3 size={18} className="text-white" />
            </div>
            <div>
              <p className="font-display text-sm font-bold gradient-text">DASHBOARD</p>
              <p className="text-xs text-slate-500">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
              whileHover={{ x: 4 }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-electric-blue/20 to-neon-purple/20 text-white border border-electric-blue/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon size={16} className={activeTab === tab.id ? 'text-electric-blue' : ''} />
              {tab.label}
            </motion.button>
          ))}
        </nav>

        {/* User + logout */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 mb-3 px-2">
            <img src={user?.imageUrl} alt="avatar" className="w-8 h-8 rounded-full border border-electric-blue/30" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">{user?.firstName}</p>
              <p className="text-xs text-emerald-accent">Admin</p>
            </div>
          </div>
          <button
            onClick={() => signOut(() => router.push('/'))}
            className="w-full flex items-center gap-2 px-4 py-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-400/10 text-sm transition-all"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="glass border-b border-white/5 px-6 py-4 flex items-center gap-4">
          <button className="lg:hidden text-slate-400" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <div>
            <h1 className="font-display text-lg font-bold text-white capitalize">{activeTab}</h1>
            <p className="text-xs text-slate-500">Manage your portfolio content</p>
          </div>
          <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-accent/10 border border-emerald-accent/20">
            <span className="w-1.5 h-1.5 bg-emerald-accent rounded-full animate-pulse" />
            <span className="text-emerald-accent text-xs font-mono">Live</span>
          </div>
        </header>

        {/* Tab content */}
        <main className="flex-1 overflow-auto p-6">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderTab()}
          </motion.div>
        </main>
      </div>
    </div>
  );
}