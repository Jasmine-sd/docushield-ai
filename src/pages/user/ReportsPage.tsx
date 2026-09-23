import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Eye } from 'lucide-react';
import { historyService } from '../../services/historyService';
import { RiskBadge } from '../../components/common/RiskBadge';
import { useToast } from '../../contexts/ToastContext';
import { useTranslation } from '../../contexts/I18nContext';

export const ReportsPage: React.FC = () => {
  const scans = historyService.getScans();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useTranslation();

  const handleDownload = async (id: string, docType: string) => {
    showToast(t.results.downloadAuditReport, `Generating official PDF audit report for ${docType} (${id})...`, 'success');
    try {
      const response = await fetch(`/api/v1/scans/${id}/report`);
      if (!response.ok) throw new Error('Failed to generate report PDF');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `DOCUSENTRY_Report_${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      showToast('Download Error', 'Could not download PDF report.', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
          {t.reports.title}
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          {t.reports.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {scans.map(scan => {
          return (
            <div
              key={scan.id}
              className="p-5 rounded-2xl bg-[#F8F4F2] hover:bg-[#FFF9F6] dark:bg-[#1A1D21] dark:hover:bg-[#22262C] border border-[#D8B9AE] dark:border-[#30343B] flex flex-col justify-between shadow-xs hover:shadow-md transition-all interactive-card"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-mono font-bold text-[#64748B] dark:text-zinc-400 bg-white dark:bg-zinc-800/80 px-2.5 py-0.5 rounded-lg border border-[#D8B9AE]/60 dark:border-zinc-700/80 shadow-2xs">
                    {scan.id}
                  </span>
                  <RiskBadge level={scan.riskLevel} score={scan.riskScore} size="sm" />
                </div>

                <h3 className="text-base font-bold text-[#172033] dark:text-white">
                  {scan.documentType}
                </h3>

                <p className="text-xs text-[#64748B] dark:text-zinc-400 mt-0.5">
                  {t.results.docNumber}: <span className="font-mono text-[#172033] dark:text-zinc-200">{scan.maskedIdentifier}</span>
                </p>

                <p className="text-xs text-[#172033]/80 dark:text-zinc-300 mt-3 line-clamp-2 leading-relaxed">
                  {scan.verdict} {scan.summary}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-[#D8B9AE]/50 dark:border-zinc-800 flex items-center justify-between">
                <span className="text-[11px] text-[#64748B] dark:text-zinc-400 font-mono">
                  {new Date(scan.timestamp).toLocaleDateString()}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => navigate(`/results/${scan.id}`)}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-zinc-800 text-[#172033] dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 border border-[#D8B9AE]/80 dark:border-zinc-700 cursor-pointer shadow-2xs transition-colors"
                  >
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3 text-[#0F766E]" />
                      {t.common.viewDetails}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownload(scan.id, scan.documentType)}
                    className="px-3 py-1 rounded-lg text-xs font-semibold bg-[#B4233C] text-white hover:bg-[#8F1A2E] flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                  >
                    <Download className="w-3 h-3" />
                    <span>{t.results.downloadAuditReport}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

