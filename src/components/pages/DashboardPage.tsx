// DashboardPage.tsx
import { useState, useMemo } from 'react';
import {
  Image, BarChart3, Layers, Handshake, Newspaper, Crown,
  Users2, Clock, FolderKanban, Rocket, MessageSquare,
  BriefcaseBusiness, Heart, GalleryHorizontal, MapPin, Link,
  ChevronDown, ChevronRight, BookOpen, AlertCircle,
  CheckCircle2, ArrowRight, Lightbulb, Shield,
  MousePointerClick, ImagePlus, Type, Trash2,
  PenLine, Eye, Save, Plus, Upload, Search,
  Info, Star, Zap, History,
} from 'lucide-react';
import { Page } from '../../types';

interface DashboardPageProps {
  slides: any[];
  stats: any[];
  features: any[];
  partners: any[];
  blogPosts: any[];
  achievements: any[];
  team: any[];
  timelineEvents: any[];
  ongoingProjects: any[];
  upcomingProjects: any[];
  testimonials: any[];
  jobListings: any[];
  csrInitiatives: any[];
  galleryItems: any[];
  linksData: any[];
  contactData: any;
  setCurrentPage: (page: Page) => void;
}

// ── Instruction Steps Data ─────────────────────────────────────────
const instructionSections = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: Zap,
    color: 'bg-blue-500',
    colorLight: 'bg-blue-50',
    colorText: 'text-blue-600',
    colorBorder: 'border-blue-200',
    description: 'Learn the basics of navigating and using the admin panel.',
    steps: [
      {
        icon: MousePointerClick,
        title: 'Navigate Using Sidebar',
        description: 'Use the left sidebar to navigate between different sections. Click on any section header to expand it and see available pages. The sidebar can be collapsed by clicking the menu icon in the header.',
      },
      {
        icon: Search,
        title: 'Find What You Need',
        description: 'Each page has its own content area. Use the stats cards below to quickly jump to any section. The card shows the current count of items in each section.',
      },
      {
        icon: Eye,
        title: 'Preview Your Changes',
        description: 'After making changes in the admin panel, visit the main website to see your updates reflected. Most changes appear immediately after saving.',
      },
    ],
  },
  {
    id: 'adding-content',
    title: 'Adding New Content',
    icon: Plus,
    color: 'bg-emerald-500',
    colorLight: 'bg-emerald-50',
    colorText: 'text-emerald-600',
    colorBorder: 'border-emerald-200',
    description: 'How to add new items across all sections.',
    steps: [
      {
        icon: Plus,
        title: 'Click "Add New" Button',
        description: 'Every section page has an "Add New" or "+" button at the top right. Click it to open the creation form. The button color is blue across all sections for consistency.',
      },
      {
        icon: Type,
        title: 'Fill in the Required Fields',
        description: 'Fields marked with a red asterisk (*) are required. You cannot save the form without filling them. Common required fields include Title, Description, and Image.',
      },
      {
        icon: ImagePlus,
        title: 'Upload Images',
        description: 'Click the image upload area or drag & drop an image. Images are automatically resized to the recommended dimensions shown below the upload area. Supported formats: JPG, PNG, WebP. Max size varies by section.',
      },
      {
        icon: Save,
        title: 'Save Your Content',
        description: 'Click the "Create" or "Save" button at the bottom of the form. A success toast notification will appear confirming your content has been saved. If there are errors, they will be highlighted in the form.',
      },
    ],
  },
  {
    id: 'editing-content',
    title: 'Editing Existing Content',
    icon: PenLine,
    color: 'bg-amber-500',
    colorLight: 'bg-amber-50',
    colorText: 'text-amber-600',
    colorBorder: 'border-amber-200',
    description: 'How to modify items that already exist.',
    steps: [
      {
        icon: PenLine,
        title: 'Click the Edit Icon',
        description: 'Each item card has a pencil/edit icon button. Click it to open the edit form pre-filled with existing data. You can modify any field you need.',
      },
      {
        icon: Upload,
        title: 'Replace Images (Optional)',
        description: "To change an image, click the existing image preview or the upload area. The old image will be automatically replaced. If you don't upload a new image, the existing one stays.",
      },
      {
        icon: Save,
        title: 'Save Changes',
        description: 'Click "Update" to save your modifications. The changes will reflect immediately. A success toast will confirm the update.',
      },
    ],
  },
  {
    id: 'deleting-content',
    title: 'Deleting Content',
    icon: Trash2,
    color: 'bg-red-500',
    colorLight: 'bg-red-50',
    colorText: 'text-red-600',
    colorBorder: 'border-red-200',
    description: 'How to safely remove items.',
    steps: [
      {
        icon: Trash2,
        title: 'Click the Delete Icon',
        description: 'Each item card has a trash/delete icon button (usually red). Click it to initiate deletion.',
      },
      {
        icon: AlertCircle,
        title: 'Confirm Deletion',
        description: 'A confirmation dialog will appear asking "Are you sure?". This is a safety measure to prevent accidental deletions. Click "Delete" to confirm or "Cancel" to go back.',
      },
      {
        icon: Shield,
        title: 'Deletion is Permanent',
        description: 'Once confirmed, the item is permanently removed from the database. Associated images on Cloudinary are also deleted. This action cannot be undone.',
      },
    ],
  },
  {
    id: 'image-guidelines',
    title: 'Image Guidelines',
    icon: ImagePlus,
    color: 'bg-violet-500',
    colorLight: 'bg-violet-50',
    colorText: 'text-violet-600',
    colorBorder: 'border-violet-200',
    description: 'Recommended image sizes for each section.',
    steps: [
      {
        icon: Image,
        title: 'Hero Slides: 1920 × 1080px (16:9)',
        description: 'Full-width banner images for the homepage hero slider. Use high-resolution landscape photos. These are the most prominent images on the website.',
      },
      {
        icon: Layers,
        title: 'Services: 1200 × 800px (3:2)',
        description: 'Service category images. Sub-service images are 800 × 500px (16:10). Use clear, relevant photos that represent each service.',
      },
      {
        icon: Users2,
        title: 'Team: 500 × 500px (1:1)',
        description: 'Square profile photos for team members. Use professional headshots with clean backgrounds for best results.',
      },
      {
        icon: GalleryHorizontal,
        title: 'Gallery: 1200 × 800px (3:2)',
        description: 'Project and work gallery images. Use high-quality photos showcasing completed work and facilities.',
      },
      {
        icon: Handshake,
        title: 'Partners: 400 × 200px (2:1)',
        description: 'Company logos for the partners section. Use transparent PNG logos when possible for the cleanest look.',
      },
      {
        icon: Newspaper,
        title: 'Blog: 1200 × 630px (≈1.9:1)',
        description: 'Blog post cover images. Use engaging, relevant photos. These appear as thumbnails in the blog listing and as headers in full posts.',
      },
    ],
  },
  {
    id: 'section-guide',
    title: 'Section-by-Section Guide',
    icon: BookOpen,
    color: 'bg-cyan-500',
    colorLight: 'bg-cyan-50',
    colorText: 'text-cyan-600',
    colorBorder: 'border-cyan-200',
    description: 'What each section manages on the website.',
    steps: [
      {
        icon: Image,
        title: 'Hero Slides',
        description: 'Manages the homepage hero/banner slider. Each slide has a background image, title, subtitle, and optional CTA button. Control the display order using the index field.',
      },
      {
        icon: BarChart3,
        title: 'Stats Bar',
        description: 'The animated statistics counter section on the homepage. Each stat has a number, label, suffix (like "+" or "%"), and an icon.',
      },
      {
        icon: Layers,
        title: 'Services',
        description: 'Main services with nested sub-services. Each service has its own page on the website. Sub-services include detailed descriptions, features list, and individual images.',
      },
      {
        icon: FolderKanban,
        title: 'Projects (Ongoing & Upcoming)',
        description: 'Showcase current and planned projects. Include project name, description, client info, location, and progress status for ongoing projects.',
      },
      {
        icon: Newspaper,
        title: 'Blog Posts',
        description: 'News and article section. Each post has a title, content, cover image, author, date, and category tags.',
      },
      {
        icon: BriefcaseBusiness,
        title: 'Job Listings',
        description: 'Career opportunities section. Add job title, description, requirements, location, type (full-time/part-time), and application details.',
      },
      {
        icon: MapPin,
        title: 'Contact & Links',
        description: 'Manages contact information (addresses, phones, emails) and social media links (Facebook, Instagram, YouTube, LinkedIn, X/Twitter).',
      },
    ],
  },
  {
    id: 'tips',
    title: 'Pro Tips & Best Practices',
    icon: Lightbulb,
    color: 'bg-orange-500',
    colorLight: 'bg-orange-50',
    colorText: 'text-orange-600',
    colorBorder: 'border-orange-200',
    description: 'Tips to manage your content effectively.',
    steps: [
      {
        icon: Star,
        title: 'Use Display Order (Index)',
        description: 'Most sections have an "index" or "order" field. Lower numbers appear first. Use increments of 1 (0, 1, 2, 3...) to easily reorder items later.',
      },
      {
        icon: Type,
        title: 'Keep Descriptions Concise',
        description: 'Short descriptions should be 1-2 sentences max. They appear as previews and summaries. Full descriptions can be longer and support multiple paragraphs.',
      },
      {
        icon: ImagePlus,
        title: 'Optimize Images Before Upload',
        description: 'While the system auto-resizes images, uploading already-optimized images (under 2MB) will be faster. Use WebP format for best compression.',
      },
      {
        icon: Shield,
        title: 'Regular Content Review',
        description: 'Periodically review all sections to ensure information is current. Remove outdated job listings, update completed projects, and refresh blog content.',
      },
      {
        icon: CheckCircle2,
        title: 'Test on Mobile',
        description: 'After making changes, check how they look on both desktop and mobile. The website is responsive, but content length can affect layout on smaller screens.',
      },
    ],
  },
];

