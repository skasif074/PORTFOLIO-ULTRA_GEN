export interface About {
  id: string;
  name: string;
  title: string;
  tagline: string;
  bio: string;
  profile_image_url: string;
  resume_url: string;
  location: string;
  email: string;
  phone: string;
  career_goal: string;
  years_of_experience: number;
  available_for_work: boolean;
  experience: Experience[];
  education: Education[];
  social_links: SocialLink[];
  achievements: Achievement[];
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  description: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  location: string;
  company_logo_url: string;
  technologies: string[];
  sort_order: number;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  gpa: string;
  description: string;
  institution_logo_url: string;
  sort_order: number;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  proficiency: number;
  icon_url: string;
  color: string;
  is_featured: boolean;
  sort_order: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  long_description: string;
  tech_stack: string[];
  github_url: string;
  live_url: string;
  thumbnail_url: string;
  screenshots: string[];
  category: string;
  is_featured: boolean;
  views: number;
  likes: number;
  status: 'completed' | 'in_progress' | 'archived';
  sort_order: number;
  created_at: string;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string;
  is_visible: boolean;
  sort_order: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  date: string;
  sort_order: number;
}

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  issue_date: string;
  expiry_date: string;
  credential_id: string;
  credential_url: string;
  image_url: string;
  sort_order: number;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  is_replied: boolean;
  created_at: string;
}

export interface Resume {
  id: string;
  title: string;
  file_url: string;
  is_active: boolean;
  download_count: number;
  created_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
