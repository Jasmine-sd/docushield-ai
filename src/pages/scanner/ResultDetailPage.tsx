import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Printer,
  Download,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  History,
  LayoutDashboard,
  HelpCircle,
  FileSearch,
  ShieldAlert,
  Loader2,
} from 'lucide-react';
import { ScanResult, DocumentIssue } from '../../types';
import { RiskBadge } from '../../components/common/RiskBadge';
import { QRBarcodeCard } from '../../components/common/QRBarcodeCard';
import { DocumentViewer } from '../../components/common/DocumentViewer';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../contexts/I18nContext';
import { apiClient } from '../../services/apiClient';
import { historyService, auditService } from '../../services/historyService';
import { validateAndNormalizeScanResponse, normalizeScanResult } from '../../services/scanValidation';
import { imageStore } from '../../services/imageStore';

type ScanDisplayState =
  | 'loading'
  | 'missing_id'
  | 'processing'
  | 'completed'
  | 'requires_review'
  | 'failed'
  | 'not_found'
  | 'unauthorized'
  | 'server_error';

export const ResultDetailPage: React.FC = () => {
  const { scanId } = useParams<{ scanId: string }>();
  const [displayState, setDisplayState] = useState<ScanDisplayState>('loading');
  const [scan, setScan] = useState<ScanResult | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<DocumentIssue | null>(null);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [userCorrectedType, setUserCorrectedType] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Processing state variables
  const [processingProgress, setProcessingProgress] = useState(45);
  const [processingStage, setProcessingStage] = useState('Running OCR & forensic vision engine...');

  const { showToast } = useToast();
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchScanResult = async (id: string) => {
    setDisplayState('loading');
    setErrorMessage(null);

    try {
      const res = await apiClient.get<unknown>(`/scans/${id}`);

      // Log API response in dev mode as requested
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[DOCUSENTRY DEV] GET /api/v1/scans/${id} response:`, res);
      }

      if (res.status === 401) {
        setDisplayState('unauthorized');
        setErrorMessage('Authentication token expired or invalid.');
        return;
      }

      if (res.status === 404 || (!res.success && res.status !== 200)) {
        // Check local storage history fallback
        const localScan = historyService.getScanById(id);
        if (localScan) {
          try {
            const normalizedLocal = normalizeScanResult(localScan);
            setScan(normalizedLocal);
            setSelectedIssue(normalizedLocal.findings?.[0] || null);
            setDisplayState(normalizedLocal.reviewStatus === 'pending' ? 'requires_review' : 'completed');
            return;
          } catch (e) {
            console.warn('Local scan fallback normalization error:', e);
          }
        }
        setDisplayState('not_found');
        setErrorMessage(`Scan record "${id}" was not found.`);
        return;
      }

      const payload = res.data ?? res;
      const result = validateAndNormalizeScanResponse(payload);

      if (result.status === 'processing') {
        setDisplayState('processing');
        if (result.processingInfo) {
          setProcessingProgress(result.processingInfo.progress || 45);
          setProcessingStage(result.processingInfo.stage || 'OCR & Forensic processing...');
        }
        startStatusPolling(id);
        return;
      }

      if (result.status === 'failed') {
        setDisplayState('failed');
        setErrorMessage(result.error || 'Document analysis could not be completed.');
        return;
      }

      if (result.status === 'invalid' || !result.scan) {
        setDisplayState('failed');
        setErrorMessage(result.error || 'Verification result is incomplete or invalid.');
        return;
      }

      const validScan = result.scan;
      setScan(validScan);
      setSelectedIssue(validScan.findings?.[0] || null);

      // Update local history cache
      historyService.saveScan(validScan);

      if (result.status === 'requires_review' || validScan.reviewStatus === 'pending' || validScan.riskLevel === 'uncertain') {
        setDisplayState('requires_review');
      } else {
        setDisplayState('completed');
      }
    } catch (err: any) {
      console.error('Error fetching scan result:', err);
      // Fallback check in local history
      const localScan = historyService.getScanById(id);
      if (localScan) {
        try {
          const normalizedLocal = normalizeScanResult(localScan);
          setScan(normalizedLocal);
          setSelectedIssue(normalizedLocal.findings?.[0] || null);
          setDisplayState('completed');
          return;
        } catch (e) {
          console.warn('Local fallback error:', e);
        }
      }
      setDisplayState('server_error');
      setErrorMessage(err.message || 'Backend service unavailable. Could not fetch scan result.');
    }
  };

  const startStatusPolling = (id: string) => {
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);

    let attempts = 0;
    pollTimerRef.current = setInterval(async () => {
      attempts++;
      if (attempts > 15) { // 30 seconds max
        if (pollTimerRef.current) clearInterval(pollTimerRef.current);
        setDisplayState('failed');
        setErrorMessage('Scan processing timed out. Please try scanning again.');
        return;
      }

      try {
        const statusRes = await apiClient.get<{ status: string; progress?: number; stage?: string }>(`/scans/${id}/status`);
        if (statusRes.success && statusRes.data) {
          const { status, progress, stage } = statusRes.data;
          setProcessingProgress(progress || attempts * 10);
          if (stage) setProcessingStage(stage);

          if (status === 'completed' || status === 'requires_review' || status === 'failed') {
            if (pollTimerRef.current) clearInterval(pollTimerRef.current);
            fetchScanResult(id);
          }
        }
      } catch (err) {
        console.warn('Polling status warning:', err);
      }
    }, 2000);
  };

  useEffect(() => {
    if (!scanId || scanId.trim() === '' || scanId === 'undefined' || scanId === 'null') {
      setDisplayState('missing_id');
      return;
    }

    fetchScanResult(scanId);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [scanId]);

  const handlePrint = () => {
    if (!scan) return;
    window.print();
    auditService.logAction({
      actor: user?.name || 'User',
      role: user?.role || 'user',
      action: 'Report Printed',
      referenceId: scan.id,
      resultSummary: `Printed report for ${scan.documentType || 'document'}.`,
    });
  };

  const handleDownloadReport = async () => {
    if (!scan) return;
    showToast(t.results.downloadAuditReport, 'Preparing official DOCUSENTRY audit report...', 'success');
    try {
      const response = await fetch(`/api/v1/scans/${scan.id}/report`);
      if (!response.ok) throw new Error('Failed to generate report PDF');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `DOCUSENTRY_Report_${scan.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      auditService.logAction({
        actor: user?.name || 'User',
        role: user?.role || 'user',
        action: 'Report Downloaded',
        referenceId: scan.id,
        resultSummary: `Downloaded PDF audit report for ${scan.documentType || 'document'}.`,
      });
    } catch (err: any) {
      showToast('Download Error', 'Could not download PDF report.', 'error');
    }
  };

  const handleCorrectType = (newType: string) => {
    if (!scan) return;
    const updated: ScanResult = { ...scan, documentType: newType, identifiedByUser: true };
    historyService.saveScan(updated);
    setScan(updated);
    setUserCorrectedType(false);
    showToast('Type Updated', `Document type corrected to ${newType}.`, 'success');
  };

  // ==========================================
  // STATE SCREEN RENDERING
  // ==========================================

  if (displayState === 'loading') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center space-y-4">
        <Loader2 className="w-10 h-10 text-[#B02A3A] animate-spin" />
        <div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Retrieving Document Analysis</h3>
          <p className="text-xs text-zinc-500 mt-1">Fetching scan records and forensic inspection data...</p>
        </div>
      </div>
    );
  }

  if (displayState === 'missing_id') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-[#1A1D21] border border-zinc-200 dark:border-[#30343B] text-center space-y-5 shadow-lg">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Scan ID is missing</h2>
            <p className="text-xs text-zinc-500 mt-1">
              Please select a document scan from History or perform a new scan.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              to="/scanner"
              className="px-4 py-2.5 rounded-xl bg-[#B02A3A] text-white text-xs font-bold hover:bg-[#852336] transition-all"
            >
              Back to Scanner
            </Link>
            <Link
              to="/history"
              className="px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold hover:bg-zinc-200"
            >
              Scan History
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (displayState === 'not_found') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-[#1A1D21] border border-zinc-200 dark:border-[#30343B] text-center space-y-5 shadow-lg">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 flex items-center justify-center mx-auto">
            <FileSearch className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Scan Result Not Found</h2>
            <p className="text-xs text-zinc-500 mt-1">
              {errorMessage || `The document scan "${scanId}" could not be located in the system.`}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              to="/scanner"
              className="px-4 py-2.5 rounded-xl bg-[#B02A3A] text-white text-xs font-bold hover:bg-[#852336]"
            >
              Back to Scanner
            </Link>
            <Link
              to="/history"
              className="px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold hover:bg-zinc-200"
            >
              Scan History
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (displayState === 'unauthorized') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-[#1A1D21] border border-zinc-200 dark:border-[#30343B] text-center space-y-5 shadow-lg">
          <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Authentication Required</h2>
            <p className="text-xs text-zinc-500 mt-1">
              You must be logged in to access this document scan record.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              to="/user/login"
              className="px-5 py-2.5 rounded-xl bg-[#B02A3A] text-white text-xs font-bold hover:bg-[#852336]"
            >
              Log In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (displayState === 'server_error' || displayState === 'failed') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-[#1A1D21] border border-rose-200 dark:border-rose-900/60 text-center space-y-5 shadow-lg">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-[#B02A3A] dark:text-rose-300 flex items-center justify-center mx-auto">
            <XCircle className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Document Analysis Failed</h2>
            <p className="text-xs text-zinc-500 mt-1">
              {errorMessage || 'Something went wrong while processing or retrieving this scan result.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            {scanId && (
              <button
                type="button"
                onClick={() => fetchScanResult(scanId)}
                className="px-4 py-2.5 rounded-xl bg-[#B02A3A] text-white text-xs font-bold hover:bg-[#852336] flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Analysis</span>
              </button>
            )}
            <Link
              to="/scanner"
              className="px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold hover:bg-zinc-200"
            >
              Back to Scanner
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (displayState === 'processing') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-[#1A1D21] border border-zinc-200 dark:border-[#30343B] text-center space-y-6 shadow-lg">
          <div className="w-16 h-16 rounded-full border-4 border-[#B02A3A]/20 border-t-[#B02A3A] animate-spin mx-auto flex items-center justify-center">
            <Loader2 className="w-7 h-7 text-[#B02A3A]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Analyzing Document...</h2>
            <p className="text-xs text-zinc-500 mt-1">Your document is currently being processed by the forensic vision engine.</p>
          </div>
          <div className="space-y-2 text-left">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-zinc-600 dark:text-zinc-400">{processingStage}</span>
              <span className="text-[#B02A3A] font-mono">{processingProgress}%</span>
            </div>
            <div className="w-full h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#B02A3A] transition-all duration-300 rounded-full"
                style={{ width: `${processingProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!scan) {
    return null;
  }

  // Safe variables extracted safely
  const extractedFields = scan.extractedFields ?? [];
  const checks = scan.checks ?? [];
  const findings = scan.findings ?? [];
  const qrResult = scan.qrResult ?? null;
  const riskScore = scan.riskScore; // Can be number or null
  const riskLevel = scan.riskLevel || 'uncertain';
  const verdict = scan.verdict || 'Unable to determine authenticity';
  const summary = scan.summary || 'Analysis details unavailable.';
  const docType = scan.documentType || 'Document';
  const maskedId = scan.maskedIdentifier || 'XXXX-****';

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Navigation and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link
          to={user?.role === 'admin' ? '/admin/dashboard' : '/dashboard'}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.nav.dashboard}</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadReport}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#B02A3A] text-white hover:bg-[#852336] shadow-xs flex items-center gap-2 cursor-pointer transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t.results.downloadAuditReport}</span>
          </button>
        </div>
      </div>

      {/* Optional Manual Review Notice Banner */}
      {displayState === 'requires_review' && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <div className="text-xs">
            <p className="font-bold text-amber-900 dark:text-amber-200">Manual Review Recommended</p>
            <p className="text-amber-700 dark:text-amber-300">
              This document contains visual anomalies or uncertain fields. Secondary human verification is recommended.
            </p>
          </div>
        </div>
      )}

      {/* Top Header Result Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#F8F4F2] dark:bg-[#1A1D21] border border-[#D8B9AE] dark:border-[#30343B] shadow-xs interactive-card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-zinc-200/80 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className="text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-md">
                {scan.id}
              </span>
              <RiskBadge level={riskLevel} score={riskScore !== null ? riskScore : undefined} size="lg" />
              {scan.identifiedByUser && (
                <span className="text-[11px] font-medium text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/80 px-2 py-0.5 rounded-md">
                  User Verified
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
                {docType}
              </h1>
              <button
                type="button"
                onClick={() => setUserCorrectedType(!userCorrectedType)}
                className="text-xs text-[#B02A3A] dark:text-rose-400 hover:underline font-semibold cursor-pointer"
              >
                Change Type
              </button>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              {t.results.docNumber}: <span className="font-mono font-semibold">{maskedId}</span> • {t.history.dateScanned}: {scan.timestamp ? new Date(scan.timestamp).toLocaleString() : 'Recent'}
            </p>

            {/* Type Correction Quick Dropdown */}
            {userCorrectedType && (
              <div className="mt-3 p-3 bg-zinc-50 dark:bg-zinc-800/80 rounded-xl border border-zinc-200 dark:border-zinc-700 max-w-md">
                <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                  Select Document Type:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {['PAN Card', 'Aadhaar Card', 'Passport', 'Driving Licence', 'Degree Certificate', 'Marksheet', 'Experience Certificate'].map(tType => (
                    <button
                      key={tType}
                      type="button"
                      onClick={() => handleCorrectType(tType)}
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-700 text-xs text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-600 hover:border-[#B02A3A] cursor-pointer"
                    >
                      {tType}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Risk Score Metric Gauge */}
          <div className="flex items-center gap-4 bg-zinc-50/80 dark:bg-zinc-900/60 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shrink-0">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                {t.results.riskLevel}
              </p>
              <p className="text-3xl font-black text-zinc-900 dark:text-white mt-0.5">
                {riskScore !== null ? (
                  <>
                    {riskScore} <span className="text-xs font-normal text-zinc-400">/ 100</span>
                  </>
                ) : (
                  <span className="text-sm font-semibold text-amber-600">Pending</span>
                )}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full border-4 border-zinc-200 dark:border-zinc-700 flex items-center justify-center font-bold text-xs">
              {riskLevel === 'low' ? '✓' : riskLevel === 'high' ? '!' : '⚠'}
            </div>
          </div>
        </div>

        {/* Verdict & Summary Callout */}
        <div className="mt-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
            {t.results.verdictLabel}
          </h3>
          <p className="text-base font-semibold text-zinc-900 dark:text-white">
            {verdict}
          </p>
          <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-1 leading-relaxed">
            {summary}
          </p>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Interactive Document Canvas Viewer */}
        <div className="lg:col-span-7 space-y-6">
          <DocumentViewer
            documentType={docType}
            fileName={scan.fileName || 'document_scan.jpg'}
            imageUrl={scan.fileUrl || (scanId ? imageStore.getImage(scanId) : null) || (scan.fileName ? imageStore.getImage(scan.fileName) : null)}
            findings={findings}
            selectedIssueId={selectedIssue?.id}
            onSelectIssue={issue => setSelectedIssue(issue)}
          />

          {/* QR / Barcode Card */}
          <QRBarcodeCard data={qrResult} />
        </div>

        {/* Right Column: Explainable AI Findings & Check Results */}
        <div className="lg:col-span-5 space-y-6">
          {/* Selected Finding Deep Inspection Card */}
          {selectedIssue ? (
            <div className="p-6 rounded-2xl bg-white dark:bg-[#1A1D21] border-2 border-rose-300 dark:border-rose-900/60 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-200 uppercase">
                  {t.results.tamperAnalysis} #{findings.findIndex(f => f.id === selectedIssue.id) + 1}
                </span>
                <span className="text-xs font-semibold text-zinc-500">
                  Confidence: {selectedIssue.confidence || 'Medium'}
                </span>
              </div>

              <h4 className="text-base font-bold text-zinc-900 dark:text-white">
                {selectedIssue.title || 'Anomaly Detected'}
              </h4>

              <div className="space-y-3 text-xs text-zinc-700 dark:text-zinc-300">
                <div>
                  <span className="font-semibold text-zinc-500 uppercase text-[10px] block">
                    Region
                  </span>
                  <p className="mt-0.5 font-medium">{selectedIssue.location || 'Document Surface'}</p>
                </div>

                <div>
                  <span className="font-semibold text-zinc-500 uppercase text-[10px] block">
                    Observation
                  </span>
                  <p className="mt-0.5 leading-relaxed">{selectedIssue.description || 'Discrepancy detected.'}</p>
                </div>

                <div>
                  <span className="font-semibold text-zinc-500 uppercase text-[10px] block">
                    Security Impact
                  </span>
                  <p className="mt-0.5 leading-relaxed text-amber-800 dark:text-amber-300">
                    {selectedIssue.whyItMatters || 'Authentic documents maintain standard parameters.'}
                  </p>
                </div>

                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/80 rounded-xl border border-zinc-200 dark:border-zinc-700">
                  <span className="font-semibold text-zinc-500 uppercase text-[10px] block">
                    Recommended Action
                  </span>
                  <p className="mt-0.5 font-medium text-[#B02A3A] dark:text-rose-300">
                    {selectedIssue.recommendedAction || 'Inspect original physical document.'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-white dark:bg-[#1A1D21] border border-zinc-200 dark:border-[#30343B] text-center text-zinc-500 text-sm">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                {t.results.noAnomalies}
              </p>
              <p className="text-xs mt-1 text-zinc-500">
                {t.dashboard.allSystemsOperational}
              </p>
            </div>
          )}

          {/* All Checks Summary List */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#1A1D21] border border-zinc-200 dark:border-[#30343B] shadow-xs">
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white mb-3 flex items-center justify-between">
              <span>{t.results.tamperAnalysis}</span>
              <span className="text-xs text-zinc-500 font-normal">
                {checks.filter(c => c.status === 'passed').length} / {checks.length} Passed
              </span>
            </h4>

            <div className="space-y-2">
              {checks.map((check, idx) => (
                <div
                  key={check.id || `chk_${idx}`}
                  className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/80 flex items-start gap-2.5 text-xs"
                >
                  {check.status === 'passed' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  ) : check.status === 'warning' ? (
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  )}

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100">{check.name}</p>
                      <span className="text-[10px] text-zinc-500">Conf: {check.confidence || 'High'}</span>
                    </div>
                    <p className="text-zinc-600 dark:text-zinc-400 mt-0.5 leading-normal">
                      {check.summary || check.details || 'Verification check executed.'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Extracted Fields Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#1A1D21] border border-zinc-200 dark:border-[#30343B] shadow-xs">
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white mb-3">
              {t.results.ocrExtracted}
            </h4>
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800 text-xs">
              {extractedFields.map((field, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between gap-2">
                  <span className="text-zinc-500 dark:text-zinc-400">{field.label}</span>
                  <span
                    className={`font-semibold font-mono text-right ${
                      field.suspicious
                        ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950 px-2 py-0.5 rounded'
                        : 'text-zinc-900 dark:text-white'
                    }`}
                  >
                    {field.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Technical Details Accordion */}
      <div className="bg-white dark:bg-[#1A1D21] rounded-2xl border border-zinc-200 dark:border-[#30343B] overflow-hidden">
        <button
          type="button"
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          className="w-full p-4 flex items-center justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
        >
          <span>Diagnostics & Forensic Metadata</span>
          {showTechnicalDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showTechnicalDetails && (
          <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 text-xs font-mono space-y-2 text-zinc-700 dark:text-zinc-300">
            <p><strong>SCAN_ID:</strong> {scan.id}</p>
            <p><strong>DOCUMENT_TYPE:</strong> {docType}</p>
            <p><strong>SCANNER_BUILD:</strong> DOCUSENTRY-ENGINE v4.2.0-RELEASE (AI Studio)</p>
            <p><strong>IDENTIFICATION_CONFIDENCE:</strong> {scan.identificationConfidence || 'High'}</p>
            <p><strong>PRIVACY_DIRECTIVE:</strong> Section 29A Redaction Enforced ({maskedId})</p>
          </div>
        )}
      </div>
    </div>
  );
};