// ── Collapsible Instruction Section ───────────────────────────────
function InstructionSection({
  section,
  isExpanded,
  onToggle,
}: {
  section: (typeof instructionSections)[0];
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const SectionIcon = section.icon;
  return (
    <div
      className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
        isExpanded
          ? `${section.colorBorder} ${section.colorLight}`
          : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 text-left transition-colors hover:bg-slate-50/50"
      >
        <div
          className={`w-10 h-10 ${section.color} rounded-xl flex items-center justify-center flex-shrink-0 transition-transform ${
            isExpanded ? 'scale-110' : ''
          }`}
        >
          <SectionIcon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-slate-800">{section.title}</h3>
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{section.description}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full font-medium">
            {section.steps.length} steps
          </span>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-slate-200/60 pt-4">
          {section.steps.map((step, idx) => {
            const StepIcon = step.icon;
            return (
              <div key={idx} className="flex gap-3 p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <div className={`w-8 h-8 ${section.colorLight} rounded-lg flex items-center justify-center`}>
                    <StepIcon className={`w-4 h-4 ${section.colorText}`} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-slate-700 mb-1">{step.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────
function getLatestActivity(item: any): { date: Date | null; action: 'created' | 'edited' } {
  const created = item.createdAt ? new Date(item.createdAt) : null;
  const updated = item.updatedAt ? new Date(item.updatedAt) : null;

  if (updated && created && updated.getTime() > created.getTime()) {
    return { date: updated, action: 'edited' };
  }
  return { date: created, action: 'created' };
}

function getItemName(item: any): string {
  return item.title || item.name || item.label || item.heading || item.question || 'Item';
}

function timeAgo(date: Date): string {
  const now = new Date();
  const diffMs  = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHrs = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffSec < 60)  return 'Just now';
  if (diffMin < 60)  return `${diffMin}m ago`;
  if (diffHrs < 24)  return `${diffHrs}h ago`;
  if (diffDays < 7)  return `${diffDays}d ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ── Section Config for History ─────────────────────────────────────
const sectionConfig: {
  key: string;
  label: string;
  icon: any;
  color: string;
  lightBg: string;
  textColor: string;
  page: Page;
}[] = [
  { key: 'slides',           label: 'Hero Slides',       icon: Image,             color: 'bg-blue-500',    lightBg: 'bg-blue-50',    textColor: 'text-blue-600',    page: 'slides' },
  { key: 'stats',            label: 'Stats Cards',       icon: BarChart3,         color: 'bg-emerald-500', lightBg: 'bg-emerald-50', textColor: 'text-emerald-600', page: 'stats' },
  { key: 'features',         label: 'Services',          icon: Layers,            color: 'bg-amber-500',   lightBg: 'bg-amber-50',   textColor: 'text-amber-600',   page: 'features' },
  { key: 'partners',         label: 'Partners',          icon: Handshake,         color: 'bg-rose-500',    lightBg: 'bg-rose-50',    textColor: 'text-rose-600',    page: 'partners' },
  { key: 'blogPosts',        label: 'Blog Posts',        icon: Newspaper,         color: 'bg-violet-500',  lightBg: 'bg-violet-50',  textColor: 'text-violet-600',  page: 'blog' },
  { key: 'achievements',     label: 'Achievements',      icon: Crown,             color: 'bg-cyan-500',    lightBg: 'bg-cyan-50',    textColor: 'text-cyan-600',    page: 'achievements' },
  { key: 'team',             label: 'Team Members',      icon: Users2,            color: 'bg-orange-500',  lightBg: 'bg-orange-50',  textColor: 'text-orange-600',  page: 'team' },
  { key: 'timelineEvents',   label: 'Timeline Events',   icon: Clock,             color: 'bg-teal-500',    lightBg: 'bg-teal-50',    textColor: 'text-teal-600',    page: 'timeline' },
  { key: 'ongoingProjects',  label: 'Ongoing Projects',  icon: FolderKanban,      color: 'bg-sky-500',     lightBg: 'bg-sky-50',     textColor: 'text-sky-600',     page: 'ongoing-projects' },
  { key: 'upcomingProjects', label: 'Upcoming Projects', icon: Rocket,            color: 'bg-indigo-500',  lightBg: 'bg-indigo-50',  textColor: 'text-indigo-600',  page: 'upcoming-projects' },
  { key: 'testimonials',     label: 'Testimonials',      icon: MessageSquare,     color: 'bg-pink-500',    lightBg: 'bg-pink-50',    textColor: 'text-pink-600',    page: 'testimonials' },
  { key: 'jobListings',      label: 'Job Listings',      icon: BriefcaseBusiness, color: 'bg-slate-600',   lightBg: 'bg-slate-50',   textColor: 'text-slate-600',   page: 'jobs' },
  { key: 'csrInitiatives',   label: 'CSR Initiatives',   icon: Heart,             color: 'bg-green-500',   lightBg: 'bg-green-50',   textColor: 'text-green-600',   page: 'csr' },
  { key: 'galleryItems',     label: 'Gallery',           icon: GalleryHorizontal, color: 'bg-fuchsia-500', lightBg: 'bg-fuchsia-50', textColor: 'text-fuchsia-600', page: 'gallery' },
];

// ── Main Dashboard ─────────────────────────────────────────────────
export function DashboardPage({
  slides, stats, features, partners, blogPosts, achievements,
  team, timelineEvents, ongoingProjects, upcomingProjects,
  testimonials, jobListings, csrInitiatives, galleryItems,
  contactData, linksData, setCurrentPage,
}: DashboardPageProps) {

  const [expandedInstructions, setExpandedInstructions] = useState<Record<string, boolean>>({
    'getting-started': true,
  });
  const [showAllStats, setShowAllStats]       = useState(false);
  const [historyFilter, setHistoryFilter]     = useState<'all' | 'created' | 'edited'>('all');
  const [historySection, setHistorySection]   = useState<string>('all');
  const [showAllHistory, setShowAllHistory]   = useState(false);

  // ── Contact count — safely handle all shapes ──────────────────
  const contactCount = useMemo(() => {
    if (!contactData) return 0;

    // If contactData is an array (array of docs), sum their sub-arrays
    if (Array.isArray(contactData)) {
      return contactData.reduce((sum: number, doc: any) => {
        const info     = Array.isArray(doc?.contactInfo) ? doc.contactInfo.length : 0;
        const branches = Array.isArray(doc?.branches)    ? doc.branches.length    : 0;
        return sum + info + branches;
      }, 0);
    }

    // If contactData is a single object
    const info     = Array.isArray(contactData.contactInfo) ? contactData.contactInfo.length : 0;
    const branches = Array.isArray(contactData.branches)    ? contactData.branches.length    : 0;
    return info + branches;
  }, [contactData]);

  const linksCount = useMemo(() => {
    if (!linksData) return 0;
    if (Array.isArray(linksData)) return linksData.length;
    return 0;
  }, [linksData]);

  // ── All data map for history ───────────────────────────────────
  const allDataMap: Record<string, any[]> = {
    slides, stats, features, partners, blogPosts, achievements,
    team, timelineEvents, ongoingProjects, upcomingProjects,
    testimonials, jobListings, csrInitiatives, galleryItems,
  };

  // ── Build history entries (no user field) ─────────────────────
  const historyEntries = useMemo(() => {
    const entries: {
      item: any;
      sectionKey: string;
      sectionLabel: string;
      sectionIcon: any;
      sectionColor: string;
      sectionLightBg: string;
      sectionTextColor: string;
      sectionPage: Page;
      action: 'created' | 'edited';
      date: Date;
    }[] = [];

    sectionConfig.forEach((sec) => {
      const items = allDataMap[sec.key] || [];
      items.forEach((item) => {
        const { date, action } = getLatestActivity(item);
        if (date) {
          entries.push({
            item,
            sectionKey:      sec.key,
            sectionLabel:    sec.label,
            sectionIcon:     sec.icon,
            sectionColor:    sec.color,
            sectionLightBg:  sec.lightBg,
            sectionTextColor: sec.textColor,
            sectionPage:     sec.page,
            action,
            date,
          });
        }
      });
    });

    entries.sort((a, b) => b.date.getTime() - a.date.getTime());
    return entries;
  }, [
    slides, stats, features, partners, blogPosts, achievements,
    team, timelineEvents, ongoingProjects, upcomingProjects,
    testimonials, jobListings, csrInitiatives, galleryItems,
  ]);

  // ── Filter history ────────────────────────────────────────────
  const filteredHistory = useMemo(() => {
    let filtered = historyEntries;
    if (historyFilter !== 'all') {
      filtered = filtered.filter((e) => e.action === historyFilter);
    }
    if (historySection !== 'all') {
      filtered = filtered.filter((e) => e.sectionKey === historySection);
    }
    return filtered;
  }, [historyEntries, historyFilter, historySection]);

  const visibleHistory = showAllHistory
    ? filteredHistory
    : filteredHistory.slice(0, 4);

  // ── Stats cards ───────────────────────────────────────────────
  const dashboardStats = useMemo(
    () => [
      { label: 'Hero Slides',       count: slides.length,           icon: Image,             color: 'bg-blue-500',    lightBg: 'bg-blue-50',    textColor: 'text-blue-600',    page: 'slides',            desc: 'Homepage banner slides' },
      { label: 'Stats Cards',       count: stats.length,            icon: BarChart3,         color: 'bg-emerald-500', lightBg: 'bg-emerald-50', textColor: 'text-emerald-600', page: 'stats',             desc: 'Animated counter statistics' },
      { label: 'Services',          count: features.length,         icon: Layers,            color: 'bg-amber-500',   lightBg: 'bg-amber-50',   textColor: 'text-amber-600',   page: 'features',          desc: 'Service categories & sub-services' },
      { label: 'Partners',          count: partners.length,         icon: Handshake,         color: 'bg-rose-500',    lightBg: 'bg-rose-50',    textColor: 'text-rose-600',    page: 'partners',          desc: 'Partner company logos' },
      { label: 'Blog Posts',        count: blogPosts.length,        icon: Newspaper,         color: 'bg-violet-500',  lightBg: 'bg-violet-50',  textColor: 'text-violet-600',  page: 'blog',              desc: 'News and articles' },
      { label: 'Achievements',      count: achievements.length,     icon: Crown,             color: 'bg-cyan-500',    lightBg: 'bg-cyan-50',    textColor: 'text-cyan-600',    page: 'achievements',      desc: 'Company milestones' },
      { label: 'Team Members',      count: team.length,             icon: Users2,            color: 'bg-orange-500',  lightBg: 'bg-orange-50',  textColor: 'text-orange-600',  page: 'team',              desc: 'Staff profiles' },
      { label: 'Timeline Events',   count: timelineEvents.length,   icon: Clock,             color: 'bg-teal-500',    lightBg: 'bg-teal-50',    textColor: 'text-teal-600',    page: 'timeline',          desc: 'Company history timeline' },
      { label: 'Ongoing Projects',  count: ongoingProjects.length,  icon: FolderKanban,      color: 'bg-sky-500',     lightBg: 'bg-sky-50',     textColor: 'text-sky-600',     page: 'ongoing-projects',  desc: 'Current active projects' },
      { label: 'Upcoming Projects', count: upcomingProjects.length, icon: Rocket,            color: 'bg-indigo-500',  lightBg: 'bg-indigo-50',  textColor: 'text-indigo-600',  page: 'upcoming-projects', desc: 'Planned future projects' },
      { label: 'Testimonials',      count: testimonials.length,     icon: MessageSquare,     color: 'bg-pink-500',    lightBg: 'bg-pink-50',    textColor: 'text-pink-600',    page: 'testimonials',      desc: 'Client reviews & feedback' },
      { label: 'Job Listings',      count: jobListings.length,      icon: BriefcaseBusiness, color: 'bg-slate-600',   lightBg: 'bg-slate-50',   textColor: 'text-slate-600',   page: 'jobs',              desc: 'Career opportunities' },
      { label: 'CSR Initiatives',   count: csrInitiatives.length,   icon: Heart,             color: 'bg-green-500',   lightBg: 'bg-green-50',   textColor: 'text-green-600',   page: 'csr',               desc: 'Social responsibility programs' },
      { label: 'Gallery',           count: galleryItems.length,     icon: GalleryHorizontal, color: 'bg-fuchsia-500', lightBg: 'bg-fuchsia-50', textColor: 'text-fuchsia-600', page: 'gallery',           desc: 'Photo & project gallery' },
      { label: 'Contact Data',      count: contactCount,            icon: MapPin,            color: 'bg-yellow-500',  lightBg: 'bg-yellow-50',  textColor: 'text-yellow-600',  page: 'contact',           desc: 'Contact info & branch offices' },
      { label: 'Social Links',      count: linksCount,              icon: Link,              color: 'bg-gray-500',    lightBg: 'bg-gray-50',    textColor: 'text-gray-600',    page: 'links',             desc: 'Social media URLs' },
    ],
    [
      slides, stats, features, partners, blogPosts, achievements,
      team, timelineEvents, ongoingProjects, upcomingProjects,
      testimonials, jobListings, csrInitiatives, galleryItems,
      contactCount, linksCount,
    ]
  );

  const totalItems   = dashboardStats.reduce((sum, s) => sum + s.count, 0);
  const visibleStats = showAllStats ? dashboardStats : dashboardStats.slice(0, 8);

  const toggleInstruction = (id: string) => {
    setExpandedInstructions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const allExpanded = instructionSections.every((s) => expandedInstructions[s.id]);

  return (
    <div className="space-y-6">

      {/* ── Welcome Banner ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-6 sm:p-8 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
        <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-white/5 rounded-full" />

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome to CVS Admin Panel</h1>
              <p className="text-blue-100 text-sm sm:text-base max-w-xl">
                Manage all website content from one place. Use the sections below to navigate, edit, and update your website data.
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3 text-center border border-white/10">
                <p className="text-3xl font-bold">{totalItems}</p>
                <p className="text-xs text-blue-200 font-medium mt-0.5">Total Items</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3 text-center border border-white/10">
                <p className="text-3xl font-bold">{dashboardStats.length}</p>
                <p className="text-xs text-blue-200 font-medium mt-0.5">Sections</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content Overview Stats ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">Content Overview</h2>
              <p className="text-xs text-slate-500">Click any card to manage that section</p>
            </div>
          </div>
          {dashboardStats.length > 8 && (
            <button
              onClick={() => setShowAllStats(!showAllStats)}
              className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium transition"
            >
              {showAllStats ? 'Show Less' : `Show All (${dashboardStats.length})`}
              <ChevronDown className={`w-4 h-4 transition-transform ${showAllStats ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>

        <div className="p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {visibleStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <button
                  key={index}
                  onClick={() => setCurrentPage(stat.page as Page)}
                  className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-100
                             hover:border-blue-200 hover:bg-blue-50/50 transition-all group text-left w-full"
                >
                  <div className={`w-11 h-11 ${stat.color} rounded-xl flex items-center justify-center
                                   flex-shrink-0 group-hover:scale-110 transition-transform shadow-sm`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-700 truncate">{stat.label}</p>
                      <span className={`text-lg font-bold ${stat.textColor} flex-shrink-0`}>{stat.count}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{stat.desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 flex-shrink-0
                                         transition-colors opacity-0 group-hover:opacity-100" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Recent Activity ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <History className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">Recent Activity</h2>
              <p className="text-xs text-slate-500">
                {filteredHistory.length} entries · Sorted by most recent
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
              {(['all', 'created', 'edited'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setHistoryFilter(f)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    historyFilter === f
                      ? f === 'created'
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : f === 'edited'
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'bg-white text-slate-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {f === 'all' ? 'All' : f === 'created' ? 'Created' : 'Edited'}
                </button>
              ))}
            </div>

            <select
              value={historySection}
              onChange={(e) => setHistorySection(e.target.value)}
              className="text-xs bg-slate-100 border-none rounded-lg px-3 py-2 text-slate-600
                         font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">All Sections</option>
              {sectionConfig.map((sec) => (
                <option key={sec.key} value={sec.key}>{sec.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          {visibleHistory.length > 0 ? (
            <div className="space-y-2">
              {visibleHistory.map((entry, idx) => {
                const SectionIcon = entry.sectionIcon;
                const itemName    = getItemName(entry.item);
                const itemImage   =
                  entry.item.img   ||
                  entry.item.image ||
                  entry.item.photo ||
                  entry.item.logo  ||
                  null;

                return (
                  <div
                    key={`${entry.sectionKey}-${entry.item.id || idx}-${idx}`}
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-100
                               hover:border-slate-200 hover:bg-slate-50/50 transition-all
                               group cursor-pointer"
                    onClick={() => setCurrentPage(entry.sectionPage)}
                  >
                    {/* Thumbnail or icon */}
                    <div className="flex-shrink-0">
                      {itemImage ? (
                        <div className="w-11 h-11 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                          <img
                            src={itemImage}
                            alt={itemName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      ) : (
                        <div className={`w-11 h-11 ${entry.sectionLightBg} rounded-xl flex items-center justify-center`}>
                          <SectionIcon className={`w-5 h-5 ${entry.sectionTextColor}`} />
                        </div>
                      )}
                    </div>

                    {/* Name + badges — NO user */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-slate-700 truncate">
                          {itemName}
                        </p>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5
                                      text-[10px] font-semibold rounded-full ${
                            entry.action === 'created'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {entry.action === 'created' ? (
                            <><Plus className="w-2.5 h-2.5" /> Created</>
                          ) : (
                            <><PenLine className="w-2.5 h-2.5" /> Edited</>
                          )}
                        </span>
                      </div>

                      {/* Section label only */}
                      <span className={`inline-flex items-center gap-1 text-[10px] font-medium mt-0.5 ${entry.sectionTextColor}`}>
                        <SectionIcon className="w-3 h-3" />
                        {entry.sectionLabel}
                      </span>
                    </div>

                    {/* Time — desktop */}
                    <div className="flex-shrink-0 text-right hidden sm:block">
                      <p className="text-xs font-medium text-slate-500">{timeAgo(entry.date)}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{formatDate(entry.date)}</p>
                    </div>

                    {/* Time — mobile */}
                    <div className="flex-shrink-0 sm:hidden">
                      <p className="text-[10px] font-medium text-slate-400">{timeAgo(entry.date)}</p>
                    </div>

                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500
                                           flex-shrink-0 opacity-0 group-hover:opacity-100
                                           transition hidden sm:block" />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <History className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-500">No activity found</p>
              <p className="text-xs text-slate-400 mt-1">
                {historyFilter !== 'all' || historySection !== 'all'
                  ? 'Try changing the filters above'
                  : 'Activity will appear here as you add or edit content'}
              </p>
            </div>
          )}

          {filteredHistory.length > 10 && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowAllHistory(!showAllHistory)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm text-blue-600
                           hover:text-blue-700 hover:bg-blue-50 font-medium rounded-xl transition"
              >
                {showAllHistory ? 'Show Less' : `Show All (${filteredHistory.length} entries)`}
                <ChevronDown className={`w-4 h-4 transition-transform ${showAllHistory ? 'rotate-180' : ''}`} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Instructions ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">How to Use This Panel</h2>
              <p className="text-xs text-slate-500">Step-by-step instructions for managing website content</p>
            </div>
          </div>
          <button
            onClick={() => {
              const newState: Record<string, boolean> = {};
              instructionSections.forEach((s) => { newState[s.id] = !allExpanded; });
              setExpandedInstructions(newState);
            }}
            className="text-sm text-slate-500 hover:text-blue-600 font-medium transition hidden sm:block"
          >
            {allExpanded ? 'Collapse All' : 'Expand All'}
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-3">
          {instructionSections.map((section) => (
            <InstructionSection
              key={section.id}
              section={section}
              isExpanded={expandedInstructions[section.id] || false}
              onToggle={() => toggleInstruction(section.id)}
            />
          ))}
        </div>

        <div className="px-4 sm:px-5 pb-4 sm:pb-5">
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800">Need Help?</p>
              <p className="text-xs text-blue-600 mt-0.5">
                If you encounter any issues or need assistance, contact the developer.
                All sections follow the same Add → Edit → Delete workflow described above.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Important Notes ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Image Uploads</p>
            <p className="text-xs text-amber-600 mt-0.5">
              All images are uploaded to Cloudinary and automatically optimized. Use recommended dimensions for best results.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-4 bg-red-50 rounded-2xl border border-red-100">
          <Shield className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800">Deletions are Permanent</p>
            <p className="text-xs text-red-600 mt-0.5">
              Always double-check before confirming a deletion. Deleted content and images cannot be recovered.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 sm:col-span-2 lg:col-span-1">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-emerald-800">Changes Go Live Instantly</p>
            <p className="text-xs text-emerald-600 mt-0.5">
              All saved changes reflect on the website immediately. No additional publishing step is needed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}