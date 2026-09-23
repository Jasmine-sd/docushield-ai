import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Menu, Shield, Sun, Moon, Laptop, LogOut } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from '../../contexts/I18nContext';
import { LanguageSelector } from '../LanguageSelector';
import { BackButton } from '../common/BackButton';
import { InteractiveBackground } from '../common/InteractiveBackground';
import { PageTransition } from '../common/PageTransition';

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const handleHeaderSignOut = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-subtle-pattern text-[#1F2937] dark:text-[#F3F4F6] flex flex-col font-sans transition-colors duration-500 relative overflow-x-hidden">
      {/* Dynamic gradient background with Burgundy #B02A3A and complementary verification Teal #0F766E */}
      <InteractiveBackground />

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="lg:pl-72 flex flex-col flex-1">
        {/* Header Bar */}
        <header className="h-16 bg-white/90 dark:bg-[#1A1D21]/90 backdrop-blur-md border-b border-zinc-200/85 dark:border-[#30343B] px-3 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 transition-colors">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
              aria-label="Open sidebar navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Back button available on all internal pages in header */}
            <BackButton label={t.nav.back} />

            <div className="flex items-center gap-2 lg:hidden">
              <div className="w-7 h-7 rounded-lg bg-[#B02A3A] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                DS
              </div>
              <span className="font-bold text-sm tracking-wide text-zinc-900 dark:text-white">
                DOCUSENTRY
              </span>
            </div>

            <div className="hidden xl:flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 pl-2">
              <div className="w-2 h-2 rounded-full bg-[#0F766E] shadow-[0_0_8px_#0F766E]" />
              <Shield className="w-4 h-4 text-[#B02A3A]" />
              <span>{t.landing.badge}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Multilingual Language Selector */}
            <LanguageSelector variant="header" />

            {/* Direct Theme Switcher Button in Header */}
            <div className="hidden sm:flex items-center bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                }`}
                title={t.common.light}
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden md:inline">{t.common.light}</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                }`}
                title={t.common.dark}
              >
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden md:inline">{t.common.dark}</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('system')}
                className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  theme === 'system'
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                }`}
                title={t.common.auto}
              >
                <Laptop className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{t.common.auto}</span>
              </button>
            </div>

            <span className="hidden md:inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold border border-zinc-200 dark:border-zinc-700">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E]" />
              {user?.role === 'admin' ? t.nav.adminPortal : t.nav.userPortal}
            </span>

            {/* Global Sign Out Button in Header */}
            <button
              type="button"
              onClick={handleHeaderSignOut}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50/80 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200/80 dark:border-rose-900/60 transition-all cursor-pointer"
              title={t.nav.signOut}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.nav.signOut}</span>
            </button>
          </div>
        </header>

        {/* Dynamic Page Container with 250-350ms smooth page transitions */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </main>
      </div>
    </div>
  );
};

