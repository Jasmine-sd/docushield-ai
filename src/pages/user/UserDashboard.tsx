import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Scan,
  ShieldCheck,
  AlertTriangle,
  FileText,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../contexts/I18nContext';
import { historyService } from '../../services/historyService';
import { ScanResult } from '../../types';
import { RiskBadge } from '../../components/common/RiskBadge';
import { RiskAnalytics } from '../../components/common/RiskAnalytics';
import { AnalysisOverview } from '../../components/common/AnalysisOverview';

export const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [scans, setScans] = useState<ScanResult[]>([]);

  useEffect(() => {
    setScans(historyService.getScans());
  }, []);

  const totalScans = scans.length;
  const lowRiskCount = scans.filter(s => s.riskLevel === 'low').length;
  const needsReviewCount = scans.filter(s => s.riskLevel === 'medium').length;
  const highRiskCount = scans.filter(s => s.riskLevel === 'high').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Welcome Banner / Action Card with subtle burgundy-to-teal gradient */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-[#B02A3A] via-[#852336] to-[#0F766E] text-white p-6 sm:p-8 shadow-xl shadow-[#B02A3A]/20 interactive-card">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold uppercase tracking-wider backdrop-blur-xs mb-3">
              {t.landing.badge}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              {t.dashboard.welcome}, {user?.name || 'User'}
            </h1>
            <p className="mt-2 text-white/90 text-sm sm:text-base leading-relaxed">
              {t.dashboard.overviewSub}
            </p>
          </div>

          <div className="shrink-0">
            <button
              type="button"
              onClick={() => navigate('/scanner')}
              className="px-6 py-3.5 rounded-2xl bg-white text-[#B02A3A] font-bold text-sm shadow-lg hover:bg-zinc-100 hover:shadow-xl active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Scan className="w-5 h-5" />
              <span>{t.dashboard.scanDocumentAction}</span>
            </button>
          </div>
        </div>

        {/* Subtle decorative security watermark lines */}
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-end pr-6">
          <ShieldCheck className="w-64 h-64 text-white" />
        </div>
      </div>

      {/* Metric Cards with attractive off-white #F8F4F2 background and #D8B9AE border for clear hierarchy */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Documents */}
        <div className="p-5 rounded-2xl bg-[#F8F4F2] hover:bg-[#FFF9F6] dark:bg-[#1A1D21] dark:hover:bg-[#22262C] border border-[#D8B9AE] dark:border-[#30343B] shadow-xs hover:shadow-md transition-all duration-200 interactive-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B] dark:text-blue-300">
              {t.dashboard.totalScans}
            </span>
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-[#172033] dark:text-blue-100 mt-3">
            {totalScans}
          </p>
          <p className="text-xs text-[#64748B] dark:text-blue-400/70 mt-1">{t.common.all}</p>
        </div>

        {/* Low Risk */}
        <div className="p-5 rounded-2xl bg-[#F8F4F2] hover:bg-[#FFF9F6] dark:bg-[#1A1D21] dark:hover:bg-[#22262C] border border-[#D8B9AE] dark:border-[#30343B] shadow-xs hover:shadow-md transition-all duration-200 interactive-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              {t.common.lowRisk}
            </span>
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-[#0F766E] dark:text-emerald-400 mt-3">
            {lowRiskCount}
          </p>
          <p className="text-xs text-emerald-800/80 dark:text-emerald-400/70 mt-1">{t.common.authentic}</p>
        </div>

        {/* Needs Review */}
        <div className="p-5 rounded-2xl bg-[#F8F4F2] hover:bg-[#FFF9F6] dark:bg-[#1A1D21] dark:hover:bg-[#22262C] border border-[#D8B9AE] dark:border-[#30343B] shadow-xs hover:shadow-md transition-all duration-200 interactive-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-300">
              {t.common.mediumRisk}
            </span>
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-[#D97706] dark:text-amber-400 mt-3">
            {needsReviewCount}
          </p>
          <p className="text-xs text-amber-800/80 dark:text-amber-400/70 mt-1">{t.common.suspicious}</p>
        </div>

        {/* High Risk */}
        <div className="p-5 rounded-2xl bg-[#F8F4F2] hover:bg-[#FFF9F6] dark:bg-[#1A1D21] dark:hover:bg-[#22262C] border border-[#D8B9AE] dark:border-[#30343B] shadow-xs hover:shadow-md transition-all duration-200 interactive-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-800 dark:text-rose-300">
              {t.common.highRisk}
            </span>
            <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-[#BE123C] dark:text-rose-400 mt-3">
            {highRiskCount}
          </p>
          <p className="text-xs text-rose-800/80 dark:text-rose-400/70 mt-1">{t.common.tampered}</p>
        </div>
      </div>

      {/* Analysis Overview Section with Bar chart (categories), Pie chart (verdicts), and Line chart (trends over time) */}
      <AnalysisOverview scans={scans} />

      {/* Comprehensive Risk Analysis Visualization (Low, Moderate, High with Bar, Pie, Line charts) */}
      <RiskAnalytics
        scans={scans}
        title="Risk Spectrum Distribution"
        subtitle="Forensic breakdown across low, medium, and high severity documents"
      />

      {/* Recent Scans Section with off-white card styling */}
      <div className="bg-[#F8F4F2] dark:bg-[#1A1D21] rounded-3xl border border-[#D8B9AE] dark:border-[#30343B] overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 interactive-card">
        <div className="p-5 sm:px-6 flex items-center justify-between border-b border-[#D8B9AE]/60 dark:border-[#30343B]">
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-white">{t.dashboard.recentActivity}</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {t.dashboard.overviewSub}
            </p>
          </div>
          <Link
            to="/history"
            className="text-xs font-semibold text-[#B02A3A] dark:text-rose-400 hover:underline flex items-center gap-1"
          >
            <span>{t.dashboard.viewAllHistory}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-zinc-50/80 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-[#30343B] text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wider font-semibold">
                <th className="py-3 px-5 sm:px-6">{t.history.docName}</th>
                <th className="py-3 px-4">{t.common.details}</th>
                <th className="py-3 px-4">{t.common.status}</th>
                <th className="py-3 px-4">{t.common.riskLevel}</th>
                <th className="py-3 px-4">{t.history.dateScanned}</th>
                <th className="py-3 px-5 text-right">{t.common.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200/70 dark:divide-zinc-800/80">
              {scans.slice(0, 5).map(scan => (
                <tr
                  key={scan.id}
                  onClick={() => navigate(`/results/${scan.id}`)}
                  className="hover:bg-teal-50/30 dark:hover:bg-teal-950/20 cursor-pointer transition-colors"
                >
                  <td className="py-3.5 px-5 sm:px-6">
                    <div className="font-semibold text-zinc-900 dark:text-white">
                      {scan.documentType}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                      {scan.id}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs text-zinc-600 dark:text-zinc-300">
                    {scan.maskedIdentifier}
                  </td>
                  <td className="py-3.5 px-4 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    {scan.verdict}
                  </td>
                  <td className="py-3.5 px-4">
                    <RiskBadge level={scan.riskLevel} score={scan.riskScore} size="sm" />
                  </td>
                  <td className="py-3.5 px-4 text-xs text-zinc-500 dark:text-zinc-400">
                    {new Date(scan.timestamp).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <span className="inline-flex items-center text-xs font-semibold text-[#B02A3A] dark:text-rose-400 hover:underline">
                      {t.common.viewDetails} →
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

