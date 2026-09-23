import React from 'react';
import { QrCode, CheckCircle2, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';
import { QRBarcodeResult } from '../../types';

interface QRBarcodeCardProps {
  data?: QRBarcodeResult | null;
}

export const QRBarcodeCard: React.FC<QRBarcodeCardProps> = ({ data }) => {
  if (!data || !data.detected) {
    return (
      <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-white dark:bg-zinc-800 shadow-xs border border-zinc-200 dark:border-zinc-700">
            <QrCode className="w-5 h-5 text-zinc-400" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              QR Code & Barcode Matrix
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              No embedded 2D matrix or barcode detected in scan.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusVisual = () => {
    switch (data.status) {
      case 'passed':
        return {
          icon: CheckCircle2,
          color: 'text-emerald-600 dark:text-emerald-400',
          bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
          badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          color: 'text-amber-600 dark:text-amber-400',
          bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
          badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200',
        };
      case 'failed':
        return {
          icon: XCircle,
          color: 'text-rose-600 dark:text-rose-400',
          bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800',
          badge: 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200',
        };
      default:
        return {
          icon: HelpCircle,
          color: 'text-zinc-500 dark:text-zinc-400',
          bg: 'bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800',
          badge: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
        };
    }
  };

  const visual = getStatusVisual();
  const Icon = visual.icon;

  return (
    <div className={`p-4 rounded-xl border transition-all duration-200 ${visual.bg}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-white dark:bg-zinc-800 shadow-xs border border-zinc-200 dark:border-zinc-700">
            <QrCode className="w-5 h-5 text-[#B02A3A]" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              QR Code & Barcode Verification
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {data.type ? `Encoding: ${data.type}` : 'Optical Machine-Readable Data'}
            </p>
          </div>
        </div>

        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${visual.badge}`}>
          <Icon className="w-3.5 h-3.5" />
          <span>{data.statusLabel || 'Verified'}</span>
        </span>
      </div>

      {data.details && (
        <div className="mt-3 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
          {data.details}
        </div>
      )}

      {data.extractedText && (
        <div className="mt-3 p-2.5 rounded-lg bg-white/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800">
          <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
            Decoded Payload Data
          </p>
          <p className="font-mono text-xs text-zinc-800 dark:text-zinc-200 break-all select-all">
            {data.extractedText}
          </p>
        </div>
      )}
    </div>
  );
};
