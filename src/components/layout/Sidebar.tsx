import React, { useState } from 'react';
import {
  Home, Image, BarChart3, Layers, Handshake, Newspaper, Crown,
  Users2, Clock, FolderKanban, Rocket, MessageSquare, BriefcaseBusiness,
  LogOut, HeartHandshake, ChevronDown, ChevronRight,
  LayoutDashboard, Info, Briefcase, ImageIcon, Mail,
  GalleryHorizontal, Phone, Globe,
} from 'lucide-react';
import { Page } from '../../types';
import logo from '../../images/Logo.png';

// ==================== TYPES ====================
interface SidebarItem {
  id: Page;
  label: string;
  icon: React.FC<any>;
}

interface SidebarSection {
  id: string;
  label: string;
  icon: React.FC<any>;
  items: SidebarItem[];
  collapsible: boolean;
}

// ==================== SECTIONS CONFIG ====================
export const sidebarSections: SidebarSection[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    collapsible: false,
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    id: 'home-section',
    label: 'Home',
    icon: Home,
    collapsible: true,
    items: [
      { id: 'slides',            label: 'Hero Slides',       icon: Image },
      { id: 'stats',             label: 'Stats Bar',         icon: BarChart3 },
      { id: 'achievements',      label: 'Achievements',      icon: Crown },
      { id: 'ongoing-projects',  label: 'Ongoing Projects',  icon: FolderKanban },
      { id: 'upcoming-projects', label: 'Upcoming Projects', icon: Rocket },
      { id: 'blog',              label: 'Blog Posts',        icon: Newspaper },
      { id: 'testimonials',      label: 'Testimonials',      icon: MessageSquare },
      { id: 'csr',               label: 'CSR Initiatives',   icon: HeartHandshake },
      { id: 'partners',          label: 'Partners',          icon: Handshake },
    ],
  },
  {
    id: 'about-section',
    label: 'About',
    icon: Info,
    collapsible: true,
    items: [
      { id: 'timeline', label: 'Timeline',     icon: Clock },
      { id: 'team',     label: 'Team Members', icon: Users2 },
    ],
  },
  {
    id: 'services-section',
    label: 'Services',
    icon: Layers,
    collapsible: true,
    items: [
      { id: 'features', label: 'Services', icon: Layers },
    ],
  },
  {
    id: 'careers-section',
    label: 'Careers',
    icon: Briefcase,
    collapsible: true,
    items: [
      { id: 'jobs', label: 'Job Listings', icon: BriefcaseBusiness },
    ],
  },
  {
    id: 'gallery-section',
    label: 'Gallery',
    icon: ImageIcon,
    collapsible: true,
    items: [
      { id: 'gallery', label: 'Gallery', icon: GalleryHorizontal },
    ],
  },
  {
    id: 'contact-section',
    label: 'Contact Us',
    icon: Mail,
    collapsible: true,
    items: [
      { id: 'contact', label: 'Contact Info', icon: Phone },
      { id: 'links',   label: 'Social Links', icon: Globe },
    ],
  },
  {
  id: 'history-section',
  label: 'History',
  icon: Clock,      // or import History from lucide-react
  collapsible: false,
  items: [
    { id: 'history', label: 'Activity History', icon: Clock },
  ],
},
  
];

// ── Flat list for Quick Actions in Dashboard ──────────────────
export const sidebarItems: SidebarItem[] = sidebarSections
  .flatMap((section) => section.items)
  .filter((item, index, self) =>
    index === self.findIndex((i) => i.id === item.id)
  );

// ==================== SIDEBAR COMPONENT ====================
interface SidebarProps {
  currentPage: Page;
  sidebarOpen: boolean;
  mobileSidebarOpen: boolean;
  setCurrentPage: (page: Page) => void;
  setMobileSidebarOpen: (v: boolean) => void;
  onLogout: () => void | Promise<void>;
}

