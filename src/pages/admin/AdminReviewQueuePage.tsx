import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Inbox, CheckCircle2, AlertTriangle, MessageSquare, Eye, Filter } from 'lucide-react';
import { historyService } from '../../services/historyService';
import { ScanResult, ReviewStatus } from '../../types';
import { RiskBadge } from '../../components/common/RiskBadge';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';

export const AdminReviewQueuePage: React.FC = () => {
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [activeReviewScan, setActiveReviewScan] = useState<ScanResult | null>(null);
  const [reviewNote, setReviewNote] = useState('');

  const { showToast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const loadData = () => {
    setScans(historyService.getScans());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = (status: ReviewStatus) => {
    if (!activeReviewScan) return;
    const updated = historyService.updateReviewStatus(
      activeReviewScan.id,
      status,
      user?.name || 'Compliance Officer',
      reviewNote
    );

    if (updated) {
      loadData();
      setActiveReviewScan(updated);
      setReviewNote('');
      showToast('Status Updated', `Document ${activeReviewScan.id} marked as ${status}.`, 'success');
    }
  };

  const filtered = scans.filter(s => {
    if (filterStatus === 'ALL') return true;
    return (s.reviewStatus || 'pending') === filterStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
            Compliance Review Queue
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Examine flagged scans, assign reviewer decisions, and record compliance case notes
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 rounded-xl text-xs border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
          >
            <option value="ALL">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_review">In Review</option>
            <option value="reviewed">Reviewed</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Review Queue Table */}
        <div className="lg:col-span-7 bg-white dark:bg-[#1A1D21] rounded-2xl border border-zinc-200 dark:border-[#30343B] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-[#30343B] text-zinc-400 uppercase font-semibold">
                  <th className="py-3 px-4">Document</th>
                  <th className="py-3 px-3">Reason / Anomaly</th>
                  <th className="py-3 px-3">Risk</th>
                  <th className="py-3 px-3">Review Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {filtered.map(scan => (
                  <tr
                    key={scan.id}
                    onClick={() => setActiveReviewScan(scan)}
                    className={`hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors ${
                      activeReviewScan?.id === scan.id ? 'bg-[#AD343E]/5 dark:bg-[#AD343E]/10' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-zinc-900 dark:text-white">{scan.documentType}</p>
                      <p className="font-mono text-[10px] text-zinc-400">{scan.id}</p>
                    </td>
                    <td className="py-3.5 px-3 max-w-[180px] truncate text-zinc-600 dark:text-zinc-300">
                      {scan.findings[0]?.title || scan.verdict}
                    </td>
                    <td className="py-3.5 px-3">
                      <RiskBadge level={scan.riskLevel} score={scan.riskScore} size="sm" />
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="capitalize px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium text-[11px]">
                        {scan.reviewStatus || 'pending'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="text-xs font-semibold text-[#AD343E]">Review →</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Panel for Selected Document */}
        <div className="lg:col-span-5 bg-white dark:bg-[#1A1D21] rounded-2xl border border-zinc-200 dark:border-[#30343B] p-6 shadow-xs">
          {activeReviewScan ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                    {activeReviewScan.documentType}
                  </h3>
                  <p className="text-xs font-mono text-zinc-400">{activeReviewScan.id}</p>
                </div>
                <RiskBadge
                  level={activeReviewScan.riskLevel}
                  score={activeReviewScan.riskScore}
                  size="md"
                />
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase text-zinc-400">Verdict</span>
                <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5">
                  {activeReviewScan.verdict}
                </p>
                <p className="text-xs text-zinc-500 mt-1">{activeReviewScan.summary}</p>
              </div>

              {/* Existing review notes if any */}
              {activeReviewScan.adminNotes && activeReviewScan.adminNotes.length > 0 && (
                <div className="p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl space-y-1.5 text-xs">
                  <span className="text-[10px] font-bold uppercase text-zinc-400">
                    Audit Notes History:
                  </span>
                  {activeReviewScan.adminNotes.map((n, i) => (
                    <p key={i} className="text-zinc-600 dark:text-zinc-300 font-mono text-[11px]">
                      • {n}
                    </p>
                  ))}
                </div>
              )}

              {/* Add Note Input */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase text-zinc-400">
                  Add Compliance Note
                </label>
                <textarea
                  rows={2}
                  value={reviewNote}
                  onChange={e => setReviewNote(e.target.value)}
                  placeholder="e.g. Verified via secondary database; false positive compression artifact..."
                  className="w-full p-2.5 rounded-xl text-xs border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#AD343E]"
                />
              </div>

              {/* Status Update Buttons */}
              <div className="pt-2 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleUpdateStatus('in_review')}
                  className="py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Mark In Review
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus('reviewed')}
                  className="py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                >
                  Approve / Pass
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus('dismissed')}
                  className="py-2 rounded-xl border border-rose-300 text-rose-700 dark:text-rose-300 text-xs font-bold hover:bg-rose-50 dark:hover:bg-rose-950/40"
                >
                  Dismiss / Reject
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/results/${activeReviewScan.id}`)}
                  className="py-2 rounded-xl bg-[#AD343E] hover:bg-[#922831] text-white text-xs font-bold"
                >
                  Full Forensic View
                </button>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center text-xs text-zinc-400">
              Select a document from the queue to review.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
