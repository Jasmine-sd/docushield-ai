import React from 'react';
import { Sparkles, Layers, Type, QrCode, FileText } from 'lucide-react';
import { historyService } from '../../services/historyService';
import { RiskAnalytics } from '../../components/common/RiskAnalytics';
import { useTranslation } from '../../contexts/I18nContext';

export const AdminAIInsightsPage: React.FC = () => {
  const scans = historyService.getScans();
  const { t } = useTranslation();

  const insightsData = [
    {
      title: 'QR Code vs Visible Text Mismatch',
      category: 'Optical / Data Discrepancy',
      frequency: '34% of High-Risk Scans',
      riskImpact: 'High',
      description: 'Demographic dates or names embedded in cryptographic QR payloads diverge from printed surface typography.',
      icon: QrCode,
      color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800',
    },
    {
      title: 'Baseline Font Kerning Jitter',
      category: 'Typography & Layout',
      frequency: '28% of Medium-Risk Scans',
      riskImpact: 'Medium',
      description: 'Single characters or digits exhibit vertical baseline offset (>1.2px) characteristic of inserted text layers.',
      icon: Type,
      color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
    },
    {
      title: 'Localized JPEG Error Level Differential',
      category: 'Compression Artifacting',
      frequency: '19% of All Scans',
      riskImpact: 'High',
      description: 'Disproportionately high frequency compression noise strictly around serial numbers or signature seals.',
      icon: Layers,
      color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800',
    },
    {
      title: 'Embossed Stamp Anti-Aliasing Blur',
      category: 'Official Seal Analysis',
      frequency: '12% of Flagged Certificates',
      riskImpact: 'Medium',
      description: 'Stamp boundaries show soft digital feathering rather than physical ink paper bleed.',
      icon: FileText,
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-[#F2AF29]" />
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            {t.nav.aiInsights}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
          {t.admin.aiInsightsTitle}
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Aggregated trend analysis of document anomalies, typography differences, and tampering markers.
        </p>
      </div>

      {/* Embedded Dynamic Risk Analytics with Bar, Pie, and Line charts */}
      <RiskAnalytics
        scans={scans}
        title="Risk Spectrum Distribution Across Scan Corpus"
        subtitle="Forensic frequency representation for Low, Moderate, and High severity documents."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {insightsData.map(insight => {
          const Icon = insight.icon;
          return (
            <div
              key={insight.title}
              className="p-6 rounded-2xl bg-linear-to-b from-white to-slate-50/50 dark:from-[#1A1D21] dark:to-slate-900/40 border border-zinc-200/80 dark:border-[#30343B] shadow-xs flex flex-col justify-between interactive-card"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2.5 rounded-xl border ${insight.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                    {insight.frequency}
                  </span>
                </div>

                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  {insight.category}
                </span>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white mt-0.5">
                  {insight.title}
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">
                  {insight.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                <span className="text-zinc-500">{t.results.riskLevel}:</span>
                <span
                  className={`font-bold ${
                    insight.riskImpact === 'High' ? 'text-rose-600' : 'text-amber-600'
                  }`}
                >
                  {insight.riskImpact} Severity
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

