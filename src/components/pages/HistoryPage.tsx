// HistoryPage.tsx
import { useState, useMemo } from 'react';
import {
  Image, BarChart3, Layers, Handshake, Newspaper, Crown,
  Users2, Clock, FolderKanban, Rocket, MessageSquare,
  BriefcaseBusiness, Heart, GalleryHorizontal,
  History, ChevronDown, Plus, PenLine, ArrowRight,
  Calendar, Filter,
} from 'lucide-react';
import { Page } from '../../types';

interface HistoryPageProps {
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
  setCurrentPage: (page: Page) => void;
}

// ── Section Config ─────────────────────────────────────────────────
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

// ── Helpers ────────────────────────────────────────────────────────
function getLatestActivity(item: any): { date: Date | null; action: 'created' | 'edited' } {
  const created = item.createdAt ? new Date(item.createdAt) : null;
  const updated = item.updatedAt ? new Date(item.updatedAt) : null;

  if (updated && created && updated.getTime() > created.getTime()) {
    return { date: updated, action: 'edited' };
  }
  return { date: created, action: 'created' };
}

function timeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHrs = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function getItemName(item: any): string {
  return item.title || item.name || item.label || item.heading || item.question || 'Item';
}

function getDateKey(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

  const diffDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 7) return 'This Week';
  if (diffDays < 30) return 'This Month';
  if (diffDays < 90) return 'Last 3 Months';
  return 'Older';
}

// ── Date range presets ─────────────────────────────────────────────
type DatePreset = 'all' | 'today' | 'week' | 'month' | '3months';

