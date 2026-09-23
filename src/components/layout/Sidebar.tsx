import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ScanLine,
  GitCompare,
  History,
  FileSpreadsheet,
  UserCheck,
  Settings,
  HelpCircle,
  LogOut,
  ShieldCheck,
  Inbox,
  Sparkles,
  Activity,
  FileClock,
  Sun,
  Moon,
  Laptop,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from '../../contexts/I18nContext';
import { LanguageSelector } from '../LanguageSelector';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isAdmin = user?.role === 'admin';

  const userNavItems = [
    { label: t.nav.dashboard, path: '/dashboard', icon: LayoutDashboard },
    { label: t.nav.scanner, path: '/scanner', icon: ScanLine, highlight: true },
    { label: t.nav.compare, path: '/compare', icon: GitCompare },
    { label: t.nav.history, path: '/history', icon: History },
    { label: t.nav.reports, path: '/reports', icon: FileSpreadsheet },
    { label: t.nav.profile, path: '/profile', icon: UserCheck },
    { label: t.nav.settings, path: '/settings', icon: Settings },
    { label: t.nav.help, path: '/help', icon: HelpCircle },
  ];

  const adminNavItems = [
    { label: t.nav.dashboard, path: '/admin/dashboard', icon: LayoutDashboard },
    { label: t.nav.scanner, path: '/admin/scanner', icon: ScanLine, highlight: true },
    { label: t.nav.identityVerification, path: '/admin/identity-verification', icon: ShieldCheck },
    { label: t.nav.reviewQueue, path: '/admin/review-queue', icon: Inbox },
    { label: t.nav.aiInsights, path: '/admin/ai-insights', icon: Sparkles },
    { label: t.nav.systemHealth, path: '/admin/system-health', icon: Activity },
    { label: t.nav.scanHistory, path: '/admin/scan-history', icon: History },
    { label: t.nav.reports, path: '/admin/audit-history', icon: FileClock },
    { label: t.nav.settings, path: '/admin/settings', icon: Settings },
    { label: t.nav.profile, path: '/admin/profile', icon: UserCheck },
  ];

  const currentNav = isAdmin ? adminNavItems : userNavItems;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-zinc-950/60 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white dark:bg-[#1A1D21] border-r border-zinc-200 dark:border-[#30343B] flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-18 px-6 border-b border-zinc-200 dark:border-[#30343B] flex items-center justify-between">
          <NavLink to={isAdmin ? '/admin/dashboard' : '/dashboard'} className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#B02A3A] text-white flex items-center justify-center font-black tracking-tight text-lg shadow-md shadow-[#B02A3A]/25">
              DS
            </div>
            <div>
              <span className="font-extrabold text-base tracking-wider text-zinc-900 dark:text-white flex items-center gap-1.5">
                DOCUSENTRY
                {isAdmin && (
                  <span className="text-[10px] font-bold tracking-normal px-1.5 py-0.5 rounded-sm bg-[#B02A3A]/10 text-[#B02A3A] dark:bg-[#B02A3A]/20 border border-[#B02A3A]/30">
                    ADMIN
                  </span>
                )}
              </span>
              <p className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 -mt-0.5">
                {t.landing.badge}
              </p>
            </div>
          </NavLink>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1.5">
          <div className="px-3 pb-2 flex items-center justify-between">
            <p className="text-[11px] font-semibold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase">
              {isAdmin ? t.nav.adminPortal : t.nav.workspace}
            </p>
          </div>

          {currentNav.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-[#B02A3A] text-white shadow-sm font-semibold'
                      : item.highlight
                      ? 'bg-[#0F766E]/10 dark:bg-[#0F766E]/20 text-[#0F766E] dark:text-teal-300 hover:bg-[#0F766E]/15 border border-[#0F766E]/20'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:text-zinc-900 dark:hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Theme & User Account Footer */}
        <div className="p-4 border-t border-zinc-200 dark:border-[#30343B] space-y-3 bg-zinc-50/50 dark:bg-zinc-900/30">
          {/* Mobile Language Selector inside sidebar */}
          <div className="lg:hidden flex items-center justify-between">
            <span className="text-xs text-zinc-500">{t.common.language}</span>
            <LanguageSelector variant="compact" />
          </div>

          {/* Quick Theme Switcher */}
          <div className="flex items-center justify-between bg-white dark:bg-zinc-800 p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-600 dark:text-zinc-300">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`flex-1 py-1 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                theme === 'light'
                  ? 'bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-white font-semibold shadow-xs'
                  : 'hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>{t.common.light}</span>
            </button>
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`flex-1 py-1 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-white font-semibold shadow-xs'
                  : 'hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>{t.common.dark}</span>
            </button>
            <button
              type="button"
              onClick={() => setTheme('system')}
              className={`flex-1 py-1 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                theme === 'system'
                  ? 'bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-white font-semibold shadow-xs'
                  : 'hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>{t.common.auto}</span>
            </button>
          </div>

          {/* Current User Pill & Sign Out */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-[#AD343E] text-white flex items-center justify-center font-bold text-xs shrink-0">
                {user?.avatar || 'U'}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                  {user?.name || 'Authorized User'}
                </p>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                  {user?.email || 'user@docusentry.io'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
              title={t.nav.signOut}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

