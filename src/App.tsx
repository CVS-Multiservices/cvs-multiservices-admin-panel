import { useState } from 'react';
import { useAppState } from './hooks/useAppState';
import { authApi } from './services/api';
import { LoadingOverlay } from './components/common/LoadingOverlay';
import { ToastContainer } from './components/common/Toast';
import { MainLayout } from './components/layout/MainLayout';
import { LoginPage } from './components/pages/LoginPage';
import { ForgotPasswordPage } from './components/pages/ForgotPasswordPage';
import { DashboardPage } from './components/pages/DashboardPage';
import { SlidesPage } from './components/pages/SlidesPage';
import { StatsPage } from './components/pages/StatsPage';
import { FeaturesPage } from './components/pages/FeaturesPage';
import { PartnersPage } from './components/pages/PartnersPage';
import { BlogPage } from './components/pages/BlogPage';
import { AchievementsPage } from './components/pages/AchievementsPage';
import { TeamPage } from './components/pages/TeamPage';
import { TimelinePage } from './components/pages/TimelinePage';
import { OngoingProjectsPage } from './components/pages/OngoingProjectsPage';
import { UpcomingProjectsPage } from './components/pages/UpcomingProjectsPage';
import { TestimonialsPage } from './components/pages/TestimonialsPage';
import { JobsPage } from './components/pages/JobsPage';
import { CSRPage } from './components/pages/CSRPage';
import { GalleryPage } from './components/pages/GalleryPage';
import { ContactPage } from './components/pages/ContactPage';
import { LinksPage } from './components/pages/LinksPage';
import { HistoryPage } from './components/pages/HistoryPage';

