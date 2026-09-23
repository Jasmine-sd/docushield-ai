import React, { useState } from 'react';
import { Sun, Moon, Laptop, Shield } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import { useTranslation } from '../../contexts/I18nContext';

export const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();
  const { t } = useTranslation();

  const [notifications, setNotifications] = useState({
    scanComplete: true,
    reviewRequired: true,
  });

  const handleToggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      showToast(t.settings.title, 'Notification setting updated.', 'info');
      return updated;
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
          {t.settings.title}
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          {t.settings.subtitle}
        </p>
      </div>

      {/* Appearance Section */}
      <div className="bg-linear-to-b from-white to-slate-50/50 dark:from-[#1A1D21] dark:to-slate-900/40 rounded-2xl border border-zinc-200/80 dark:border-[#30343B] p-6 shadow-xs interactive-card">
        <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-1">
          {t.settings.themeLabel}
        </h3>
        <p className="text-xs text-zinc-500 mb-4">
          {t.settings.themeHint}
        </p>

        <div className="grid grid-cols-3 gap-3 max-w-md">
          <button
            type="button"
            onClick={() => {
              setTheme('light');
              showToast('Theme Updated', 'Switched to Light mode.', 'info');
            }}
            className={`p-3 rounded-xl border flex flex-col items-center gap-2 text-xs font-semibold transition-all cursor-pointer ${
              theme === 'light'
                ? 'border-[#B02A3A] bg-[#B02A3A]/5 dark:bg-[#B02A3A]/20 text-[#B02A3A] ring-2 ring-[#B02A3A]/20'
                : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
            }`}
          >
            <Sun className="w-5 h-5" />
            <span>{t.common.light}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTheme('dark');
              showToast('Theme Updated', 'Switched to Dark mode.', 'info');
            }}
            className={`p-3 rounded-xl border flex flex-col items-center gap-2 text-xs font-semibold transition-all cursor-pointer ${
              theme === 'dark'
                ? 'border-[#B02A3A] bg-[#B02A3A]/5 dark:bg-[#B02A3A]/20 text-[#B02A3A] ring-2 ring-[#B02A3A]/20'
                : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
            }`}
          >
            <Moon className="w-5 h-5" />
            <span>{t.common.dark}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTheme('system');
              showToast('Theme Updated', 'Following system theme.', 'info');
            }}
            className={`p-3 rounded-xl border flex flex-col items-center gap-2 text-xs font-semibold transition-all cursor-pointer ${
              theme === 'system'
                ? 'border-[#B02A3A] bg-[#B02A3A]/5 dark:bg-[#B02A3A]/20 text-[#B02A3A] ring-2 ring-[#B02A3A]/20'
                : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
            }`}
          >
            <Laptop className="w-5 h-5" />
            <span>{t.common.auto}</span>
          </button>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="bg-linear-to-b from-white to-slate-50/50 dark:from-[#1A1D21] dark:to-slate-900/40 rounded-2xl border border-zinc-200/80 dark:border-[#30343B] p-6 shadow-xs interactive-card">
        <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-1">
          {t.settings.notifications}
        </h3>
        <p className="text-xs text-zinc-500 mb-4">
          Control which analysis alerts produce system notifications
        </p>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 cursor-pointer">
            <div>
              <p className="text-xs font-semibold text-zinc-900 dark:text-white">
                {t.settings.emailOnFraud}
              </p>
              <p className="text-[11px] text-zinc-500">Notify when document checks complete</p>
            </div>
            <input
              type="checkbox"
              checked={notifications.scanComplete}
              onChange={() => handleToggleNotification('scanComplete')}
              className="accent-[#B02A3A] w-4 h-4 rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 cursor-pointer">
            <div>
              <p className="text-xs font-semibold text-zinc-900 dark:text-white">
                Review Required Alerts
              </p>
              <p className="text-[11px] text-zinc-500">Notify if high risk or discrepancy found</p>
            </div>
            <input
              type="checkbox"
              checked={notifications.reviewRequired}
              onChange={() => handleToggleNotification('reviewRequired')}
              className="accent-[#B02A3A] w-4 h-4 rounded cursor-pointer"
            />
          </label>
        </div>
      </div>

      {/* Privacy Notice Banner */}
      <div className="bg-teal-500/5 dark:bg-teal-500/10 rounded-2xl border border-teal-500/20 p-6 interactive-card">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
              Demographic Masking & Privacy Guard
            </h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
              Your documents may contain sensitive identity numbers. DOCUSENTRY applies automatic
              demographic masking (e.g. XXXX XXXX 8921) to prevent full exposure of personal credentials
              on screens and exported reports.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
