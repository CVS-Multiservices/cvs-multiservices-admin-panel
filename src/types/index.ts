// ==================== PAGE ROUTES ====================
export type Page =
  | 'dashboard'
  | 'slides'
  | 'stats'
  | 'features'
  | 'partners'
  | 'blog'
  | 'achievements'
  | 'team'
  | 'timeline'
  | 'ongoing-projects'
  | 'upcoming-projects'
  | 'testimonials'
  | 'jobs'
  | 'gallery'
  | 'contact'
  | 'csr'
  | 'links'
  | 'login'
  | 'history'
  | 'forgot-password';

// ==================== UI ====================
export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

// ==================== SLIDES ====================
export interface Slide {
  id: string;
  title: string;
  subtitle: string;
  desc: string;
  img: string;
  tag: string;
  color: string;
}

// ==================== STATS ====================
export interface Stat {
  id: string;
  icon: string;
  value: number;
  suffix: string;
  label: string;
  color: string;
}

// ==================== FEATURES / SERVICES ====================
export interface SubService {
  id: string;
  title: string;
  icon: string;
  image: string;
  shortDesc: string;
  fullDesc: string;
  features: string[];
}

export interface Feature {
  id: string;
  icon: string;
  title: string;
  shortDesc: string;
  img: string;
  color: string;
  index: number;
  subServices: SubService[];
}

// ==================== PARTNERS ====================
export interface Partner {
  id: string;
  name: string;
  logo: string;
  industry: string;
}

// ==================== BLOG ====================
export interface BlogPost {
  id: string;
  date: string;
  category: string;
  title: string;
  excerpt: string;
  fullContent: string;
  img: string;
  readTime: string;
  author: string;
  tags: string[];
}

// ==================== ACHIEVEMENTS ====================
export interface Achievement {
  id: string;
  icon: string;
  title: string;
  desc: string;
  year: string;
}

// ==================== TEAM ====================
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  img: string;
  desc: string;
}

// ==================== TIMELINE ====================
export interface TimelineEvent {
  id: string;
  year: string;
  title: string;
  subtitle: string;
  description: string;
  highlights: string[];
  icon: string;
  featured: boolean;
}

// ==================== ONGOING PROJECTS ====================
export interface OngoingProject {
  id: string;
  title: string;
  client: string;
  location: string;
  category: string;
  icon: string;
  image: string;
  progress: number;
  startDate: string;
  expectedEnd: string;
  description: string;
  highlights: string[];
  teamSize: number;
  status: string;
}

// ==================== UPCOMING PROJECTS ====================
export interface UpcomingProject {
  id: string;
  title: string;
  client: string;
  location: string;
  category: string;
  icon: string;
  image: string;
  estimatedStart: string;
  estimatedDuration: string;
  estimatedValue: string;
  description: string;
  highlights: string[];
  status: string;
}

// ==================== TESTIMONIALS ====================
export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  image: string;
  rating: number;
  text: string;
  project: string;
  date: string;
  featured: boolean;
}

// ==================== JOBS ====================
export interface SalaryRange {
  min: number;
  max: number;
  currency: string;
}

export interface JobListing {
  id: string;
  title: string;
  company: string;
  department: string;
  location: string;
  type: string;
  experience: string;
  salary: SalaryRange;
  postedDate: string;
  closingDate: string;
  isUrgent: boolean;
  isFeatured: boolean;
  description: string;
  requirements: string[];
  skills: string[];
  positionCount: number;
}

// ==================== CSR ====================
export interface CsrInitiative {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  date: string;
  impact: string;
  location: string;
}

// ==================== GALLERY ====================
export interface GalleryItem {
  id: string;
  title: string;
  image: string;
  category: string;
  description: string;
  date: string;
  location: string;
}

// ==================== CONTACT ====================
export interface ContactInfoItem {
  icon: string;
  title: string;
  lines: string[];
  actionLabel: string;
  actionUrl: string;
}

export interface Branch {
  id: string;
  label: string;
  city: string;
  country: string;
  flag: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
  mapSrc: string;
  mapUrl: string;
  color: string;
}

export interface ContactItem {
  id: string;
  contactInfo: ContactInfoItem[];
  branches: Branch[];
}

// ==================== LINKS ====================
export interface LinksItem {
  id: string;
  whatsappChat: string;
  linkedin: string;
  instagram: string;
  youtube: string;
  facebook: string;
  x: string;
}

// ==================== DASHBOARD SUMMARY ====================
// Utility type used by DashboardPage to count all collections
export interface DashboardCounts {
  slides: number;
  stats: number;
  features: number;
  partners: number;
  blogPosts: number;
  achievements: number;
  team: number;
  timelineEvents: number;
  ongoingProjects: number;
  upcomingProjects: number;
  testimonials: number;
  jobListings: number;
  csrInitiatives: number;
  galleryItems: number;
  contactItems: number;
  links: number; 
}

