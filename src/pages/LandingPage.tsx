import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Scan,
  ShieldCheck,
  Lock,
  ArrowRight,
  Sparkles,
  Eye,
  LogOut,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../contexts/I18nContext';
import { LanguageSelector } from '../components/LanguageSelector';
import { GoogleIcon } from '../components/common/GoogleIcon';
import { InteractiveBackground } from '../components/common/InteractiveBackground';
import { PageTransition } from '../components/common/PageTransition';

export const LandingPage: React.FC = () => {
  const { user, loginWithGoogle, logout } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleQuickGoogleSignIn = async () => {
    await loginWithGoogle('user');
    navigate('/dashboard');
  };

  const handleGetStarted = () => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/dashboard');
    } else {
      navigate('/user/signup');
    }
  };

  return (
    <div className="min-h-screen bg-subtle-pattern text-[#1F2937] dark:text-[#F3F4F6] transition-colors duration-500 flex flex-col font-sans relative overflow-x-hidden">
      {/* Interactive Background with Burgundy #B02A3A and Complementary Verification Teal #0F766E */}
      <InteractiveBackground />

      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-white/85 dark:bg-[#1A1D21]/85 backdrop-blur-md border-b border-zinc-200/80 dark:border-[#30343B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#B02A3A] text-white flex items-center justify-center font-black tracking-tight text-lg shadow-md shadow-[#B02A3A]/25">
              DS
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-wider text-zinc-900 dark:text-white">
                DOCUSENTRY
              </span>
              <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 -mt-0.5">
                {t.landing.badge}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Multilingual Selector */}
            <LanguageSelector variant="header" />

            {/* Quick theme toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all text-xs font-semibold shadow-xs cursor-pointer"
              title={resolvedTheme === 'dark' ? t.common.light : t.common.dark}
            >
              {resolvedTheme === 'dark' ? (
                <>
                  <span className="text-amber-400">☀️</span>
                  <span className="hidden sm:inline">{t.common.light}</span>
                </>
              ) : (
                <>
                  <span className="text-indigo-500">🌙</span>
                  <span className="hidden sm:inline">{t.common.dark}</span>
                </>
              )}
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate(user.role === 'admin' ? '/admin/dashboard' : '/dashboard')}
                  className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-[#B02A3A] text-white hover:bg-[#8C202E] shadow-xs hover:shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>{t.nav.workspace} ({user.name.split(' ')[0]})</span>
                </button>

                {/* Explicit Sign Out on Landing Page */}
                <button
                  type="button"
                  onClick={logout}
                  className="p-2 rounded-xl text-zinc-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-zinc-200 dark:border-zinc-700 transition-all cursor-pointer"
                  title={t.nav.signOut}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Continue with Google quick button */}
                <button
                  type="button"
                  onClick={handleQuickGoogleSignIn}
                  className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all cursor-pointer"
                >
                  <GoogleIcon className="w-3.5 h-3.5" />
                  <span>Google</span>
                </button>

                <Link
                  to="/user/login"
                  className="px-3 py-1.5 text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  {t.nav.signIn}
                </Link>

                <Link
                  to="/user/signup"
                  className="px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-xl bg-[#B02A3A] text-white hover:bg-[#8C202E] shadow-xs hover:shadow-md transition-all"
                >
                  {t.nav.signUp}
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <PageTransition className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#B02A3A]/10 to-[#0F766E]/10 dark:from-[#B02A3A]/20 dark:to-[#0F766E]/20 text-[#B02A3A] dark:text-rose-300 text-xs font-semibold uppercase tracking-wider mb-6 border border-[#B02A3A]/20">
              <Sparkles className="w-3.5 h-3.5 text-[#0F766E] dark:text-teal-400" />
              <span>{t.landing.badge}</span>
            </div>

            <h1 className="text-4xl sm:5xl md:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-[1.15]">
              {t.landing.heroTitle1}{' '}
              <span className="text-[#B02A3A] underline decoration-[#0F766E] decoration-4 underline-offset-8">
                {t.landing.heroTitle2}
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-zinc-600 dark:text-zinc-300 max-w-3xl mx-auto font-normal leading-relaxed">
              {t.landing.heroSub}
            </p>

            {/* Clear Flow: Get Started → Registration → Dashboard */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                type="button"
                onClick={handleGetStarted}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#B02A3A] text-white font-semibold text-base shadow-lg shadow-[#B02A3A]/25 hover:bg-[#8C202E] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <span>{t.landing.startScanning}</span>
                <ArrowRight className="w-5 h-5 text-white" />
              </button>

              <button
                type="button"
                onClick={() => navigate(user?.role === 'admin' ? '/admin/scanner' : '/scanner')}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 font-semibold text-base hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Scan className="w-4 h-4 text-[#0F766E]" />
                <span>{t.landing.exploreWorkspace}</span>
              </button>
            </div>

            {/* Supported Documents Strip */}
            <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400">
              <p className="font-medium mb-3 uppercase tracking-wider text-[11px]">
                {t.landing.feature1Title}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
                {[
                  'Aadhaar Card',
                  'PAN Card',
                  'Passport',
                  'Driving Licence',
                  'Degree Certificate',
                  'Diploma',
                  'Marksheet',
                  'Bonafide Certificate',
                  'Experience Certificate',
                  'Government Certificate',
                ].map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Visual Workflow Steps */}
        <section id="how-it-works" className="py-16 bg-white/70 dark:bg-[#1A1D21]/70 backdrop-blur-xs border-y border-zinc-200 dark:border-[#30343B]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
                {t.landing.howTitle}
              </h2>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                {t.landing.whySub}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative">
              {[
                { step: '01', title: t.landing.step1Title, desc: t.landing.step1Desc },
                { step: '02', title: t.landing.step2Title, desc: t.landing.step2Desc },
                { step: '03', title: t.landing.step3Title, desc: t.landing.step3Desc },
              ].map(item => (
                <div
                  key={item.step}
                  className="p-5 rounded-2xl bg-zinc-50/90 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between interactive-card"
                >
                  <div>
                    <span className="text-2xl font-black text-[#B02A3A] font-mono">{item.step}</span>
                    <h3 className="text-base font-bold text-zinc-900 dark:text-white mt-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">
                {t.landing.whyTitle}
              </h2>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                {t.landing.whySub}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-teal-500/5 dark:bg-teal-950/20 border border-teal-500/20 shadow-xs interactive-card">
                <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-[#0F766E] dark:text-teal-400 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                  {t.landing.feature1Title}
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">
                  {t.landing.feature1Desc}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/20 shadow-xs interactive-card">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 flex items-center justify-center mb-4">
                  <Eye className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                  {t.landing.feature2Title}
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">
                  {t.landing.feature2Desc}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-rose-500/5 dark:bg-rose-950/20 border border-rose-500/20 shadow-xs interactive-card">
                <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-[#B02A3A] dark:text-rose-400 flex items-center justify-center mb-4">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                  {t.landing.feature3Title}
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">
                  {t.landing.feature3Desc}
                </p>
              </div>
            </div>
          </div>
        </section>
      </PageTransition>

      {/* Footer */}
      <footer className="mt-auto py-8 bg-white/80 dark:bg-[#1A1D21]/80 backdrop-blur-xs border-t border-zinc-200 dark:border-[#30343B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-zinc-900 dark:text-white">DOCUSENTRY</span>
            <span>• {t.landing.footerTagline}</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/user/signup" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
              {t.nav.signUp}
            </Link>
            <Link to="/user/login" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
              {t.nav.signIn}
            </Link>
            <Link to="/admin/login" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
              {t.nav.adminDashboard}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

