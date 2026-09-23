import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { I18nProvider } from './contexts/I18nContext';

import { AppLayout } from './components/layout/AppLayout';
import { LandingPage } from './pages/LandingPage';

// Auth Pages
import { UserLoginPage, UserSignupPage } from './pages/auth/UserAuthPages';
import { AdminLoginPage, AdminSignupPage } from './pages/auth/AdminAuthPages';

import { ResultsErrorBoundary } from './components/common/ResultsErrorBoundary';

// User Workspace Pages
import { UserDashboard } from './pages/user/UserDashboard';
import { UniversalScannerPage } from './pages/scanner/UniversalScannerPage';
import { ResultDetailPage } from './pages/scanner/ResultDetailPage';
import { HistoryPage } from './pages/user/HistoryPage';
import { CompareDocumentsPage } from './pages/user/CompareDocumentsPage';
import { ReportsPage } from './pages/user/ReportsPage';
import { ProfilePage } from './pages/user/ProfilePage';
import { SettingsPage } from './pages/user/SettingsPage';
import { HelpPage } from './pages/user/HelpPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminIdentityVerificationPage } from './pages/admin/AdminIdentityVerificationPage';
import { AdminReviewQueuePage } from './pages/admin/AdminReviewQueuePage';
import { AdminAIInsightsPage } from './pages/admin/AdminAIInsightsPage';
import { AdminSystemHealthPage } from './pages/admin/AdminSystemHealthPage';
import { AdminAuditHistoryPage } from './pages/admin/AdminAuditHistoryPage';

function ProtectedRoute({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole?: 'user' | 'admin';
}) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={requiredRole === 'admin' ? '/admin/login' : '/user/login'} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AuthProvider>
          <ToastProvider>
            <BrowserRouter>
              <Routes>
              {/* Public Landing Page */}
              <Route path="/" element={<LandingPage />} />

              {/* Separate User Auth Routes */}
              <Route path="/user/login" element={<UserLoginPage />} />
              <Route path="/user/signup" element={<UserSignupPage />} />

              {/* Separate Admin Auth Routes */}
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin/signup" element={<AdminSignupPage />} />

              {/* User Dashboard & Scanners */}
              <Route
                element={
                  <ProtectedRoute requiredRole="user">
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<UserDashboard />} />
                <Route path="/scanner" element={<UniversalScannerPage />} />
                <Route path="/results/:scanId" element={<ResultsErrorBoundary><ResultDetailPage /></ResultsErrorBoundary>} />
                <Route path="/compare" element={<CompareDocumentsPage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/help" element={<HelpPage />} />
              </Route>

              {/* Admin Portal */}
              <Route
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/scanner" element={<UniversalScannerPage />} />
                <Route path="/admin/identity-verification" element={<AdminIdentityVerificationPage />} />
                <Route path="/admin/review-queue" element={<AdminReviewQueuePage />} />
                <Route path="/admin/ai-insights" element={<AdminAIInsightsPage />} />
                <Route path="/admin/system-health" element={<AdminSystemHealthPage />} />
                <Route path="/admin/scan-history" element={<HistoryPage />} />
                <Route path="/admin/audit-history" element={<AdminAuditHistoryPage />} />
                <Route path="/admin/settings" element={<SettingsPage />} />
                <Route path="/admin/profile" element={<ProfilePage />} />
              </Route>

              {/* Catch-all fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </I18nProvider>
  </ThemeProvider>
);
}