export default function App() {
  const state = useAppState();

  // ── User email state (set on login) ──────────────────────────
  const [userEmail, setUserEmail] = useState('');

  const {
    isAuthenticated, setIsAuthenticated,
    currentPage, setCurrentPage,
    sidebarOpen, setSidebarOpen,
    mobileSidebarOpen, setMobileSidebarOpen,
    toasts,
    isLoading,
    modalOpen, setModalOpen,
    modalType, editingItem, setEditingItem,
    deleteConfirm, setDeleteConfirm,
    slides, stats, features, partners, blogPosts, achievements,
    team, timelineEvents, ongoingProjects, upcomingProjects,
    testimonials, jobListings, csrInitiatives,
    galleryItems, contactItems, linksItems,
    showToast, openAddModal, openEditModal,
    handleAdd, handleEdit, handleDelete,
  } = state;

  // ── Common props passed to every page ─────────────────────────
  const commonPageProps = {
    modalOpen,
    modalType,
    editingItem,
    deleteConfirm,
    openAddModal,
    openEditModal,
    setModalOpen,
    setEditingItem,
    setDeleteConfirm,
    handleAdd,
    handleEdit,
    handleDelete,
    showToast,
  };

  // ── Logout handler ────────────────────────────────────────────
  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.warn('Logout error:', error);
    } finally {
      setIsAuthenticated(false);
      setCurrentPage('login');
      setUserEmail(''); // ← clear email on logout
      showToast('Logged out successfully', 'info');
    }
  };

  // ── Page renderer ─────────────────────────────────────────────
  const renderPageContent = () => {
    switch (currentPage) {

      case 'dashboard':
        return (
          <DashboardPage
            slides={slides}
            stats={stats}
            features={features}
            partners={partners}
            blogPosts={blogPosts}
            achievements={achievements}
            team={team}
            timelineEvents={timelineEvents}
            ongoingProjects={ongoingProjects}
            upcomingProjects={upcomingProjects}
            testimonials={testimonials}
            jobListings={jobListings}
            csrInitiatives={csrInitiatives}
            galleryItems={galleryItems}
            contactData={contactItems}
            linksData={linksItems}
            setCurrentPage={setCurrentPage}
          />
        );

      case 'slides':
        return <SlidesPage slides={slides} {...commonPageProps} />;

      case 'stats':
        return <StatsPage stats={stats} {...commonPageProps} />;

      case 'features':
        return <FeaturesPage features={features} {...commonPageProps} />;

      case 'partners':
        return <PartnersPage partners={partners} {...commonPageProps} />;

      case 'blog':
        return <BlogPage blogPosts={blogPosts} {...commonPageProps} />;

      case 'achievements':
        return <AchievementsPage achievements={achievements} {...commonPageProps} />;

      case 'team':
        return <TeamPage team={team} {...commonPageProps} />;

      case 'timeline':
        return <TimelinePage timelineEvents={timelineEvents} {...commonPageProps} />;

      case 'ongoing-projects':
        return (
          <OngoingProjectsPage
            ongoingProjects={ongoingProjects}
            {...commonPageProps}
          />
        );

      case 'upcoming-projects':
        return (
          <UpcomingProjectsPage
            upcomingProjects={upcomingProjects}
            {...commonPageProps}
          />
        );

      case 'testimonials':
        return (
          <TestimonialsPage
            testimonials={testimonials}
            {...commonPageProps}
          />
        );

      case 'jobs':
        return <JobsPage jobListings={jobListings} {...commonPageProps} />;

      case 'csr':
        return (
          <CSRPage
            csrInitiatives={csrInitiatives}
            {...commonPageProps}
          />
        );

      case 'gallery':
        return (
          <GalleryPage
            galleryItems={galleryItems}
            {...commonPageProps}
          />
        );

      case 'contact':
        return (
          <ContactPage
            contactItems={contactItems}
            {...commonPageProps}
          />
        );

      case 'links':
        return (
          <LinksPage
            linksItems={linksItems}
            {...commonPageProps}
          />
        );

      case 'history':
  return (
    <HistoryPage
      slides={slides}
      stats={stats}
      features={features}
      partners={partners}
      blogPosts={blogPosts}
      achievements={achievements}
      team={team}
      timelineEvents={timelineEvents}
      ongoingProjects={ongoingProjects}
      upcomingProjects={upcomingProjects}
      testimonials={testimonials}
      jobListings={jobListings}
      csrInitiatives={csrInitiatives}
      galleryItems={galleryItems}
      setCurrentPage={setCurrentPage}
    />
  );

      default:
        return (
          <DashboardPage
            slides={slides}
            stats={stats}
            features={features}
            partners={partners}
            blogPosts={blogPosts}
            achievements={achievements}
            team={team}
            timelineEvents={timelineEvents}
            ongoingProjects={ongoingProjects}
            upcomingProjects={upcomingProjects}
            testimonials={testimonials}
            jobListings={jobListings}
            csrInitiatives={csrInitiatives}
            galleryItems={galleryItems}
            contactData={contactItems}
            linksData={linksItems}
            setCurrentPage={setCurrentPage}
          />
        );
    }
  };

  // ── Not authenticated ─────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <>
        <LoadingOverlay isLoading={isLoading} />
        {currentPage === 'forgot-password' ? (
          <ForgotPasswordPage
            setCurrentPage={setCurrentPage}
            showToast={showToast}
          />
        ) : (
          <LoginPage
            setIsAuthenticated={setIsAuthenticated}
            setCurrentPage={setCurrentPage}
            setUserEmail={setUserEmail}
            showToast={showToast}
          />
        )}
        <ToastContainer toasts={toasts} dark />
      </>
    );
  }

  // ── Authenticated ─────────────────────────────────────────────
  return (
    <>
      <LoadingOverlay isLoading={isLoading} />
      <MainLayout
        currentPage={currentPage}
        sidebarOpen={sidebarOpen}
        mobileSidebarOpen={mobileSidebarOpen}
        toasts={toasts}
        userEmail={userEmail}
        setSidebarOpen={setSidebarOpen}
        setMobileSidebarOpen={setMobileSidebarOpen}
        setCurrentPage={setCurrentPage}
        onLogout={handleLogout}
      >
        {renderPageContent()}
      </MainLayout>
    </>
  );
}