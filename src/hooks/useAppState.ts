import { useState, useEffect } from 'react';
import { authApi, createApiService } from '../services/api';
import { Page, Toast } from '../types';

export function useAppState() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit'>('add');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean; id: any; collection: string;
  }>({ open: false, id: null, collection: '' });

  // ── API Services ──────────────────────────────────────────────
  const slidesApi = createApiService('slides');
  const statsApi = createApiService('stats');
  const featuresApi = createApiService('features');
  const partnersApi = createApiService('partners');
  const blogApi = createApiService('blog');
  const achievementsApi = createApiService('achievements');
  const teamApi = createApiService('team');
  const timelineApi = createApiService('timeline');
  const ongoingProjectsApi = createApiService('ongoing-projects');
  const upcomingProjectsApi = createApiService('upcoming-projects');
  const testimonialsApi = createApiService('testimonials');
  const jobsApi = createApiService('jobs');
  const csrApi = createApiService('csr');
  const galleryApi = createApiService('gallery');
  const contactApi = createApiService('contact');
  const linksApi = createApiService('links');

  // ── Data States ───────────────────────────────────────────────
  const [slides, setSlides] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [features, setFeatures] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<any[]>([]);
  const [ongoingProjects, setOngoingProjects] = useState<any[]>([]);
  const [upcomingProjects, setUpcomingProjects] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [jobListings, setJobListings] = useState<any[]>([]);
  const [csrInitiatives, setCsrInitiatives] = useState<any[]>([]);
  const [galleryItems, setGalleryItems] = useState<any[]>([]);
  const [contactItems, setContactItems] = useState<any[]>([]);
  const [linksItems, setLinksItems] = useState<any[]>([]);

  // ── Auth check on mount ───────────────────────────────────────
  useEffect(() => {
    const session = authApi.getSession();
    if (session.token && session.user) {
      setIsAuthenticated(true);
      setCurrentPage('dashboard');
    }
  }, []);

  // ── Load data when authenticated ──────────────────────────────
  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
    }
  }, [isAuthenticated]);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const results = await Promise.all([
        slidesApi.getAll(),            // 0
        statsApi.getAll(),             // 1
        featuresApi.getAll(),          // 2
        partnersApi.getAll(),          // 3
        blogApi.getAll(),              // 4
        achievementsApi.getAll(),      // 5
        teamApi.getAll(),              // 6
        timelineApi.getAll(),          // 7
        ongoingProjectsApi.getAll(),   // 8
        upcomingProjectsApi.getAll(),  // 9
        testimonialsApi.getAll(),      // 10
        jobsApi.getAll(),              // 11
        csrApi.getAll(),               // 12
        galleryApi.getAll(),           // 13
        contactApi.getAll(),           // 14
        linksApi.getAll(),             // 15
      ]);

      if (results[0].success) setSlides(results[0].data);
      if (results[1].success) setStats(results[1].data);
      if (results[2].success) setFeatures(results[2].data);
      if (results[3].success) setPartners(results[3].data);
      if (results[4].success) setBlogPosts(results[4].data);
      if (results[5].success) setAchievements(results[5].data);
      if (results[6].success) setTeam(results[6].data);
      if (results[7].success) setTimelineEvents(results[7].data);
      if (results[8].success) setOngoingProjects(results[8].data);
      if (results[9].success) setUpcomingProjects(results[9].data);
      if (results[10].success) setTestimonials(results[10].data);
      if (results[11].success) setJobListings(results[11].data);
      if (results[12].success) setCsrInitiatives(results[12].data);
      if (results[13].success) setGalleryItems(results[13].data);
      if (results[14].success) setContactItems(results[14].data);
      if (results[15].success) setLinksItems(results[15].data);

    } catch (error) {
      console.error('Error loading data:', error);
      showToast('Failed to load some data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const openAddModal = () => {
    setModalType('add');
    setEditingItem(null);
    setModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setModalType('edit');
    setEditingItem(item);
    setModalOpen(true);
  };

  // ── handleAdd ─────────────────────────────────────────────────
  const handleAdd = async (collection: string, item: any) => {
    setIsLoading(true);
    try {
      const itemWithoutId = { ...item };
      delete itemWithoutId.id;

      switch (collection) {
        case 'slides': {
          const result = await slidesApi.create(itemWithoutId);
          if (result.success && result.data)
            setSlides((prev) => [result.data!, ...prev]);
          break;
        }
        case 'stats': {
          const result = await statsApi.create(itemWithoutId);
          if (result.success && result.data)
            setStats((prev) => [result.data!, ...prev]);
          break;
        }
        case 'features': {
          const result = await featuresApi.create(itemWithoutId);
          if (result.success && result.data)
            setFeatures((prev) => [result.data!, ...prev]);
          break;
        }
        case 'partners': {
          const result = await partnersApi.create(itemWithoutId);
          if (result.success && result.data)
            setPartners((prev) => [result.data!, ...prev]);
          break;
        }
        case 'blog': {
          const result = await blogApi.create(itemWithoutId);
          if (result.success && result.data)
            setBlogPosts((prev) => [result.data!, ...prev]);
          break;
        }
        case 'achievements': {
          const result = await achievementsApi.create(itemWithoutId);
          if (result.success && result.data)
            setAchievements((prev) => [result.data!, ...prev]);
          break;
        }
        case 'team': {
          const result = await teamApi.create(itemWithoutId);
          if (result.success && result.data)
            setTeam((prev) => [result.data!, ...prev]);
          break;
        }
        case 'timeline': {
          const result = await timelineApi.create(itemWithoutId);
          if (result.success && result.data)
            setTimelineEvents((prev) => [result.data!, ...prev]);
          break;
        }
        case 'ongoing-projects': {
          const result = await ongoingProjectsApi.create(itemWithoutId);
          if (result.success && result.data)
            setOngoingProjects((prev) => [result.data!, ...prev]);
          break;
        }
        case 'upcoming-projects': {
          const result = await upcomingProjectsApi.create(itemWithoutId);
          if (result.success && result.data)
            setUpcomingProjects((prev) => [result.data!, ...prev]);
          break;
        }
        case 'testimonials': {
          const result = await testimonialsApi.create(itemWithoutId);
          if (result.success && result.data)
            setTestimonials((prev) => [result.data!, ...prev]);
          break;
        }
        case 'jobs': {
          const result = await jobsApi.create(itemWithoutId);
          if (result.success && result.data)
            setJobListings((prev) => [result.data!, ...prev]);
          break;
        }
        case 'csr': {
          const result = await csrApi.create(itemWithoutId);
          if (result.success && result.data)
            setCsrInitiatives((prev) => [result.data!, ...prev]);
          break;
        }
        case 'gallery': {
          const result = await galleryApi.create(itemWithoutId);
          if (result.success && result.data)
            setGalleryItems((prev) => [result.data!, ...prev]);
          break;
        }
        case 'contact': {
          const result = await contactApi.create(itemWithoutId);
          if (result.success && result.data)
            setContactItems((prev) => [result.data!, ...prev]);
          break;
        }
        case 'links': {
          const result = await linksApi.create(itemWithoutId);
          if (result.success && result.data)
            setLinksItems((prev) => [result.data!, ...prev]);
          break;
        }
      }

      showToast('Item added successfully!', 'success');
      setModalOpen(false);
    } catch (error) {
      showToast('Failed to add item. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // ── handleEdit ────────────────────────────────────────────────
  const handleEdit = async (collection: string, id: any, updatedItem: any) => {
    setIsLoading(true);
    try {
      switch (collection) {
        case 'slides': {
          const result = await slidesApi.update(id, updatedItem);
          if (result.success && result.data)
            setSlides((prev) => prev.map((s) => (s.id === id ? result.data! : s)));
          break;
        }
        case 'stats': {
          const result = await statsApi.update(id, updatedItem);
          if (result.success && result.data)
            setStats((prev) => prev.map((s) => (s.id === id ? result.data! : s)));
          break;
        }
        case 'features': {
          const result = await featuresApi.update(id, updatedItem);
          if (result.success && result.data)
            setFeatures((prev) => prev.map((f) => (f.id === id ? result.data! : f)));
          break;
        }
        case 'partners': {
          const result = await partnersApi.update(id, updatedItem);
          if (result.success && result.data)
            setPartners((prev) => prev.map((p) => (p.id === id ? result.data! : p)));
          break;
        }
        case 'blog': {
          const result = await blogApi.update(id, updatedItem);
          if (result.success && result.data)
            setBlogPosts((prev) => prev.map((p) => (p.id === id ? result.data! : p)));
          break;
        }
        case 'achievements': {
          const result = await achievementsApi.update(id, updatedItem);
          if (result.success && result.data)
            setAchievements((prev) => prev.map((a) => (a.id === id ? result.data! : a)));
          break;
        }
        case 'team': {
          const result = await teamApi.update(id, updatedItem);
          if (result.success && result.data)
            setTeam((prev) => prev.map((t) => (t.id === id ? result.data! : t)));
          break;
        }
        case 'timeline': {
          const result = await timelineApi.update(id, updatedItem);
          if (result.success && result.data)
            setTimelineEvents((prev) => prev.map((t) => (t.id === id ? result.data! : t)));
          break;
        }
        case 'ongoing-projects': {
          const result = await ongoingProjectsApi.update(id, updatedItem);
          if (result.success && result.data)
            setOngoingProjects((prev) => prev.map((p) => (p.id === id ? result.data! : p)));
          break;
        }
        case 'upcoming-projects': {
          const result = await upcomingProjectsApi.update(id, updatedItem);
          if (result.success && result.data)
            setUpcomingProjects((prev) => prev.map((p) => (p.id === id ? result.data! : p)));
          break;
        }
        case 'testimonials': {
          const result = await testimonialsApi.update(id, updatedItem);
          if (result.success && result.data)
            setTestimonials((prev) => prev.map((t) => (t.id === id ? result.data! : t)));
          break;
        }
        case 'jobs': {
          const result = await jobsApi.update(id, updatedItem);
          if (result.success && result.data)
            setJobListings((prev) => prev.map((j) => (j.id === id ? result.data! : j)));
          break;
        }
        case 'csr': {
          const result = await csrApi.update(id, updatedItem);
          if (result.success && result.data)
            setCsrInitiatives((prev) => prev.map((c) => (c.id === id ? result.data! : c)));
          break;
        }
        case 'gallery': {
          const result = await galleryApi.update(id, updatedItem);
          if (result.success && result.data)
            setGalleryItems((prev) => prev.map((g) => (g.id === id ? result.data! : g)));
          break;
        }
        case 'contact': {
          const result = await contactApi.update(id, updatedItem);
          if (result.success && result.data)
            setContactItems((prev) => prev.map((c) => (c.id === id ? result.data! : c)));
          break;
        }
        case 'links': {
          const result = await linksApi.update(id, updatedItem);
          if (result.success && result.data)
            setLinksItems((prev) => prev.map((l) => (l.id === id ? result.data! : l)));
          break;
        }
      }

      showToast('Item updated successfully!', 'success');
      setModalOpen(false);
      setEditingItem(null);
    } catch (error) {
      showToast('Failed to update item. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // ── handleDelete ──────────────────────────────────────────────
  const handleDelete = async (collection: string, id: any) => {
    setIsLoading(true);
    try {
      let success = false;

      switch (collection) {
        case 'slides': {
          const r = await slidesApi.delete(id);
          if (r.success) { setSlides((p) => p.filter((s) => s.id !== id)); success = true; }
          break;
        }
        case 'stats': {
          const r = await statsApi.delete(id);
          if (r.success) { setStats((p) => p.filter((s) => s.id !== id)); success = true; }
          break;
        }
        case 'features': {
          const r = await featuresApi.delete(id);
          if (r.success) { setFeatures((p) => p.filter((f) => f.id !== id)); success = true; }
          break;
        }
        case 'partners': {
          const r = await partnersApi.delete(id);
          if (r.success) { setPartners((p) => p.filter((p2) => p2.id !== id)); success = true; }
          break;
        }
        case 'blog': {
          const r = await blogApi.delete(id);
          if (r.success) { setBlogPosts((p) => p.filter((b) => b.id !== id)); success = true; }
          break;
        }
        case 'achievements': {
          const r = await achievementsApi.delete(id);
          if (r.success) { setAchievements((p) => p.filter((a) => a.id !== id)); success = true; }
          break;
        }
        case 'team': {
          const r = await teamApi.delete(id);
          if (r.success) { setTeam((p) => p.filter((t) => t.id !== id)); success = true; }
          break;
        }
        case 'timeline': {
          const r = await timelineApi.delete(id);
          if (r.success) { setTimelineEvents((p) => p.filter((t) => t.id !== id)); success = true; }
          break;
        }
        case 'ongoing-projects': {
          const r = await ongoingProjectsApi.delete(id);
          if (r.success) { setOngoingProjects((p) => p.filter((p2) => p2.id !== id)); success = true; }
          break;
        }
        case 'upcoming-projects': {
          const r = await upcomingProjectsApi.delete(id);
          if (r.success) { setUpcomingProjects((p) => p.filter((p2) => p2.id !== id)); success = true; }
          break;
        }
        case 'testimonials': {
          const r = await testimonialsApi.delete(id);
          if (r.success) { setTestimonials((p) => p.filter((t) => t.id !== id)); success = true; }
          break;
        }
        case 'jobs': {
          const r = await jobsApi.delete(id);
          if (r.success) { setJobListings((p) => p.filter((j) => j.id !== id)); success = true; }
          break;
        }
        case 'csr': {
          const r = await csrApi.delete(id);
          if (r.success) { setCsrInitiatives((p) => p.filter((c) => c.id !== id)); success = true; }
          break;
        }
        case 'gallery': {
          const r = await galleryApi.delete(id);
          if (r.success) { setGalleryItems((p) => p.filter((g) => g.id !== id)); success = true; }
          break;
        }
        case 'contact': {
          const r = await contactApi.delete(id);
          if (r.success) { setContactItems((p) => p.filter((c) => c.id !== id)); success = true; }
          break;
        }
        case 'links': {
          const r = await linksApi.delete(id);
          if (r.success) {setLinksItems((p) => p.filter((l) => l.id !== id)); success = true; }
          break;
        }
      }

      if (success) showToast('Item deleted successfully!', 'success');
      else showToast('Failed to delete item', 'error');
      setDeleteConfirm({ open: false, id: null, collection: '' });

    } catch (error) {
      showToast('Failed to delete item. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Return ────────────────────────────────────────────────────
  return {
    isAuthenticated, setIsAuthenticated,
    currentPage, setCurrentPage,
    sidebarOpen, setSidebarOpen,
    mobileSidebarOpen, setMobileSidebarOpen,
    toasts, setToasts,
    searchQuery, setSearchQuery,
    isLoading, setIsLoading,
    modalOpen, setModalOpen,
    modalType, setModalType,
    editingItem, setEditingItem,
    deleteConfirm, setDeleteConfirm,
    slides, stats, features, partners, blogPosts, achievements,
    team, timelineEvents, ongoingProjects, upcomingProjects,
    testimonials, jobListings, csrInitiatives, galleryItems,
    contactItems, linksItems, showToast, openAddModal, openEditModal,
    handleAdd, handleEdit, handleDelete,
  };
}