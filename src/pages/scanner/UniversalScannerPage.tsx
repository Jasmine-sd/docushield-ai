import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  FileText,
  X,
  Scan,
  ShieldAlert,
  ArrowRight,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { documentService, analysisService, ANALYSIS_STAGES } from '../../services/documentService';
import { historyService, auditService } from '../../services/historyService';
import { imageStore } from '../../services/imageStore';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useTranslation } from '../../contexts/I18nContext';
import { ScanResult } from '../../types';

export const UniversalScannerPage: React.FC = () => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(1);
  const [scanPercent, setScanPercent] = useState(10);
  const [scanStepText, setScanStepText] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedDocType, setSelectedDocType] = useState<string>('Auto-Detect');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Cleanup object URLs on unmount or file change
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleProcessFile(e.target.files[0]);
    }
    e.target.value = '';
  };

  const handleProcessFile = (file: File) => {
    setErrorMsg(null);
    const validation = documentService.validateFile(file);
    if (!validation.valid) {
      setErrorMsg(validation.error || 'Invalid file format or size');
      showToast(t.common.error, validation.error, 'error');
      return;
    }

    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setSelectedFile(file);
    imageStore.setImage(file.name, objectUrl);

    showToast('Document Loaded', `${file.name} is ready for forensic analysis.`, 'info');
  };

  const handleRemoveFile = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setSelectedFile(null);
    setErrorMsg(null);
  };

  const startScanning = async (fileToScan?: File) => {
    const file = fileToScan || selectedFile;
    if (!file) {
      showToast('No Document', 'Please upload a document to scan.', 'warning');
      return;
    }

    setIsScanning(true);
    setErrorMsg(null);

    try {
      const override = selectedDocType === 'Auto-Detect' ? undefined : selectedDocType;
      const result: ScanResult = await analysisService.simulateAnalysis(
        file,
        override,
        (step, text, percent) => {
          setScanStep(step);
          setScanStepText(text);
          setScanPercent(percent);
        }
      );

      // Save preview URL with scan ID
      const effectiveUrl = result.fileUrl || previewUrl;
      if (effectiveUrl) {
        imageStore.setImage(result.id, effectiveUrl);
        if (selectedFile?.name) {
          imageStore.setImage(selectedFile.name, effectiveUrl);
        }
        result.fileUrl = effectiveUrl;
      }

      // Persist to history
      historyService.saveScan(result);

      // Persist audit record
      auditService.logAction({
        actor: user?.name || 'Authorized User',
        role: user?.role || 'user',
        action: 'Document Scan Completed',
        referenceId: result.id,
        resultSummary: `${result.documentType} analyzed with Risk Score: ${result.riskScore}/100.`,
      });

      showToast(t.common.success, `${result.documentType} verified successfully.`, 'success');
      navigate(`/results/${result.id}`);
    } catch (err: any) {
      const msg = err.message || 'An unexpected error occurred during document processing.';
      setErrorMsg(msg);
      showToast(t.common.error, msg, 'error');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          {t.scanner.title}
        </h1>
        <p className="mt-1.5 text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
          {t.scanner.subtitle}
        </p>
      </div>

      {/* Main Upload / Visualizer Box */}
      <div className="bg-[#F8F4F2] dark:bg-[#1A1D21] rounded-3xl border border-[#D8B9AE] dark:border-[#30343B] p-6 sm:p-10 shadow-sm interactive-card">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {!selectedFile ? (
          /* Empty State: Drag & Drop Area */
          <div>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center ${
                dragActive
                  ? 'border-[#B02A3A] bg-[#B02A3A]/5 dark:bg-[#B02A3A]/10 scale-[1.01]'
                  : 'border-zinc-300 dark:border-zinc-700 hover:border-[#B02A3A] hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
              }`}
            >
              <div className="w-16 h-16 rounded-2xl bg-[#B02A3A]/10 dark:bg-[#B02A3A]/20 text-[#B02A3A] flex items-center justify-center mb-4">
                <UploadCloud className="w-8 h-8" />
              </div>

              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                {t.scanner.dropPrompt}
              </h3>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 max-w-sm">
                {t.scanner.orBrowse}
              </p>

              <div className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#B02A3A] hover:bg-[#852336] text-white text-xs font-bold shadow-md cursor-pointer transition-all">
                <UploadCloud className="w-4 h-4" />
                <span>Select Document File</span>
              </div>

              <p className="mt-4 text-xs text-zinc-400 dark:text-zinc-500">
                {t.scanner.supportedFiles}
              </p>
            </div>

            {errorMsg && (
              <div className="mt-4 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center gap-3 text-rose-800 dark:text-rose-200 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Supported Examples List */}
            <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3 text-center sm:text-left">
                {t.scanner.supportedFiles}
              </p>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                {[
                  'Aadhaar',
                  'PAN',
                  'Passport',
                  'Driving Licence',
                  'Marksheet',
                  'Degree',
                  'Diploma',
                  'Bonafide Certificate',
                  'Experience Certificate',
                  'Government Certificate',
                  'Other Documents',
                ].map(item => (
                  <span
                    key={item}
                    className="px-3 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : !isScanning ? (
          /* Visualized Image State at Upload Location */
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  Uploaded Document Ready for Scan
                </span>
              </div>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="text-xs text-zinc-400 hover:text-rose-600 flex items-center gap-1 cursor-pointer font-medium"
              >
                <X className="w-4 h-4" /> Remove File
              </button>
            </div>

            {/* Document Visualizer Preview Frame */}
            <div className="relative rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800 p-4 sm:p-6 flex flex-col items-center justify-center min-h-[340px] shadow-inner">
              {previewUrl && (selectedFile.type.startsWith('image/') || selectedFile.name.match(/\.(jpg|jpeg|png|webp)$/i)) ? (
                <div className="relative max-w-full flex flex-col items-center">
                  <img
                    src={previewUrl}
                    alt={selectedFile.name}
                    className="max-h-[360px] w-auto max-w-full rounded-xl shadow-2xl object-contain border border-zinc-700"
                  />
                  <div className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-3 px-3 py-1.5 rounded-lg bg-zinc-900/90 border border-zinc-700 backdrop-blur-md text-[11px] text-zinc-300 flex items-center gap-2">
                    <Eye className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="truncate max-w-[200px]">{selectedFile.name}</span>
                    <span className="text-zinc-500 font-mono">
                      ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-[#B02A3A]/20 text-[#B02A3A] flex items-center justify-center mx-auto">
                    <FileText className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{selectedFile.name}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type || 'PDF Document'}
                    </p>
                  </div>
                  <span className="inline-block text-[11px] px-3 py-1 rounded-full bg-zinc-800 text-zinc-300">
                    PDF Optical Document Ready
                  </span>
                </div>
              )}
            </div>

            {/* Optional Document Type Hint Selection */}
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  Target Document Type (Optional Override):
                </span>
                <span className="text-[11px] text-zinc-400">
                  Default: Auto-Detect
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {['Auto-Detect', 'Aadhaar Card', 'PAN Card', 'Passport', 'Driving Licence', 'Degree Certificate', 'Marksheet'].map(dt => (
                  <button
                    key={dt}
                    type="button"
                    onClick={() => setSelectedDocType(dt)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      selectedDocType === dt
                        ? 'bg-[#B02A3A] text-white shadow-xs'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    {dt}
                  </button>
                ))}
              </div>
            </div>

            {errorMsg && (
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center gap-3 text-rose-800 dark:text-rose-200 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold transition-all cursor-pointer text-center"
              >
                Change Document
              </button>

              <button
                type="button"
                onClick={() => startScanning()}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#B02A3A] hover:bg-[#852336] text-white text-sm font-bold shadow-lg shadow-red-950/40 hover:scale-[1.02] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Scan className="w-4 h-4" />
                <span>Scan & Analyze Document</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Live Scanning State with Visualized Image and Red Laser Beam */
          <div className="py-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                <span className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                  Forensic Vision Engine Active
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-red-600 dark:text-red-400">
                Stage {scanStep} of {ANALYSIS_STAGES.length} • {scanPercent}%
              </span>
            </div>

            {/* Document with Animated Red Laser Sweep Line */}
            <div className="relative rounded-2xl overflow-hidden bg-zinc-950 border-2 border-red-500/40 p-4 min-h-[300px] flex items-center justify-center shadow-2xl">
              {previewUrl && (selectedFile.type.startsWith('image/') || selectedFile.name.match(/\.(jpg|jpeg|png|webp)$/i)) ? (
                <div className="relative inline-block max-w-full">
                  <img
                    src={previewUrl}
                    alt="Scanning target"
                    className="max-h-[320px] w-auto max-w-full rounded-xl object-contain opacity-85"
                  />
                  {/* Glowing Animated Red Laser Line */}
                  <div
                    className="absolute left-0 right-0 h-1 bg-red-500 shadow-[0_0_18px_#ef4444] animate-pulse pointer-events-none"
                    style={{
                      animation: 'scanLaser 2.2s ease-in-out infinite alternate',
                    }}
                  />
                  <div
                    className="absolute inset-0 bg-red-500/10 pointer-events-none"
                    style={{
                      animation: 'scanOverlay 2.2s ease-in-out infinite alternate',
                    }}
                  />
                </div>
              ) : (
                <div className="text-center p-8 space-y-3">
                  <div className="w-16 h-16 rounded-full border-4 border-red-500 border-t-transparent animate-spin mx-auto flex items-center justify-center">
                    <Scan className="w-6 h-6 text-red-500" />
                  </div>
                  <p className="text-sm font-bold text-white">{selectedFile?.name}</p>
                </div>
              )}
            </div>

            {/* Current Step Description */}
            <div className="text-center">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                {scanStepText || t.scanner.analyzingDoc}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Forensic inspection of typography, micro-texture, substrate continuity, and inpainting markers...
              </p>
            </div>

            {/* 9 Analysis Stages Progress Stepper */}
            <div className="max-w-xl mx-auto space-y-2 pt-2">
              {ANALYSIS_STAGES.map(st => {
                const isPassed = scanStep > st.step;
                const isCurrent = scanStep === st.step;
                return (
                  <div
                    key={st.step}
                    className={`flex items-center justify-between p-2.5 rounded-xl text-xs transition-all ${
                      isCurrent
                        ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 font-bold border border-red-200 dark:border-red-900/60 shadow-xs'
                        : isPassed
                        ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20'
                        : 'text-zinc-400 dark:text-zinc-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {isPassed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      ) : (
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            isCurrent
                              ? 'bg-red-600 text-white animate-pulse'
                              : 'bg-zinc-200 dark:bg-zinc-800'
                          }`}
                        >
                          {st.step}
                        </div>
                      )}
                      <div>
                        <span className="font-semibold">{st.label}</span>
                        {isCurrent && (
                          <p className="text-[11px] font-normal text-zinc-500 dark:text-zinc-400 mt-0.5">
                            {st.detail}
                          </p>
                        )}
                      </div>
                    </div>
                    {isPassed && (
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        ✓ Done
                      </span>
                    )}
                    {isCurrent && (
                      <span className="text-[10px] font-mono text-red-600 dark:text-red-400 font-bold animate-pulse">
                        Active...
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes scanLaser {
          0% { top: 0%; opacity: 0.9; }
          100% { top: 98%; opacity: 0.9; }
        }
      `}</style>
    </div>
  );
};
