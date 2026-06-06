import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ToastContainer } from '../common/Toast';
import { Page, Toast } from '../../types';

interface MainLayoutProps {
  currentPage: Page;
  sidebarOpen: boolean;
  mobileSidebarOpen: boolean;
  toasts: Toast[];
  userEmail: string;
  setSidebarOpen: (v: boolean) => void;
  setMobileSidebarOpen: (v: boolean) => void;
  setCurrentPage: (page: Page) => void;
  onLogout: () => void | Promise<void>;
  children: React.ReactNode;
}

export function MainLayout({
  currentPage, sidebarOpen, mobileSidebarOpen, toasts, userEmail,
  setSidebarOpen, setMobileSidebarOpen, setCurrentPage,
  onLogout, children,
}: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        currentPage={currentPage}
        sidebarOpen={sidebarOpen}
        mobileSidebarOpen={mobileSidebarOpen}
        setCurrentPage={setCurrentPage}
        setMobileSidebarOpen={setMobileSidebarOpen}
        onLogout={onLogout}
      />
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        <Header
          currentPage={currentPage}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          setMobileSidebarOpen={setMobileSidebarOpen}
          userEmail={userEmail}
        />
        <main className="p-4 md:p-6">{children}</main>
      </div>
      <ToastContainer toasts={toasts} />
    </div>
  );
}