import React, { useState, useEffect } from 'react';
import { FileClock, Search } from 'lucide-react';
import { auditService } from '../../services/historyService';
import { AuditLog } from '../../types';
import { useTranslation } from '../../contexts/I18nContext';

export const AdminAuditHistoryPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    setLogs(auditService.getLogs());
  }, []);

  const filtered = logs.filter(
    l =>
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.actor.toLowerCase().includes(search.toLowerCase()) ||
      (l.referenceId && l.referenceId.toLowerCase().includes(search.toLowerCase())) ||
      l.resultSummary.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <FileClock className="w-4 h-4 text-[#B02A3A]" />
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            {t.admin.auditLogTitle}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
          {t.admin.auditLogTitle}
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Chronological record of document uploads, risk flags, status updates, and reports exported.
        </p>
      </div>

      <div className="bg-linear-to-b from-white to-slate-50/50 dark:from-[#1A1D21] dark:to-slate-900/40 p-4 rounded-2xl border border-zinc-200/80 dark:border-[#30343B] interactive-card">
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t.history.searchPlaceholder}
            className="w-full pl-10 pr-3.5 py-2 text-xs sm:text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none"
          />
        </div>
      </div>

      <div className="bg-linear-to-b from-white to-slate-50/30 dark:from-[#1A1D21] dark:to-slate-900/30 rounded-2xl border border-zinc-200/80 dark:border-[#30343B] overflow-hidden shadow-xs interactive-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-50/80 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-[#30343B] text-zinc-400 uppercase font-semibold">
                <th className="py-3.5 px-5">{t.history.dateScanned}</th>
                <th className="py-3.5 px-4">{t.profile.fullName}</th>
                <th className="py-3.5 px-4">{t.profile.role}</th>
                <th className="py-3.5 px-4">{t.history.actions}</th>
                <th className="py-3.5 px-4">{t.results.docNumber}</th>
                <th className="py-3.5 px-5">{t.results.tamperAnalysis}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200/70 dark:divide-zinc-800/80">
              {filtered.map(entry => (
                <tr key={entry.id} className="hover:bg-teal-50/30 dark:hover:bg-teal-950/20 transition-colors">
                  <td className="py-3.5 px-5 font-mono text-zinc-500 whitespace-nowrap">
                    {entry.timestamp}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-zinc-900 dark:text-white">
                    {entry.actor}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`uppercase text-[10px] font-bold px-2 py-0.5 rounded ${
                        entry.role === 'admin'
                          ? 'bg-[#B02A3A]/10 text-[#B02A3A] dark:bg-[#B02A3A]/20'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                      }`}
                    >
                      {entry.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-zinc-800 dark:text-zinc-200">
                    {entry.action}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-zinc-500">
                    {entry.referenceId || '–'}
                  </td>
                  <td className="py-3.5 px-5 text-zinc-600 dark:text-zinc-400 leading-normal">
                    {entry.resultSummary}
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

