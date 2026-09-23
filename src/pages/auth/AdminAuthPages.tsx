import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, Lock, Mail, ArrowRight, Building2, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from '../../contexts/I18nContext';
import { LanguageSelector } from '../../components/LanguageSelector';
import { GoogleIcon } from '../../components/common/GoogleIcon';
import { BackButton } from '../../components/common/BackButton';
import { InteractiveBackground } from '../../components/common/InteractiveBackground';
import { PageTransition } from '../../components/common/PageTransition';

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('admin@docusentry.io');
  const [password, setPassword] = useState('admin1234');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const { showToast } = useToast();
  const { toggleTheme, resolvedTheme } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleGoogleAdminLogin = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle('admin');
      showToast('Admin Authorized', 'Authenticated via Enterprise Google SSO.', 'success');
      navigate('/admin/dashboard');
    } catch {
      showToast('SSO Failed', 'Unable to authenticate admin with Google.', 'error');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Missing Credentials', 'Please enter admin email and password.', 'warning');
      return;
    }

    setLoading(true);
    try {
      await login(email, 'admin');
      showToast('Admin Authorized', 'Signed in to Compliance Administration portal.', 'success');
      navigate('/admin/dashboard');
    } catch {
      showToast('Access Denied', 'Invalid compliance administrator credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-subtle-pattern text-[#1F2937] dark:text-[#F3F4F6] flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-500 relative overflow-hidden">
      {/* Interactive Background with Burgundy #B02A3A and Complementary Teal #0F766E */}
      <InteractiveBackground />

      {/* Top bar controls */}
      <div className="absolute top-6 left-6 z-20">
        <BackButton to="/" label={t.nav.home} />
      </div>
      <div className="absolute top-6 right-6 z-20">
        <LanguageSelector />
      </div>

      <PageTransition className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
            <div className="w-12 h-12 rounded-xl bg-zinc-900 dark:bg-black text-[#B02A3A] border border-zinc-700/80 flex items-center justify-center font-black text-xl shadow-lg transition-transform group-hover:scale-105">
              <ShieldAlert className="w-6 h-6 text-[#B02A3A]" />
            </div>
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0F766E]/10 dark:bg-[#0F766E]/20 text-[#0F766E] dark:text-teal-300 text-xs font-semibold uppercase tracking-wider mb-2 border border-[#0F766E]/30">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Restricted Security Portal</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
            {t.auth.adminLoginTitle}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
            {t.auth.adminLoginSub}
          </p>
        </div>

        <div className="mt-8 px-4 relative z-10">
          <div className="bg-white/95 dark:bg-[#1A1D21]/95 backdrop-blur-md py-8 px-6 shadow-md border border-zinc-200/90 dark:border-[#30343B] rounded-3xl sm:px-10 interactive-card">
            {/* Continue with Google */}
            <button
              type="button"
              onClick={handleGoogleAdminLogin}
              disabled={googleLoading || loading}
              className="w-full py-2.5 px-4 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs sm:text-sm font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-700/80 shadow-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-60"
            >
              <GoogleIcon className="w-4 h-4" />
              <span>{googleLoading ? 'Verifying SSO...' : `${t.auth.continueGoogle}`}</span>
            </button>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-200 dark:border-zinc-700" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white dark:bg-[#1A1D21] px-3 text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-semibold">
                  {t.auth.orEmail}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                  {t.auth.email}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="admin@organization.gov"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#B02A3A] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                  {t.auth.password}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#B02A3A] transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-[#B02A3A] dark:hover:bg-[#8C202E] font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? 'Verifying Credentials...' : t.auth.adminSignInBtn}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-500 dark:text-zinc-400">
              <Link to="/admin/signup" className="text-[#B02A3A] font-semibold hover:underline">
                {t.auth.noAccount}
              </Link>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 px-2">
            <Link to="/" className="hover:underline">
              ← {t.nav.home}
            </Link>
            <button onClick={toggleTheme} className="hover:underline cursor-pointer">
              {resolvedTheme === 'dark' ? '☀️ Light' : '🌙 Dark'}
            </button>
          </div>
        </div>
      </PageTransition>
    </div>
  );
};

