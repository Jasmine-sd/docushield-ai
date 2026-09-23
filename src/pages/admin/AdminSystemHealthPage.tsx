import React from 'react';
import { Activity, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '../../contexts/I18nContext';

export const AdminSystemHealthPage: React.FC = () => {
  const { t } = useTranslation();

  const services = [
    { name: 'Universal Document Ingestion Pipeline', status: 'Operational', latency: '42ms', uptime: '99.98%' },
    { name: 'Optical Character Recognition (OCR Engine)', status: 'Operational', latency: '128ms', uptime: '99.95%' },
    { name: 'QR & 2D Barcode Decoder Suite', status: 'Operational', latency: '35ms', uptime: '100%' },
    { name: 'Forensic Tampering & ELA Analysis Engine', status: 'Operational', latency: '210ms', uptime: '99.92%' },
    { name: 'Demographic Masking & Privacy Guard', status: 'Operational', latency: '12ms', uptime: '100%' },
    { name: 'Encrypted Audit Log Datastore', status: 'Operational', latency: '24ms', uptime: '100%' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Activity className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            {t.nav.systemHealth}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
          {t.nav.systemHealth}
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Real-time availability, latency telemetry, and operational readiness across scanner services.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 shadow-xs interactive-card">
          <span className="text-xs text-zinc-400 font-semibold uppercase">Overall Status</span>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">All Systems Operational</span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">0 active incidents reported</p>
        </div>

        <div className="p-5 rounded-2xl bg-teal-500/5 dark:bg-teal-500/10 border border-teal-500/20 shadow-xs interactive-card">
          <span className="text-xs text-zinc-400 font-semibold uppercase">Average Processing Time</span>
          <p className="text-xl font-extrabold text-zinc-900 dark:text-white mt-2">1.84s</p>
          <p className="text-[11px] text-zinc-400 mt-1">Full 5-stage inspection workflow</p>
        </div>

        <div className="p-5 rounded-2xl bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20 shadow-xs interactive-card">
          <span className="text-xs text-zinc-400 font-semibold uppercase">Datastore Integrity</span>
          <p className="text-xl font-extrabold text-zinc-900 dark:text-white mt-2">100% Synced</p>
          <p className="text-[11px] text-zinc-400 mt-1">Local & Cloud replica consistency</p>
        </div>
      </div>

      {/* Services List */}
      <div className="bg-linear-to-b from-white to-slate-50/50 dark:from-[#1A1D21] dark:to-slate-900/40 rounded-2xl border border-zinc-200/80 dark:border-[#30343B] overflow-hidden shadow-xs interactive-card">
        <div className="p-5 border-b border-zinc-200/80 dark:border-zinc-800">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
            Core Service Availability
          </h3>
        </div>

        <div className="divide-y divide-zinc-200/70 dark:divide-zinc-800/80">
          {services.map(svc => (
            <div
              key={svc.name}
              className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition-colors"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="font-semibold text-zinc-900 dark:text-white">{svc.name}</span>
              </div>

              <div className="flex items-center gap-6 text-zinc-500 font-mono text-[11px] self-end sm:self-auto">
                <span>Latency: {svc.latency}</span>
                <span>Uptime: {svc.uptime}</span>
                <span className="font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                  {svc.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

