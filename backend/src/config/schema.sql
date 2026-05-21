-- ============================================================
-- PORTFOLIO CMS - SUPABASE DATABASE SCHEMA
-- Run this in your Supabase SQL Editor to set up all tables
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ABOUT TABLE - Portfolio owner's personal info
-- ============================================================
CREATE TABLE IF NOT EXISTS about (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Your Name',
  title TEXT NOT NULL DEFAULT 'Full Stack Developer',
  tagline TEXT DEFAULT 'Building the future, one line at a time',
  bio TEXT DEFAULT 'Write your bio here...',
  profile_image_url TEXT DEFAULT '',
  resume_url TEXT DEFAULT '',
  location TEXT DEFAULT '',
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  career_goal TEXT DEFAULT '',
  years_of_experience INTEGER DEFAULT 0,
  available_for_work BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- EXPERIENCE TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS experience (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  description TEXT DEFAULT '',
  start_date TEXT NOT NULL,
  end_date TEXT DEFAULT 'Present',
  is_current BOOLEAN DEFAULT false,
  location TEXT DEFAULT '',
  company_logo_url TEXT DEFAULT '',
  technologies TEXT[] DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- EDUCATION TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS education (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  institution TEXT NOT NULL,
  degree TEXT NOT NULL,
  field TEXT DEFAULT '',
  start_date TEXT NOT NULL,
  end_date TEXT DEFAULT 'Present',
  is_current BOOLEAN DEFAULT false,
  gpa TEXT DEFAULT '',
  description TEXT DEFAULT '',
  institution_logo_url TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SKILLS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS skills (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Other',
  proficiency INTEGER DEFAULT 80 CHECK (proficiency >= 0 AND proficiency <= 100),
  icon_url TEXT DEFAULT '',
  color TEXT DEFAULT '#3B82F6',
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PROJECTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  long_description TEXT DEFAULT '',
  tech_stack TEXT[] DEFAULT '{}',
  github_url TEXT DEFAULT '',
  live_url TEXT DEFAULT '',
  thumbnail_url TEXT DEFAULT '',
  screenshots TEXT[] DEFAULT '{}',
  category TEXT DEFAULT 'Web',
  is_featured BOOLEAN DEFAULT false,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'in_progress', 'archived')),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CERTIFICATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS certifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  issuer TEXT NOT NULL,
  issue_date TEXT NOT NULL,
  expiry_date TEXT DEFAULT '',
  credential_id TEXT DEFAULT '',
  credential_url TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SOCIAL LINKS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS social_links (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT DEFAULT '',
  is_visible BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ACHIEVEMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  icon TEXT DEFAULT '🏆',
  date TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CONTACT MESSAGES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT DEFAULT '',
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  is_replied BOOLEAN DEFAULT false,
  ip_address TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ANALYTICS TABLE - Page view tracking
-- ============================================================
CREATE TABLE IF NOT EXISTS analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  page TEXT NOT NULL,
  event_type TEXT DEFAULT 'page_view',
  metadata JSONB DEFAULT '{}',
  ip_address TEXT DEFAULT '',
  user_agent TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PROJECT VIEWS TABLE - Per-project view tracking
-- ============================================================
CREATE TABLE IF NOT EXISTS project_views (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  ip_address TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- RESUMES TABLE - Multiple resume management
-- ============================================================
CREATE TABLE IF NOT EXISTS resumes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'Resume',
  file_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ADMIN ACTIVITY LOG TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_activity_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT DEFAULT '',
  description TEXT DEFAULT '',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TRIGGERS: Auto-update updated_at timestamps
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_about_updated_at BEFORE UPDATE ON about
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_experience_updated_at BEFORE UPDATE ON experience
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_education_updated_at BEFORE UPDATE ON education
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_skills_updated_at BEFORE UPDATE ON skills
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_certifications_updated_at BEFORE UPDATE ON certifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_links_updated_at BEFORE UPDATE ON social_links
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resumes_updated_at BEFORE UPDATE ON resumes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
-- Enable RLS on all tables
ALTER TABLE about ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE education ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;

-- Public READ policies (anyone can read portfolio content)
CREATE POLICY "Public read about" ON about FOR SELECT USING (true);
CREATE POLICY "Public read experience" ON experience FOR SELECT USING (true);
CREATE POLICY "Public read education" ON education FOR SELECT USING (true);
CREATE POLICY "Public read skills" ON skills FOR SELECT USING (true);
CREATE POLICY "Public read projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Public read certifications" ON certifications FOR SELECT USING (true);
CREATE POLICY "Public read social_links" ON social_links FOR SELECT USING (true);
CREATE POLICY "Public read achievements" ON achievements FOR SELECT USING (true);
CREATE POLICY "Public read resumes" ON resumes FOR SELECT USING (is_active = true);

-- Public INSERT policies (visitors can submit contact forms and analytics)
CREATE POLICY "Public insert contact_messages" ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert analytics" ON analytics FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert project_views" ON project_views FOR INSERT WITH CHECK (true);

-- Service role has full access (used by backend with supabaseAdmin client)
-- The service role key bypasses RLS by default in Supabase

-- ============================================================
-- SEED DATA - Default about section
-- ============================================================
INSERT INTO about (
  name, title, tagline, bio, location, email,
  career_goal, years_of_experience, available_for_work
) VALUES (
  'Your Name',
  'Full Stack Developer',
  'Building the future, one line at a time',
  'Passionate developer who loves crafting beautiful and performant web applications. Specializing in modern full-stack development with a focus on user experience.',
  'Your City, Country',
  'your@email.com',
  'To build impactful products that solve real-world problems using cutting-edge technology.',
  2,
  true
) ON CONFLICT DO NOTHING;

-- Seed social links
INSERT INTO social_links (platform, url, icon, sort_order) VALUES
  ('GitHub', 'https://github.com/yourusername', 'github', 1),
  ('LinkedIn', 'https://linkedin.com/in/yourusername', 'linkedin', 2),
  ('Twitter', 'https://twitter.com/yourusername', 'twitter', 3),
  ('Portfolio', 'https://yourportfolio.com', 'globe', 4)
ON CONFLICT DO NOTHING;
