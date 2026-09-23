import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Search } from 'lucide-react';
import { historyService } from '../../services/historyService';
import { ScanResult } from '../../types';
import { RiskBadge } from '../../components/common/RiskBadge';
import { useTranslation } from '../../contexts/I18nContext';

export const AdminIdentityVerificationPage: React.FC = () => {
  const [identityScans, setIdentityScans] = useState<ScanResult[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedScan, setSelectedScan] = useState<ScanResult | null>(null);

  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const allScans = historyService.getScans();
    const idDocs = allScans.filter(s => s.documentCategory === 'identity');
    setIdentityScans(idDocs);
    if (idDocs.length > 0) {
      setSelectedScan(idDocs[0]);
    }
  }, []);

  const filtered = identityScans.filter(
    s =>
      s.documentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.maskedIdentifier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
          {t.admin.identityTitle}
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Admin compliance inspection for government identity documents (Aadhaar, PAN, Passport, Driving Licence)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Identity Document Scans Table */}
        <div className="lg:col-span-7 bg-linear-to-b from-white to-slate-50/50 dark:from-[#1A1D21] dark:to-slate-900/40 rounded-2xl border border-zinc-200/80 dark:border-[#30343B] overflow-hidden shadow-xs interactive-card">
          <div className="p-4 border-b border-zinc-200/80 dark:border-zinc-800">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder={t.history.searchPlaceholder}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-50/80 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-[#30343B] text-zinc-400 uppercase font-semibold">
                  <th className="py-3 px-4">{t.history.docName}</th>
                  <th className="py-3 px-3">{t.results.docNumber}</th>
                  <th className="py-3 px-3">{t.results.qrBarcodeFound}</th>
                  <th className="py-3 px-3">{t.results.riskLevel}</th>
                  <th className="py-3 px-4 text-right">{t.common.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/70 dark:divide-zinc-800/80">
                {filtered.map(item => (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedScan(item)}
                    className={`hover:bg-teal-50/40 dark:hover:bg-teal-950/20 cursor-pointer transition-colors ${
                      selectedScan?.id === item.id ? 'bg-teal-500/10 dark:bg-teal-500/15' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <p className="font-bold text-zinc-900 dark:text-white">{item.documentType}</p>
                      <p className="font-mono text-[10px] text-zinc-400">{item.id}</p>
                    </td>
                    <td className="py-3 px-3 font-mono font-medium">{item.maskedIdentifier}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 font-medium ${
                          item.qrResult?.status === 'passed'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : item.qrResult?.status === 'failed'
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-zinc-400'
                        }`}
                      >
                        {item.qrResult?.status === 'passed'
                          ? '✓ Valid'
                          : item.qrResult?.status === 'failed'
                          ? '✕ Mismatch'
                          : '– N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <RiskBadge level={item.riskLevel} score={item.riskScore} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-xs font-semibold text-[#B02A3A]">{t.common.viewDetails}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Deep Inspection Details */}
        <div className="lg:col-span-5 bg-linear-to-b from-white to-slate-50/50 dark:from-[#1A1D21] dark:to-slate-900/40 rounded-2xl border border-zinc-200/80 dark:border-[#30343B] p-6 shadow-xs interactive-card">
          {selectedScan ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200/80 dark:border-zinc-800">
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                    {selectedScan.documentType}
                  </h3>
                  <p className="text-xs font-mono text-zinc-400">{selectedScan.id}</p>
                </div>
                <RiskBadge level={selectedScan.riskLevel} score={selectedScan.riskScore} size="md" />
              </div>

              {/* Extracted Details */}
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  {t.results.ocrExtracted}
                </p>
                <div className="p-3 bg-white/80 dark:bg-zinc-900/50 rounded-xl border border-zinc-200/60 dark:border-zinc-800 space-y-2 text-xs">
                  {selectedScan.extractedFields.map((f, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-zinc-500">{f.label}:</span>
                      <span className="font-mono font-semibold text-zinc-900 dark:text-white">
                        {f.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* QR Code cross validation */}
              <div className="p-3 bg-white/80 dark:bg-zinc-900/50 rounded-xl border border-zinc-200/60 dark:border-zinc-800 space-y-1.5 text-xs">
                <p className="text-[11px] font-bold uppercase text-zinc-400">{t.results.qrBarcodeFound}</p>
                <p className="text-zinc-700 dark:text-zinc-300 font-medium">
                  {selectedScan.qrResult?.details || 'No QR / Barcode matrix detected.'}
                </p>
                {selectedScan.qrResult?.extractedText && (
                  <p className="font-mono text-[10px] text-zinc-500 break-all">
                    {selectedScan.qrResult.extractedText}
                  </p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => navigate(`/results/${selectedScan.id}`)}
                  className="w-full py-2.5 rounded-xl bg-[#B02A3A] text-white text-xs font-bold hover:bg-[#852336] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Eye className="w-4 h-4" />
                  <span>{t.common.viewDetails}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-zinc-400 text-xs">
              Select an identity document on the left to inspect details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

