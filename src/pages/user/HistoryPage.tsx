import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Trash2, ArrowUpDown, Eye, FileText, PlusCircle, RefreshCw } from 'lucide-react';
import { historyService, auditService } from '../../services/historyService';
import { ScanResult } from '../../types';
import { RiskBadge } from '../../components/common/RiskBadge';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../contexts/I18nContext';
import { apiClient } from '../../services/apiClient';
import { normalizeScanHistory } from '../../services/scanValidation';
import { HistoryErrorBoundary } from '../../components/common/HistoryErrorBoundary';

const HistoryPageContent: React.FC = () => {
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterRisk, setFilterRisk] = useState('ALL');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const { showToast } = useToast();
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const loadScans = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await apiClient.get<unknown>('/scans');
      
      if (res.status === 401) {
        setError('Unauthorized access. Please log in again.');
        setLoading(false);
        return;
      }

      let parsedScans: ScanResult[] = [];
      if (res.success && res.data) {
        const normalized = normalizeScanHistory(res.data);
        parsedScans = normalized.scans;
      }

      // Fallback or merge with local history cache
      if (parsedScans.length === 0) {
        const localScans = historyService.getScans();
        if (Array.isArray(localScans) && localScans.length > 0) {
          const normalizedLocal = normalizeScanHistory(localScans);
          parsedScans = normalizedLocal.scans;
        }
      }

      setScans(parsedScans);
    } catch (err: any) {
      console.warn('API error fetching scans, using local storage fallback:', err);
      try {
        const localScans = historyService.getScans();
        const normalizedLocal = normalizeScanHistory(localScans);
        setScans(normalizedLocal.scans);
      } catch (localErr) {
        console.error('Failed to parse local history scans:', localErr);
        setError('Failed to load document history records.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadScans();
  }, [loadScans]);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm(`Delete scan record ${id}?`)) {
      historyService.deleteScan(id);
      setScans(prev => prev.filter(s => s.id !== id));
      showToast(t.common.delete, `Scan ${id} removed from history.`, 'info');
      auditService.logAction({
        actor: user?.name || 'User',
        role: user?.role || 'user',
        action: 'Scan Record Deleted',
        referenceId: id,
        resultSummary: 'Deleted document verification scan.',
      });
    }
  };

  const safeScans = Array.isArray(scans) ? scans : [];

  const filteredScans = safeScans
    .filter(scan => {
      if (!scan) return false;

      const docType = scan.documentType || '';
      const scanId = scan.id || '';
      const maskedId = scan.maskedIdentifier || '';
      const verdictText = scan.verdict || '';

      const matchesSearch =
        docType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scanId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        maskedId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        verdictText.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = filterType === 'ALL' || docType === filterType;

      const riskLevel = (scan.riskLevel || 'uncertain').toLowerCase();
      let matchesRisk = true;
      if (filterRisk !== 'ALL') {
        const targetRisk = filterRisk.toLowerCase();
        if (targetRisk === 'uncertain') {
          matchesRisk = riskLevel === 'uncertain' || scan.riskScore === null;
        } else {
          matchesRisk = riskLevel === targetRisk;
        }
      }

      return matchesSearch && matchesType && matchesRisk;
    })
    .sort((a, b) => {
      const tA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const tB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return sortOrder === 'desc' ? tB - tA : tA - tB;
    });

  const uniqueDocTypes = Array.from(new Set(safeScans.map(s => s?.documentType).filter(Boolean)));

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
            {t.history.title}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {t.history.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={loadScans}
            disabled={loading}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{t.common.refresh}</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/scanner')}
            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-[#B02A3A] hover:bg-[#852336] text-white flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Start a Scan</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-[#F8F4F2] dark:bg-[#1A1D21] p-4 rounded-2xl border border-[#D8B9AE] dark:border-[#30343B] flex flex-col md:flex-row gap-3 interactive-card shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder={t.history.searchPlaceholder}
            className="w-full pl-10 pr-3.5 py-2 rounded-xl text-xs sm:text-sm border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#B02A3A]"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-none"
          >
            <option value="ALL">{t.common.all}</option>
            {uniqueDocTypes.map(tOption => (
              <option key={tOption} value={tOption}>
                {tOption}
              </option>
            ))}
          </select>

          <select
            value={filterRisk}
            onChange={e => setFilterRisk(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-none"
          >
            <option value="ALL">{t.common.all}</option>
            <option value="low">{t.common.lowRisk}</option>
            <option value="medium">{t.common.mediumRisk}</option>
            <option value="high">{t.common.highRisk}</option>
            <option value="uncertain">Uncertain / Unverified</option>
          </select>

          <button
            type="button"
            onClick={() => setSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'))}
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs flex items-center gap-1 cursor-pointer"
            title="Toggle Date Sort Order"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>{sortOrder === 'desc' ? 'Newest' : 'Oldest'}</span>
          </button>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-[#F8F4F2] dark:bg-[#1A1D21] rounded-2xl border border-[#D8B9AE] dark:border-[#30343B] overflow-hidden shadow-2xs interactive-card">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-[#B02A3A] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Loading document verification records...</p>
          </div>
        ) : error ? (
          <div className="py-16 px-4 text-center space-y-4">
            <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">{error}</p>
            <button
              type="button"
              onClick={loadScans}
              className="px-4 py-2 rounded-xl bg-zinc-800 dark:bg-zinc-700 text-white text-xs font-semibold hover:bg-zinc-900 cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : safeScans.length === 0 ? (
          /* Entirely Empty History State */
          <div className="py-16 px-4 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-zinc-200/80 dark:bg-zinc-800/80 flex items-center justify-center mx-auto text-zinc-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-base font-bold text-zinc-900 dark:text-white">
                No documents scanned yet.
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                Upload identity credentials or official documents to perform optical OCR and forensic authenticity scans.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/scanner')}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#B02A3A] hover:bg-[#852336] text-white text-xs font-bold cursor-pointer transition-all shadow-md"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Start a Scan</span>
            </button>
          </div>
        ) : filteredScans.length === 0 ? (
          /* Filtered Out State */
          <div className="py-16 text-center space-y-3">
            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              {t.history.noRecordsFound}
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setFilterType('ALL');
                setFilterRisk('ALL');
              }}
              className="text-xs text-[#B02A3A] dark:text-rose-400 font-semibold hover:underline cursor-pointer"
            >
              {t.common.clear}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-zinc-50/80 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-[#30343B] text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-5">ID</th>
                  <th className="py-3.5 px-4">{t.history.docName}</th>
                  <th className="py-3.5 px-4">{t.common.details}</th>
                  <th className="py-3.5 px-4">{t.common.status}</th>
                  <th className="py-3.5 px-4">{t.common.riskLevel}</th>
                  <th className="py-3.5 px-4">{t.history.dateScanned}</th>
                  <th className="py-3.5 px-5 text-right">{t.common.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/70 dark:divide-zinc-800/80">
                {filteredScans.map(scan => {
                  const findingsCount = Array.isArray(scan.findings) ? scan.findings.length : 0;
                  const formattedDate =
                    scan.timestamp && !isNaN(new Date(scan.timestamp).getTime())
                      ? new Date(scan.timestamp).toLocaleDateString()
                      : 'Recent';

                  return (
                    <tr
                      key={scan.id}
                      onClick={() => navigate(`/results/${scan.id}`)}
                      className="hover:bg-teal-50/30 dark:hover:bg-teal-950/20 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-5 font-mono text-xs font-bold text-zinc-900 dark:text-white">
                        {scan.id}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-zinc-900 dark:text-white text-xs">
                          {scan.documentType || 'Document'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-zinc-600 dark:text-zinc-400">
                        {scan.maskedIdentifier || 'XXXX-****'}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-zinc-700 dark:text-zinc-300 max-w-xs">
                        <div className="font-medium truncate">{scan.verdict || 'Scan completed'}</div>
                        <div className="text-[11px] text-zinc-400">
                          {findingsCount} flagged area{findingsCount === 1 ? '' : 's'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <RiskBadge level={scan.riskLevel || 'uncertain'} score={scan.riskScore} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 text-xs text-zinc-500 font-mono">
                        {formattedDate}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              navigate(`/results/${scan.id}`);
                            }}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer"
                            title="Open Result"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={e => handleDelete(e, scan.id)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 cursor-pointer"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export const HistoryPage: React.FC = () => (
  <HistoryErrorBoundary>
    <HistoryPageContent />
  </HistoryErrorBoundary>
);