function getDateRange(preset: DatePreset): { start: Date | null; end: Date } {
  const end = new Date();
  let start: Date | null = null;

  switch (preset) {
    case 'today':
      start = new Date(end.getFullYear(), end.getMonth(), end.getDate());
      break;
    case 'week':
      start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '3months':
      start = new Date(end.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
  }

  return { start, end };
}

// ── Entry type ─────────────────────────────────────────────────────
interface HistoryEntry {
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
}

// ── Main Component ─────────────────────────────────────────────────
export function HistoryPage({
  slides, stats, features, partners, blogPosts, achievements,
  team, timelineEvents, ongoingProjects, upcomingProjects,
  testimonials, jobListings, csrInitiatives, galleryItems,
  setCurrentPage,
}: HistoryPageProps) {
  const [actionFilter, setActionFilter] = useState<'all' | 'created' | 'edited'>('all');
  const [sectionFilter, setSectionFilter] = useState<string>('all');
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    Today: true,
    Yesterday: true,
    'This Week': true,
  });

  const allDataMap: Record<string, any[]> = {
    slides, stats, features, partners, blogPosts, achievements,
    team, timelineEvents, ongoingProjects, upcomingProjects,
    testimonials, jobListings, csrInitiatives, galleryItems,
  };

  // ── Build all entries ──
  const allEntries = useMemo(() => {
    const entries: HistoryEntry[] = [];

    sectionConfig.forEach((sec) => {
      const items = allDataMap[sec.key] || [];
      items.forEach((item) => {
        const { date, action } = getLatestActivity(item);
        if (date) {
          entries.push({
            item,
            sectionKey: sec.key,
            sectionLabel: sec.label,
            sectionIcon: sec.icon,
            sectionColor: sec.color,
            sectionLightBg: sec.lightBg,
            sectionTextColor: sec.textColor,
            sectionPage: sec.page,
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

  // ── Filter entries ──
  const filteredEntries = useMemo(() => {
    let filtered = allEntries;

    if (actionFilter !== 'all') {
      filtered = filtered.filter((e) => e.action === actionFilter);
    }
    if (sectionFilter !== 'all') {
      filtered = filtered.filter((e) => e.sectionKey === sectionFilter);
    }
    if (datePreset !== 'all') {
      const { start } = getDateRange(datePreset);
      if (start) {
        filtered = filtered.filter((e) => e.date >= start);
      }
    }

    return filtered;
  }, [allEntries, actionFilter, sectionFilter, datePreset]);

  // ── Group by date ──
  const groupedEntries = useMemo(() => {
    const groups: Record<string, HistoryEntry[]> = {};
    const groupOrder: string[] = [];

    filteredEntries.forEach((entry) => {
      const key = getDateKey(entry.date);
      if (!groups[key]) {
        groups[key] = [];
        groupOrder.push(key);
      }
      groups[key].push(entry);
    });

    return { groups, groupOrder };
  }, [filteredEntries]);

  // ── Summary stats ──
  const summaryStats = useMemo(() => {
    const created = allEntries.filter((e) => e.action === 'created').length;
    const edited  = allEntries.filter((e) => e.action === 'edited').length;
    const sections = new Set(allEntries.map((e) => e.sectionKey)).size;
    return { total: allEntries.length, created, edited, sections };
  }, [allEntries]);

  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const clearFilters = () => {
    setActionFilter('all');
    setSectionFilter('all');
    setDatePreset('all');
  };

  const hasActiveFilters =
    actionFilter !== 'all' || sectionFilter !== 'all' || datePreset !== 'all';

  return (
    <div className="space-y-6">

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

        {/* Total */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
            <History className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-slate-800">{summaryStats.total}</p>
          <p className="text-xs text-slate-500 mt-0.5">Total Entries</p>
        </div>

        {/* Created */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mb-2">
            <Plus className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-600">{summaryStats.created}</p>
          <p className="text-xs text-slate-500 mt-0.5">Created</p>
        </div>

        {/* Edited */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center mb-2">
            <PenLine className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-600">{summaryStats.edited}</p>
          <p className="text-xs text-slate-500 mt-0.5">Edited</p>
        </div>

        {/* Active Sections */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
            <Layers className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-600">{summaryStats.sections}</p>
          <p className="text-xs text-slate-500 mt-0.5">Active Sections</p>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
              <Filter className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">Filters</h2>
              <p className="text-xs text-slate-500">
                Showing {filteredEntries.length} of {allEntries.length} entries
              </p>
            </div>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-red-500 hover:text-red-600 font-medium transition"
            >
              Clear All Filters
            </button>
          )}
        </div>

        <div className="px-4 sm:px-5 pb-4 sm:pb-5 flex flex-wrap gap-3">

          {/* Action filter */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
            {(['all', 'created', 'edited'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setActionFilter(f)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  actionFilter === f
                    ? f === 'created'
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : f === 'edited'
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-white text-slate-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {f === 'all' ? 'All Actions' : f === 'created' ? 'Created' : 'Edited'}
              </button>
            ))}
          </div>

          {/* Date preset */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 flex-wrap">
            {([
              { value: 'all'     as DatePreset, label: 'All Time' },
              { value: 'today'   as DatePreset, label: 'Today'    },
              { value: 'week'    as DatePreset, label: '7 Days'   },
              { value: 'month'   as DatePreset, label: '30 Days'  },
              { value: '3months' as DatePreset, label: '90 Days'  },
            ]).map((d) => (
              <button
                key={d.value}
                onClick={() => setDatePreset(d.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  datePreset === d.value
                    ? 'bg-white text-slate-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          {/* Section filter */}
          <select
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
            className="text-xs bg-slate-100 border-none rounded-lg px-3 py-2 text-slate-600 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">All Sections</option>
            {sectionConfig.map((sec) => (
              <option key={sec.key} value={sec.key}>
                {sec.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Grouped Timeline ── */}
      {groupedEntries.groupOrder.length > 0 ? (
        <div className="space-y-4">
          {groupedEntries.groupOrder.map((groupKey) => {
            const entries = groupedEntries.groups[groupKey];
            const isExpanded = expandedGroups[groupKey] !== false;

            return (
              <div
                key={groupKey}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
              >
                {/* Group Header */}
                <button
                  onClick={() => toggleGroup(groupKey)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-sm font-bold text-slate-800">{groupKey}</h3>
                      <p className="text-xs text-slate-500">
                        {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
                        <span className="text-slate-300 mx-1.5">·</span>
                        <span className="text-emerald-600">
                          {entries.filter((e) => e.action === 'created').length} created
                        </span>
                        <span className="text-slate-300 mx-1">·</span>
                        <span className="text-amber-600">
                          {entries.filter((e) => e.action === 'edited').length} edited
                        </span>
                      </p>
                    </div>
                  </div>

                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 transition-transform ${
                      isExpanded ? '' : '-rotate-90'
                    }`}
                  />
                </button>

                {/* Entries List */}
                {isExpanded && (
                  <div className="px-4 sm:px-5 pb-4 sm:pb-5 space-y-2 border-t border-slate-100 pt-3">
                    {entries.map((entry, idx) => {
                      const SectionIcon = entry.sectionIcon;
                      const itemName = getItemName(entry.item);
                      const itemImage =
                        entry.item.img   ||
                        entry.item.image ||
                        entry.item.photo ||
                        entry.item.logo  ||
                        null;

                      return (
                        <div
                          key={`${entry.sectionKey}-${entry.item.id || idx}-${idx}`}
                          className="flex items-center gap-3 p-3 rounded-xl border border-slate-100
                                     hover:border-blue-200 hover:bg-blue-50/30 transition-all
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

                          {/* Name + badges */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-semibold text-slate-700 truncate">
                                {itemName}
                              </p>

                              {/* Created / Edited badge */}
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

                            {/* Section label only — no "by user" */}
                            <span
                              className={`inline-flex items-center gap-1 text-[10px]
                                          font-medium mt-0.5 ${entry.sectionTextColor}`}
                            >
                              <SectionIcon className="w-3 h-3" />
                              {entry.sectionLabel}
                            </span>
                          </div>

                          {/* Time — desktop */}
                          <div className="flex-shrink-0 text-right hidden sm:block">
                            <p className="text-xs font-medium text-slate-500">
                              {timeAgo(entry.date)}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {formatDate(entry.date)}
                            </p>
                          </div>

                          {/* Time — mobile */}
                          <div className="flex-shrink-0 sm:hidden">
                            <p className="text-[10px] font-medium text-slate-400">
                              {timeAgo(entry.date)}
                            </p>
                          </div>

                          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500
                                                  flex-shrink-0 opacity-0 group-hover:opacity-100
                                                  transition hidden sm:block" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty state */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
          <History className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-500 mb-1">No Activity Found</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            {hasActiveFilters
              ? 'No entries match the current filters. Try adjusting or clearing the filters.'
              : 'Activity will appear here as content is added or edited across sections.'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-4 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50
                         font-medium rounded-xl transition"
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}