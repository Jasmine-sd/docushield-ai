import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from '../../contexts/I18nContext';
import { LanguageSelector } from '../../components/LanguageSelector';
import { GoogleIcon } from '../../components/common/GoogleIcon';
import { BackButton } from '../../components/common/BackButton';
import { InteractiveBackground } from '../../components/common/InteractiveBackground';
import { PageTransition } from '../../components/common/PageTransition';

export const UserLoginPage: React.FC = () => {
  const [email, setEmail] = useState('ananya@example.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const { showToast } = useToast();
  const { toggleTheme, resolvedTheme } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle('user');
      showToast('Google Sign-In Successful', 'Signed in as Jasmeet Kaur via Google. Redirecting to dashboard...', 'success');
      navigate('/dashboard');
    } catch {
      showToast('Google Sign-In Failed', 'Unable to authenticate with Google.', 'error');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Missing Fields', 'Please provide your email and password.', 'warning');
      return;
    }

    setLoading(true);
    try {
      await login(email, 'user');
      showToast('Welcome back', 'Signed in successfully. Entering user dashboard...', 'success');
      navigate('/dashboard');
    } catch {
      showToast('Login Failed', 'Unable to sign in. Please verify your credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-subtle-pattern text-[#1F2937] dark:text-[#F3F4F6] flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-500 relative overflow-hidden">
      {/* Background Interactive Lighting with Burgundy (#B02A3A) and Complementary Teal (#0F766E) */}
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
            <div className="w-11 h-11 rounded-xl bg-[#B02A3A] text-white flex items-center justify-center font-black text-xl shadow-md shadow-[#B02A3A]/25 transition-transform group-hover:scale-105">
              DS
            </div>
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0F766E]/10 dark:bg-[#0F766E]/20 text-[#0F766E] dark:text-teal-300 text-xs font-semibold mb-2 border border-[#0F766E]/20">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Secure Access</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
            {t.auth.userLoginTitle}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
            {t.auth.userLoginSub}
          </p>
        </div>

        <div className="mt-8 px-4 relative z-10">
          <div className="bg-white/95 dark:bg-[#1A1D21]/95 backdrop-blur-md py-8 px-6 shadow-md border border-zinc-200/90 dark:border-[#30343B] rounded-3xl sm:px-10 interactive-card">
            {/* Continue with Google Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              className="w-full py-2.5 px-4 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs sm:text-sm font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-700/80 shadow-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-60"
            >
              <GoogleIcon className="w-4 h-4" />
              <span>{googleLoading ? 'Connecting to Google...' : t.auth.continueGoogle}</span>
            </button>

            {/* Divider */}
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
                    placeholder="name@example.com"
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
                disabled={loading || googleLoading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-[#B02A3A] hover:bg-[#8C202E] text-white font-semibold text-sm shadow-md shadow-[#B02A3A]/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.99]"
              >
                <span>{loading ? 'Authenticating...' : t.auth.signInBtn}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-500 dark:text-zinc-400">
              <Link to="/user/signup" className="text-[#B02A3A] font-semibold hover:underline">
                {t.auth.noAccount}
              </Link>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 px-2">
            <Link to="/" className="hover:underline flex items-center gap-1">
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



export const UserSignupPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    agreeTerms?: string;
  }>({});

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { signup, loginWithGoogle } = useAuth();
  const { showToast } = useToast();
  const { toggleTheme, resolvedTheme } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle('user');
      showToast('Account Created via Google', 'Welcome to DOCUSENTRY! Redirecting to your dashboard...', 'success');
      navigate('/dashboard');
    } catch {
      showToast('Google Sign-Up Failed', 'Unable to create account with Google. Please try again.', 'error');
    } finally {
      setGoogleLoading(false);
    }
  };

  const validateForm = () => {
    const errors: {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
      agreeTerms?: string;
    } = {};

    const trimmedName = name.trim();
    if (!trimmedName) {
      errors.name = 'Please provide your full legal name.';
    } else if (trimmedName.length < 2) {
      errors.name = 'Name must be at least 2 characters long.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      errors.email = 'Please provide your email address.';
    } else if (!emailRegex.test(email.trim())) {
      errors.email = 'Please enter a valid email address (e.g. name@domain.com).';
    }

    if (!password) {
      errors.password = 'Please create a secure password.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters for security.';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Confirm your password by entering it again.';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match. Please verify both fields.';
    }

    if (!agreeTerms) {
      errors.agreeTerms = 'You must agree to the Terms of Service and Privacy Policy to proceed.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast('Check Registration Details', 'Please resolve the highlighted fields below.', 'warning');
      return;
    }

    setLoading(true);
    try {
      await signup(name.trim(), email.trim(), 'user');
      showToast('Account Registered', `Welcome to DOCUSENTRY, ${name.trim()}! Entering dashboard...`, 'success');
      navigate('/dashboard');
    } catch {
      showToast('Registration Error', 'Unable to create account. Please check your network and try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-subtle-pattern text-[#1F2937] dark:text-[#F3F4F6] flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-500 relative overflow-hidden">
      {/* Background Interactive Lighting with Burgundy (#B02A3A) and Complementary Teal (#0F766E) */}
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
            <div className="w-11 h-11 rounded-xl bg-[#B02A3A] text-white flex items-center justify-center font-black text-xl shadow-md shadow-[#B02A3A]/25 transition-transform group-hover:scale-105">
              DS
            </div>
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0F766E]/10 dark:bg-[#0F766E]/20 text-[#0F766E] dark:text-teal-300 text-xs font-semibold mb-2 border border-[#0F766E]/20">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Fast & Secure Verification</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
            {t.auth.userSignupTitle}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
            {t.auth.userSignupSub}
          </p>
        </div>

        <div className="mt-8 px-4 relative z-10">
          <div className="bg-white/95 dark:bg-[#1A1D21]/95 backdrop-blur-md py-8 px-6 shadow-md border border-zinc-200/90 dark:border-[#30343B] rounded-3xl sm:px-10 interactive-card">
            {/* Continue with Google Button */}
            <button
              type="button"
              onClick={handleGoogleSignup}
              disabled={googleLoading || loading}
              className="w-full py-2.5 px-4 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs sm:text-sm font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-700/80 shadow-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-60"
            >
              <GoogleIcon className="w-4 h-4" />
              <span>{googleLoading ? 'Connecting to Google...' : t.auth.continueGoogle}</span>
            </button>

            {/* Divider */}
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

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                  {t.auth.fullName}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => {
                    setName(e.target.value);
                    if (formErrors.name) setFormErrors({ ...formErrors, name: undefined });
                  }}
                  placeholder="e.g. Jasmeet Kaur"
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-white dark:bg-zinc-800/80 text-zinc-900 dark:text-white text-sm focus:outline-none transition-all ${
                    formErrors.name
                      ? 'border-rose-400 focus:ring-2 focus:ring-rose-500/20'
                      : 'border-zinc-300 dark:border-zinc-700 focus:ring-2 focus:ring-[#B02A3A]'
                  }`}
                />
                {formErrors.name && (
                  <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                    <span>•</span> {formErrors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                  {t.auth.email}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value);
                    if (formErrors.email) setFormErrors({ ...formErrors, email: undefined });
                  }}
                  placeholder="name@example.com"
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-white dark:bg-zinc-800/80 text-zinc-900 dark:text-white text-sm focus:outline-none transition-all ${
                    formErrors.email
                      ? 'border-rose-400 focus:ring-2 focus:ring-rose-500/20'
                      : 'border-zinc-300 dark:border-zinc-700 focus:ring-2 focus:ring-[#B02A3A]'
                  }`}
                />
                {formErrors.email && (
                  <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                    <span>•</span> {formErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                  {t.auth.password}
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    if (formErrors.password) setFormErrors({ ...formErrors, password: undefined });
                  }}
                  placeholder="••••••••"
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-white dark:bg-zinc-800/80 text-zinc-900 dark:text-white text-sm focus:outline-none transition-all ${
                    formErrors.password
                      ? 'border-rose-400 focus:ring-2 focus:ring-rose-500/20'
                      : 'border-zinc-300 dark:border-zinc-700 focus:ring-2 focus:ring-[#B02A3A]'
                  }`}
                />
                {formErrors.password && (
                  <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                    <span>•</span> {formErrors.password}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={e => {
                    setConfirmPassword(e.target.value);
                    if (formErrors.confirmPassword) setFormErrors({ ...formErrors, confirmPassword: undefined });
                  }}
                  placeholder="••••••••"
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-white dark:bg-zinc-800/80 text-zinc-900 dark:text-white text-sm focus:outline-none transition-all ${
                    formErrors.confirmPassword
                      ? 'border-rose-400 focus:ring-2 focus:ring-rose-500/20'
                      : 'border-zinc-300 dark:border-zinc-700 focus:ring-2 focus:ring-[#B02A3A]'
                  }`}
                />
                {formErrors.confirmPassword && (
                  <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                    <span>•</span> {formErrors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Terms Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={e => {
                      setAgreeTerms(e.target.checked);
                      if (formErrors.agreeTerms) setFormErrors({ ...formErrors, agreeTerms: undefined });
                    }}
                    className="mt-0.5 rounded border-zinc-300 dark:border-zinc-700 text-[#B02A3A] focus:ring-[#B02A3A] accent-[#B02A3A]"
                  />
                  <span className="text-xs text-zinc-600 dark:text-zinc-400 leading-snug">
                    I agree to the{' '}
                    <span className="text-[#0F766E] dark:text-teal-400 font-semibold underline underline-offset-2">
                      Terms of Service
                    </span>{' '}
                    and{' '}
                    <span className="text-[#0F766E] dark:text-teal-400 font-semibold underline underline-offset-2">
                      Privacy Policy
                    </span>
                    .
                  </span>
                </label>
                {formErrors.agreeTerms && (
                  <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1">
                    <span>•</span> {formErrors.agreeTerms}
                  </p>
                )}
              </div>

              {/* Submit Button - Create Account */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-[#B02A3A] hover:bg-[#8C202E] text-white font-semibold text-sm shadow-md shadow-[#B02A3A]/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.99]"
              >
                <span>{loading ? 'Creating Account...' : t.auth.signUpBtn}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-500 dark:text-zinc-400">
              <Link to="/user/login" className="text-[#B02A3A] font-semibold hover:underline">
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