export const AdminSignupPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { signup, loginWithGoogle } = useAuth();
  const { showToast } = useToast();
  const { toggleTheme, resolvedTheme } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleGoogleAdminSignup = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle('admin');
      showToast('Admin Enrolled', 'Registered via Enterprise Google SSO.', 'success');
      navigate('/admin/dashboard');
    } catch {
      showToast('SSO Failed', 'Unable to enroll admin via Google.', 'error');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      showToast('Missing Fields', 'All fields are mandatory for admin provision.', 'warning');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Password Mismatch', 'Passwords do not match.', 'error');
      return;
    }

    setLoading(true);
    try {
      await signup(name, email, 'admin', organization || 'DOCUSENTRY Enterprise Verification');
      showToast('Admin Registered', 'Compliance Administrator privileges granted.', 'success');
      navigate('/admin/dashboard');
    } catch {
      showToast('Registration Error', 'Unable to create admin account.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-subtle-pattern text-[#1F2937] dark:text-[#F3F4F6] flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-500 relative overflow-hidden">
      {/* Interactive Background with Burgundy #B02A3A and Complementary Teal #0F766E */}
      <InteractiveBackground />

      {/* Top bar controls */}
      <div className="absolute top-6 left-6 z-20">
        <BackButton to="/" label={t.nav.home} />
      </div>
      <div className="absolute top-6 right-6 z-20">
        <LanguageSelector />
      </div>

      <PageTransition className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
            <div className="w-12 h-12 rounded-xl bg-zinc-900 text-[#B02A3A] flex items-center justify-center font-black text-xl shadow-lg transition-transform group-hover:scale-105">
              <ShieldAlert className="w-6 h-6 text-[#B02A3A]" />
            </div>
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0F766E]/10 dark:bg-[#0F766E]/20 text-[#0F766E] dark:text-teal-300 text-xs font-semibold uppercase tracking-wider mb-2 border border-[#0F766E]/30">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Admin Provisioning</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
            {t.auth.adminSignupTitle}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
            {t.auth.adminSignupSub}
          </p>
        </div>

        <div className="mt-8 px-4 relative z-10">
          <div className="bg-white/95 dark:bg-[#1A1D21]/95 backdrop-blur-md py-8 px-6 shadow-md border border-zinc-200/90 dark:border-[#30343B] rounded-3xl sm:px-10 interactive-card">
            {/* Continue with Google */}
            <button
              type="button"
              onClick={handleGoogleAdminSignup}
              disabled={googleLoading || loading}
              className="w-full py-2.5 px-4 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs sm:text-sm font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-700/80 shadow-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-60"
            >
              <GoogleIcon className="w-4 h-4" />
              <span>{googleLoading ? 'Connecting...' : `${t.auth.continueGoogle}`}</span>
            </button>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-200 dark:border-zinc-700" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white dark:bg-[#1A1D21] px-3 text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-semibold">
                  {t.auth.orEmail}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                  {t.auth.fullName}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Vikram Malhotra"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#B02A3A] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                  {t.auth.email}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="officer@organization.org"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#B02A3A] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                  {t.auth.orgName}
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={organization}
                    onChange={e => setOrganization(e.target.value)}
                    placeholder="e.g. Verification Bureau"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#B02A3A] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                  {t.auth.password}
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#B02A3A] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#B02A3A] transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-[#B02A3A] dark:hover:bg-[#8C202E] font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? 'Enrolling...' : t.auth.adminSignUpBtn}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-500 dark:text-zinc-400">
              <Link to="/admin/login" className="text-[#B02A3A] font-semibold hover:underline">
                {t.auth.hasAccount}
              </Link>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 px-2">
            <Link to="/" className="hover:underline">
              ← {t.nav.home}
            </Link>
            <button onClick={toggleTheme} className="hover:underline cursor-pointer">
              {resolvedTheme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>
          </div>
        </div>
      </PageTransition>
    </div>
  );
};