export function Sidebar({
  currentPage, sidebarOpen, mobileSidebarOpen,
  setCurrentPage, setMobileSidebarOpen, onLogout,
}: SidebarProps) {

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const getInitialExpanded = (): Record<string, boolean> => {
    const expanded: Record<string, boolean> = {};
    sidebarSections.forEach((section) => {
      if (!section.collapsible) return;
      const hasActivePage = section.items.some((item) => item.id === currentPage);
      expanded[section.id] = hasActivePage;
    });
    return expanded;
  };

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(
    getInitialExpanded
  );

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const isSectionActive = (section: SidebarSection) => {
    return section.items.some((item) => item.id === currentPage);
  };

  const handlePageClick = (pageId: Page, sectionId: string) => {
    setCurrentPage(pageId);
    setMobileSidebarOpen(false);
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: true,
    }));
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    try {
      setIsLoggingOut(true);
      await onLogout();
    } catch (error) {
      console.warn('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      {/* ── Sidebar CSS Animations ── */}
      <style>{`
        @keyframes sidebar-logo-shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes sidebar-logo-glow {
          0%, 100% { box-shadow: 0 2px 12px rgba(59, 130, 246, 0.08); }
          50%      { box-shadow: 0 4px 20px rgba(59, 130, 246, 0.18); }
        }
        @keyframes sidebar-border-pulse {
          0%, 100% { border-color: rgba(59, 130, 246, 0.15); }
          50%      { border-color: rgba(59, 130, 246, 0.35); }
        }
        @keyframes sidebar-text-fade {
          0%   { opacity: 0; transform: translateY(4px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes sidebar-icon-pulse {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.08); }
        }
        .sidebar-logo-container {
          animation: sidebar-logo-glow 3s ease-in-out infinite,
                     sidebar-border-pulse 3s ease-in-out infinite;
        }
        .sidebar-logo-container:hover .sidebar-shimmer {
          opacity: 1;
        }
        .sidebar-shimmer {
          opacity: 0;
          transition: opacity 0.3s;
        }
        .sidebar-icon-breathe {
          animation: sidebar-icon-pulse 3s ease-in-out infinite;
        }
      `}</style>

      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full bg-slate-900 border-r border-slate-800 z-50 transition-all duration-300 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 ${sidebarOpen ? 'w-64' : 'w-20'}`}
      >
        {/* ── Logo Header ── */}
        <div className="p-3 border-b border-slate-800">
          {sidebarOpen ? (
            /* ── Expanded: Full logo + subtitle ── */
            <div className="flex flex-col items-center gap-2">
              {/* Logo card */}
              <div className="relative group w-full">
                <div
                  className="relative overflow-hidden rounded-xl sidebar-logo-container"
                  style={{
                    background: '#ffffff',
                    border: '1.5px solid rgba(59, 130, 246, 0.15)',
                    padding: '8px 14px',
                  }}
                >
                  <img
                    src={logo}
                    alt="CVS Multi Services Pvt. Ltd."
                    style={{
                      width: '100%',
                      height: 'auto',
                      maxHeight: '48px',
                      objectFit: 'contain',
                      display: 'block',
                    }}
                  />

                  {/* Shimmer on hover */}
                  <div
                    className="absolute inset-0 sidebar-shimmer pointer-events-none"
                    style={{
                      background:
                        'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
                      animation: 'sidebar-logo-shimmer 2s ease-in-out infinite',
                    }}
                  />
                </div>
              </div>

              {/* Subtitle */}
              <p
                className="text-[10px] font-semibold tracking-[0.2em] uppercase text-slate-500"
                style={{ animation: 'sidebar-text-fade 0.5s ease-out' }}
              >
                Admin Panel
              </p>
            </div>
          ) : (
            /* ── Collapsed: Small logo icon ── */
            <div className="flex flex-col items-center gap-1.5">
              <div
                className="relative overflow-hidden rounded-lg sidebar-logo-container sidebar-icon-breathe"
                style={{
                  background: '#ffffff',
                  border: '1.5px solid rgba(59, 130, 246, 0.15)',
                  padding: '6px',
                  width: '44px',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src={logo}
                  alt="CVS"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                />
              </div>
              <div
                className="w-6 h-[2px] rounded-full"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.3), transparent)',
                }}
              />
            </div>
          )}
        </div>

        {/* ── Navigation ── */}
        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100%-8rem)] scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {sidebarSections.map((section) => {
            const SectionIcon = section.icon;
            const isActive = isSectionActive(section);
            const isExpanded = expandedSections[section.id] || false;
            const hasItems = section.items.length > 0;
            const isEmpty = section.items.length === 0;

            if (!section.collapsible && section.items.length === 1) {
              const item = section.items[0];
              const ItemIcon = item.icon;
              const itemActive = currentPage === item.id;

              return (
                <button
                  key={section.id}
                  onClick={() => handlePageClick(item.id, section.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    itemActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <ItemIcon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span className="truncate">{item.label}</span>}
                </button>
              );
            }

            return (
              <div key={section.id} className="space-y-0.5">
                <button
                  onClick={() => {
                    if (!sidebarOpen) return;
                    if (isEmpty) return;
                    toggleSection(section.id);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'text-blue-400 bg-blue-500/10'
                      : isEmpty
                      ? 'text-slate-600 cursor-default'
                      : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                  }`}
                >
                  <SectionIcon className={`w-5 h-5 flex-shrink-0 ${
                    isActive ? 'text-blue-400' : isEmpty ? 'text-slate-700' : 'text-slate-600'
                  }`} />

                  {sidebarOpen && (
                    <>
                      <span className="flex-1 text-left truncate text-xs uppercase tracking-wider">
                        {section.label}
                      </span>

                      {isEmpty ? (
                        <span className="text-[9px] px-1.5 py-0.5 bg-slate-800 text-slate-600 rounded-md font-normal normal-case tracking-normal">
                          Soon
                        </span>
                      ) : hasItems ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 text-slate-500 rounded-md font-normal">
                            {section.items.length}
                          </span>
                          {isExpanded ? (
                            <ChevronDown className="w-3.5 h-3.5 text-slate-600" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                          )}
                        </div>
                      ) : null}
                    </>
                  )}
                </button>

                {sidebarOpen && isExpanded && hasItems && (
                  <div className="ml-3 pl-3 border-l border-slate-800 space-y-0.5">
                    {section.items.map((item) => {
                      const ItemIcon = item.icon;
                      const itemActive = currentPage === item.id;

                      return (
                        <button
                          key={item.id}
                          onClick={() => handlePageClick(item.id, section.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                            itemActive
                              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800'
                          }`}
                        >
                          <ItemIcon className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {!sidebarOpen && hasItems && (
                  <div className="space-y-0.5">
                    {section.items.map((item) => {
                      const ItemIcon = item.icon;
                      const itemActive = currentPage === item.id;

                      return (
                        <button
                          key={item.id}
                          onClick={() => handlePageClick(item.id, section.id)}
                          title={item.label}
                          className={`w-full flex items-center justify-center py-2 rounded-xl transition-all ${
                            itemActive
                              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                              : 'text-slate-500 hover:text-white hover:bg-slate-800'
                          }`}
                        >
                          <ItemIcon className="w-4 h-4" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* ── Logout ── */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-slate-800">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isLoggingOut
                ? 'text-red-600 cursor-not-allowed opacity-60'
                : 'text-red-400 hover:text-red-300 hover:bg-red-500/10'
            }`}
          >
            <LogOut className={`w-5 h-5 flex-shrink-0 ${isLoggingOut ? 'animate-pulse' : ''}`} />
            {sidebarOpen && (
              <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}