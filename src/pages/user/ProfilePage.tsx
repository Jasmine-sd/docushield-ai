import React, { useState } from 'react';
import {
  User as UserIcon,
  Mail,
  Fingerprint,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Clock,
  Globe,
  Sun,
  Moon,
  Laptop,
  Save,
  Edit3,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useTranslation } from '../../contexts/I18nContext';
import { useTheme } from '../../contexts/ThemeContext';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const { currentLanguage, setLanguage, supportedLanguages } = useTranslation();
  const { theme, setTheme } = useTheme();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isEditing, setIsEditing] = useState(false);

  // Derived user details or clean defaults
  const fullName = user?.name || 'Ananya Sharma';
  const emailAddress = user?.email || 'ananya@example.com';
  const userId =
    user?.id?.toUpperCase().replace('USR_DEMO_01', 'USR-2026-00124') || 'USR-2026-00124';
  const roleLabel = user?.role === 'admin' ? 'Administrator' : 'User';
  const accountStatus = 'Active';
  const dateJoined = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '12 Mar 2026';
  const lastActive = 'Today';
  const preferredLanguage = currentLanguage.name || 'English';
  const themeDisplay =
    theme === 'light' ? 'Light' : theme === 'dark' ? 'Dark' : 'Auto (System)';

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      showToast('Validation Error', 'Name and email cannot be empty.', 'warning');
      return;
    }

    updateProfile({ name, email });
    setIsEditing(false);
    showToast(t.common.save, 'Your profile details have been saved.', 'success');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#0F766E]/10 text-[#0F766E] dark:text-teal-300 border border-[#0F766E]/20 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#0F766E]" />
              Account Profile
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172033] dark:text-white">
            {t.profile.title}
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] dark:text-zinc-400 mt-1">
            Manage your DOCUSENTRY user identity, security status, and account preferences.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#B4233C] hover:bg-[#852336] text-white shadow-xs cursor-pointer transition-all self-start sm:self-auto"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>{isEditing ? 'Cancel Editing' : 'Edit Information'}</span>
        </button>
      </div>

      {/* User Hero Banner Card */}
      <div className="bg-[#F8F4F2] dark:bg-[#1A1D21] rounded-3xl border border-[#D8B9AE] dark:border-[#30343B] p-6 sm:p-8 shadow-2xs interactive-card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-[#B4233C] to-[#852336] text-white font-black text-3xl flex items-center justify-center shadow-md shadow-[#B4233C]/20 shrink-0">
              {user?.avatar || 'AS'}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#172033] dark:text-white">
                  {fullName}
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#0F766E]/15 text-[#0F766E] dark:text-teal-300 border border-[#0F766E]/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E] animate-pulse"></span>
                  {accountStatus}
                </span>
              </div>
              <p className="text-xs text-[#64748B] dark:text-zinc-400 mt-0.5 font-mono">
                {emailAddress}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-[#0F766E]/10 text-[#0F766E] dark:text-teal-300 border border-[#0F766E]/20 uppercase">
                  {roleLabel} Account
                </span>
                <span className="text-[11px] font-mono text-[#64748B] dark:text-zinc-400">
                  ID: {userId}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Basic Information / About You Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-[#172033] dark:text-white flex items-center gap-2">
            <span>Basic Information</span>
            <span className="text-xs font-normal text-[#64748B] dark:text-zinc-400">
              (About You)
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 1. Full Name */}
          <div className="bg-[#F8F4F2] hover:bg-[#FFF9F6] dark:bg-[#1A1D21] dark:hover:bg-[#22262C] rounded-2xl border border-[#D8B9AE] dark:border-[#30343B] p-4 sm:p-5 shadow-2xs hover:shadow-md transition-all duration-200 interactive-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/40 flex items-center justify-center shrink-0">
                <UserIcon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-zinc-400">
                  Full Name
                </p>
                <p className="text-sm font-bold text-[#172033] dark:text-white truncate mt-0.5">
                  {fullName}
                </p>
              </div>
            </div>
          </div>

          {/* 2. Email Address */}
          <div className="bg-[#F8F4F2] hover:bg-[#FFF9F6] dark:bg-[#1A1D21] dark:hover:bg-[#22262C] rounded-2xl border border-[#D8B9AE] dark:border-[#30343B] p-4 sm:p-5 shadow-2xs hover:shadow-md transition-all duration-200 interactive-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/40 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-zinc-400">
                  Email Address
                </p>
                <p className="text-sm font-bold text-[#172033] dark:text-white truncate mt-0.5">
                  {emailAddress}
                </p>
              </div>
            </div>
          </div>

          {/* 3. User ID */}
          <div className="bg-[#F8F4F2] hover:bg-[#FFF9F6] dark:bg-[#1A1D21] dark:hover:bg-[#22262C] rounded-2xl border border-[#D8B9AE] dark:border-[#30343B] p-4 sm:p-5 shadow-2xs hover:shadow-md transition-all duration-200 interactive-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border border-purple-200/60 dark:border-purple-800/40 flex items-center justify-center shrink-0">
                <Fingerprint className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-zinc-400">
                  Username / User ID
                </p>
                <p className="text-sm font-bold font-mono text-[#172033] dark:text-white truncate mt-0.5">
                  {userId}
                </p>
              </div>
            </div>
          </div>

          {/* 4. Account Role */}
          <div className="bg-[#F8F4F2] hover:bg-[#FFF9F6] dark:bg-[#1A1D21] dark:hover:bg-[#22262C] rounded-2xl border border-[#D8B9AE] dark:border-[#30343B] p-4 sm:p-5 shadow-2xs hover:shadow-md transition-all duration-200 interactive-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-[#0F766E] dark:text-teal-400 border border-teal-200/60 dark:border-teal-800/40 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-zinc-400">
                  Account Role
                </p>
                <p className="text-sm font-bold text-[#172033] dark:text-white truncate mt-0.5">
                  {roleLabel}
                </p>
              </div>
            </div>
          </div>

          {/* 5. Account Status */}
          <div className="bg-[#F8F4F2] hover:bg-[#FFF9F6] dark:bg-[#1A1D21] dark:hover:bg-[#22262C] rounded-2xl border border-[#D8B9AE] dark:border-[#30343B] p-4 sm:p-5 shadow-2xs hover:shadow-md transition-all duration-200 interactive-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-zinc-400">
                  Account Status
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <p className="text-sm font-bold text-[#0F766E] dark:text-emerald-400">
                    Active
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 6. Date Joined */}
          <div className="bg-[#F8F4F2] hover:bg-[#FFF9F6] dark:bg-[#1A1D21] dark:hover:bg-[#22262C] rounded-2xl border border-[#D8B9AE] dark:border-[#30343B] p-4 sm:p-5 shadow-2xs hover:shadow-md transition-all duration-200 interactive-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-[#D97706] dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-zinc-400">
                  Date Joined
                </p>
                <p className="text-sm font-bold text-[#172033] dark:text-white truncate mt-0.5">
                  {dateJoined}
                </p>
              </div>
            </div>
          </div>

          {/* 7. Last Active */}
          <div className="bg-[#F8F4F2] hover:bg-[#FFF9F6] dark:bg-[#1A1D21] dark:hover:bg-[#22262C] rounded-2xl border border-[#D8B9AE] dark:border-[#30343B] p-4 sm:p-5 shadow-2xs hover:shadow-md transition-all duration-200 interactive-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-[#BE123C] dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/40 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-zinc-400">
                  Last Active
                </p>
                <p className="text-sm font-bold text-[#172033] dark:text-white truncate mt-0.5">
                  {lastActive}
                </p>
              </div>
            </div>
          </div>

          {/* 8. Preferred Language */}
          <div className="bg-[#F8F4F2] hover:bg-[#FFF9F6] dark:bg-[#1A1D21] dark:hover:bg-[#22262C] rounded-2xl border border-[#D8B9AE] dark:border-[#30343B] p-4 sm:p-5 shadow-2xs hover:shadow-md transition-all duration-200 interactive-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40 flex items-center justify-center shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-zinc-400">
                  Preferred Language
                </p>
                <p className="text-sm font-bold text-[#172033] dark:text-white truncate mt-0.5">
                  {preferredLanguage}
                </p>
              </div>
            </div>
          </div>

          {/* 9. Theme Preference */}
          <div className="bg-[#F8F4F2] hover:bg-[#FFF9F6] dark:bg-[#1A1D21] dark:hover:bg-[#22262C] rounded-2xl border border-[#D8B9AE] dark:border-[#30343B] p-4 sm:p-5 shadow-2xs hover:shadow-md transition-all duration-200 interactive-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 border border-sky-200/60 dark:border-sky-800/40 flex items-center justify-center shrink-0">
                {theme === 'dark' ? (
                  <Moon className="w-5 h-5" />
                ) : theme === 'system' ? (
                  <Laptop className="w-5 h-5" />
                ) : (
                  <Sun className="w-5 h-5" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-zinc-400">
                  Theme Preference
                </p>
                <p className="text-sm font-bold text-[#172033] dark:text-white truncate mt-0.5">
                  {themeDisplay}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Editable Form Modal / Drawer */}
      {isEditing && (
        <div className="bg-[#F8F4F2] dark:bg-[#1A1D21] rounded-3xl border border-[#D8B9AE] dark:border-[#30343B] p-6 sm:p-8 shadow-md transition-all duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-[#D8B9AE]/60 dark:border-[#30343B]">
            <div>
              <h3 className="text-base font-bold text-[#172033] dark:text-white">
                Edit Basic Information
              </h3>
              <p className="text-xs text-[#64748B] dark:text-zinc-400 mt-0.5">
                Update your account name and email address.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="p-2 rounded-xl text-[#64748B] hover:bg-zinc-200/60 dark:hover:bg-zinc-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSave} className="mt-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-zinc-400 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D8B9AE] dark:border-zinc-700 bg-white dark:bg-zinc-800 text-[#172033] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#B4233C]"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-zinc-400 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D8B9AE] dark:border-zinc-700 bg-white dark:bg-zinc-800 text-[#172033] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#B4233C]"
                  placeholder="Enter email address"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#D8B9AE]/60 dark:border-[#30343B]">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setName(user?.name || '');
                  setEmail(user?.email || '');
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-[#D8B9AE] dark:border-zinc-700 text-[#172033] dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#B4233C] text-white hover:bg-[#852336] shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
