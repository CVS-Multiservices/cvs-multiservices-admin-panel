import { Menu } from 'lucide-react';
import { Page } from '../../types';

interface HeaderProps {
  currentPage: Page;
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  setMobileSidebarOpen: (v: boolean) => void;
  userEmail: string;
}

export function Header({
  currentPage, sidebarOpen,
  setSidebarOpen, setMobileSidebarOpen,
  userEmail,
}: HeaderProps) {
  // Get first letter of email for avatar
  const firstLetter = userEmail ? userEmail.charAt(0).toUpperCase() : 'A';

  // Get display name (part before @)
  const displayName = userEmail ? userEmail.split('@')[0] : 'Admin';

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="flex items-center justify-between px-4 py-3">
        {/* ── Left: Menu + Page Title ── */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 hover:bg-slate-100 rounded-lg lg:hidden"
          >
            <Menu className="w-5 h-5 text-slate-600" />
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-100 rounded-lg hidden lg:block"
          >
            <Menu className="w-5 h-5 text-slate-600" />
          </button>
          <div className="hidden sm:block">
            <h2 className="text-lg font-semibold text-slate-800 capitalize">
              {currentPage === 'dashboard'
                ? 'Dashboard Overview'
                : currentPage.replace(/-/g, ' ')}
            </h2>
            <p className="text-xs text-slate-500">
              Manage your CVS Multi Services data
            </p>
          </div>
        </div>

        {/* ── Right: User Info ── */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-slate-700 capitalize">
              {displayName}
            </p>
            <p className="text-xs text-slate-500">{userEmail}</p>
          </div>
          <div
            className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0"
            title={userEmail}
          >
            <span className="text-white font-semibold text-sm">
              {firstLetter}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}