'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import api from '@/lib/api';
import { About, Project, Skill } from '@/types';
import Navbar from '@/components/layout/Navbar';
import HeroSection from '@/components/sections/HeroSection';
import AboutSection from '@/components/sections/AboutSection';
import SkillsSection from '@/components/sections/SkillsSection';
import ProjectsSection from '@/components/sections/ProjectsSection';
import ContactSection from '@/components/sections/ContactSection';
import FooterSection from '@/components/sections/FooterSection';
import ParticleBackground from '@/components/animations/ParticleBackground';
import ScrollProgress from '@/components/animations/ScrollProgress';
import CursorGlow from '@/components/animations/CursorGlow';
import LoadingScreen from '@/components/animations/LoadingScreen';
import ChatWidget from '@/components/chat/ChatWidget';
import AchievementsSection from '@/components/sections/AchievementsSection';
import CertificationsSection from '@/components/sections/CertificationsSection';
export default function HomePage() {
  const { user, isLoaded } = useUser();
  const [about, setAbout] = useState<About | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.id === process.env.NEXT_PUBLIC_ADMIN_USER_ID;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aboutRes, projectsRes, skillsRes] = await Promise.all([
          api.get('/api/about'),
          api.get('/api/projects?limit=6&featured=true'),
          api.get('/api/skills'),
        ]);
        setAbout(aboutRes.data.data);
        setProjects(projectsRes.data.data);
        setSkills(skillsRes.data.data);
      } catch (err) {
        console.error('Failed to fetch portfolio data:', err);
      } finally {
        setTimeout(() => setLoading(false), 1500);
      }
    };
    fetchData();
    api.post('/api/analytics/track', { page: '/', event_type: 'page_view' }).catch(() => {});
  }, []);

  if (loading || !isLoaded) return <LoadingScreen />;

  return (
    <main className="relative min-h-screen bg-deep-dark overflow-x-hidden">
      <ParticleBackground />
      <CursorGlow />
      <ScrollProgress />
      <Navbar about={about} />
      <HeroSection about={about} />
      <AboutSection about={about} />
      <SkillsSection skills={skills} />
      <ProjectsSection projects={projects} />
      <AchievementsSection />
      <CertificationsSection />
      <ContactSection about={about} />
      <FooterSection about={about} />
      {/* Only show chat bubble to non-admin users */}
      {!isAdmin && <ChatWidget />}
    </main>
  );
}