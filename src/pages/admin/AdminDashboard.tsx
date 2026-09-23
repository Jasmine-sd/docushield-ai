import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Inbox,
  Sparkles,
} from 'lucide-react';
import { useTranslation } from '../../contexts/I18nContext';
import { historyService } from '../../services/historyService';
import { ScanResult } from '../../types';
import { RiskBadge } from '../../components/common/RiskBadge';
import { RiskAnalytics } from '../../components/common/RiskAnalytics';

export const AdminDashboard: React.FC = () => {
  const [scans, setScans] = useState<ScanResult[]>([]);
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    setScans(historyService.getScans());
  }, []);

  const totalScans = scans.length;
  const highRiskScans = scans.filter(s => s.riskLevel === 'high');
  const mediumRiskScans = scans.filter(s => s.riskLevel === 'medium');
  const lowRiskScans = scans.filter(s => s.riskLevel === 'low');
  const pendingReviewScans = scans.filter(s => s.reviewStatus === 'pending');

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-linear-to-r from-[#B02A3A]/15 to-[#0F766E]/15 text-[#B02A3A] dark:text-rose-300 border border-[#B02A3A]/25 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#0F766E]" />
              {t.admin.title}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
            {t.admin.title}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            {t.admin.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigate('/admin/review-queue')}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>{t.admin.queueTitle} ({pendingReviewScans.length})</span>
          </button>
        </div>
      </div>

      {/* Admin Metric Cards with off-white #F8F4F2 background and #D8B9AE border */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Ingested */}
        <div className="p-4 rounded-2xl bg-[#F8F4F2] hover:bg-[#FFF9F6] dark:bg-[#1A1D21] dark:hover:bg-[#22262C] border border-[#D8B9AE] dark:border-[#30343B] shadow-xs hover:shadow-md transition-all duration-200 interactive-card">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] dark:text-blue-300 block">
            {t.dashboard.totalScans}
          </span>
          <p className="text-2xl font-black text-[#172033] dark:text-blue-100 mt-1">{totalScans}</p>
          <span className="text-[10px] text-[#64748B] dark:text-blue-400/70">{t.admin.statusOperational}</span>
        </div>

        {/* Verified Clean */}
        <div className="p-4 rounded-2xl bg-[#F8F4F2] hover:bg-[#FFF9F6] dark:bg-[#1A1D21] dark:hover:bg-[#22262C] border border-[#D8B9AE] dark:border-[#30343B] shadow-xs hover:shadow-md transition-all duration-200 interactive-card">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block">
            {t.history.filterAuthentic}
          </span>
          <p className="text-2xl font-black text-[#0F766E] dark:text-emerald-400 mt-1">
            {lowRiskScans.length}
          </p>
          <span className="text-[10px] text-emerald-800/80 dark:text-emerald-400/70">{t.dashboard.authenticRate}</span>
        </div>

        {/* Needs Review */}
        <div className="p-4 rounded-2xl bg-[#F8F4F2] hover:bg-[#FFF9F6] dark:bg-[#1A1D21] dark:hover:bg-[#22262C] border border-[#D8B9AE] dark:border-[#30343B] shadow-xs hover:shadow-md transition-all duration-200 interactive-card">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-300 block">
            {t.history.filterSuspicious}
          </span>
          <p className="text-2xl font-black text-[#D97706] dark:text-amber-400 mt-1">
            {mediumRiskScans.length}
          </p>
          <span className="text-[10px] text-amber-800/80 dark:text-amber-400/70">{t.results.suspiciousBadge}</span>
        </div>

        {/* High Risk Flags */}
        <div className="p-4 rounded-2xl bg-[#F8F4F2] hover:bg-[#FFF9F6] dark:bg-[#1A1D21] dark:hover:bg-[#22262C] border border-[#D8B9AE] dark:border-[#30343B] shadow-xs hover:shadow-md transition-all duration-200 interactive-card">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-800 dark:text-rose-300 block">
            {t.admin.flaggedFraud}
          </span>
          <p className="text-2xl font-black text-[#BE123C] dark:text-rose-400 mt-1">
            {highRiskScans.length}
          </p>
          <span className="text-[10px] text-rose-800/80 dark:text-rose-400/70">{t.dashboard.tamperedAlerts}</span>
        </div>

        {/* Pending Action */}
        <div className="p-4 rounded-2xl bg-[#F8F4F2] hover:bg-[#FFF9F6] dark:bg-[#1A1D21] dark:hover:bg-[#22262C] border border-[#D8B9AE] dark:border-[#30343B] shadow-xs hover:shadow-md transition-all duration-200 col-span-2 lg:col-span-1 interactive-card">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-800 dark:text-purple-300 block">
            {t.admin.pendingReview}
          </span>
          <p className="text-2xl font-black text-purple-700 dark:text-purple-400 mt-1">
            {pendingReviewScans.length}
          </p>
          <span className="text-[10px] text-purple-800/80 dark:text-purple-400/70">{t.admin.queueTitle}</span>
        </div>
      </div>

      {/* Full Low, Moderate, High Risk Visualization Component */}
      <RiskAnalytics
        scans={scans}
        title={t.dashboard.securityStatus}
        subtitle={t.dashboard.overviewSub}
      />

      {/* Visual Analytics / Distribution representation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-linear-to-b from-white to-slate-50/50 dark:from-[#1A1D21] dark:to-slate-900/40 border border-zinc-200/80 dark:border-[#30343B] shadow-xs interactive-card">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-1">
            {t.dashboard.fraudDistribution}
          </h3>
          <p className="text-xs text-zinc-500 mb-4">{t.dashboard.overviewSub}</p>

          <div className="space-y-3">
            {[
              { label: 'Identity & Government Documents', count: scans.filter(s => s.documentCategory === 'identity').length, total: totalScans, color: 'bg-[#B02A3A]' },
              { label: 'Academic & Educational Credentials', count: scans.filter(s => s.documentCategory === 'education').length, total: totalScans, color: 'bg-blue-600' },
              { label: 'Employment, Deeds & Contracts', count: scans.filter(s => s.documentCategory === 'employment').length, total: totalScans, color: 'bg-emerald-600' },
            ].map(item => {
              const pct = totalScans > 0 ? Math.round((item.count / totalScans) * 100) : 0;
              return (
                <div key={item.label}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-zinc-700 dark:text-zinc-300 font-medium truncate max-w-[280px]">
                      {item.label}
                    </span>
                    <span className="font-mono font-bold text-zinc-900 dark:text-white">
                      {item.count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.color}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-linear-to-b from-white to-slate-50/50 dark:from-[#1A1D21] dark:to-slate-900/40 border border-zinc-200/80 dark:border-[#30343B] shadow-xs interactive-card">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-1">
            {t.results.riskLevel}
          </h3>
          <p className="text-xs text-zinc-500 mb-4">{t.results.subtitle}</p>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
              <span className="text-xs text-emerald-800 dark:text-emerald-300 font-semibold block">{t.history.filterAuthentic} (0-30)</span>
              <p className="text-xl font-black text-emerald-600 mt-1">{lowRiskScans.length}</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
              <span className="text-xs text-amber-800 dark:text-amber-300 font-semibold block">{t.history.filterSuspicious} (31-60)</span>
              <p className="text-xl font-black text-amber-600 mt-1">{mediumRiskScans.length}</p>
            </div>
            <div className="p-3 rounded-xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
              <span className="text-xs text-rose-800 dark:text-rose-300 font-semibold block">{t.history.filterTampered} (61-100)</span>
              <p className="text-xl font-black text-rose-600 mt-1">{highRiskScans.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Urgent Review Queue Preview Table */}
      <div className="bg-linear-to-b from-white via-white/95 to-slate-50/50 dark:from-[#1A1D21] dark:via-[#1A1D21]/95 dark:to-slate-900/40 rounded-2xl border border-zinc-200/80 dark:border-[#30343B] overflow-hidden shadow-xs interactive-card">
        <div className="p-5 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
              {t.admin.queueTitle}
            </h3>
            <p className="text-xs text-zinc-500">
              {t.admin.subtitle}
            </p>
          </div>
          <Link to="/admin/review-queue" className="text-xs font-semibold text-[#B02A3A] dark:text-rose-400 hover:underline">
            {t.admin.queueTitle} →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-zinc-50/80 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-[#30343B] text-zinc-500 text-xs uppercase font-semibold">
                <th className="py-3 px-5">{t.history.docName}</th>
                <th className="py-3 px-4">{t.results.tamperAnalysis}</th>
                <th className="py-3 px-4">{t.history.riskScore}</th>
                <th className="py-3 px-4">{t.results.verdictLabel}</th>
                <th className="py-3 px-5 text-right">{t.history.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200/70 dark:divide-zinc-800/80">
              {scans
                .filter(s => s.riskLevel === 'high' || s.riskLevel === 'medium')
                .slice(0, 4)
                .map(scan => (
                  <tr
                    key={scan.id}
                    onClick={() => navigate(`/results/${scan.id}`)}
                    className="hover:bg-rose-50/30 dark:hover:bg-rose-950/20 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-5">
                      <div className="font-semibold text-zinc-900 dark:text-white text-xs">
                        {scan.documentType}
                      </div>
                      <div className="text-[11px] font-mono text-zinc-400">{scan.id}</div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-zinc-700 dark:text-zinc-300">
                      {scan.findings[0]?.title || scan.verdict}
                    </td>
                    <td className="py-3.5 px-4">
                      <RiskBadge level={scan.riskLevel} score={scan.riskScore} size="sm" />
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                        {scan.reviewStatus || 'pending'}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <span className="text-xs font-semibold text-[#B02A3A] dark:text-rose-400">
                        {t.history.actions} →
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

