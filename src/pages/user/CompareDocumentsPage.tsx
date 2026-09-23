import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  GitCompare,
  Download,
  FileText,
  CheckCircle2,
  AlertTriangle,
  X,
  Hash,
  Layers,
  Eye,
  EyeOff,
  RefreshCw,
  Info,
  ArrowRight,
  ShieldAlert,
  FileCheck2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Split,
  Columns,
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useTranslation } from '../../contexts/I18nContext';
import { apiClient } from '../../services/apiClient';
import { imageStore } from '../../services/imageStore';

export interface ComparisonDiff {
  id: string;
  field: string;
  originalValue: string;
  submittedValue: string;
  category: 'text' | 'visual' | 'layout' | 'added' | 'removed' | 'modified';
  severity: 'high' | 'medium' | 'low';
  description: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  pageNumber?: number;
}

export interface ComparisonData {
  id: string;
  docAName: string;
  docBName: string;
  docAType: string;
  docBType: string;
  docASize: string;
  docBSize: string;
  docAHash: string;
  docBHash: string;
  docAUrl?: string;
  docBUrl?: string;
  comparisonStatus: 'completed' | 'inconclusive';
  similarityScore: number | null;
  textSimilarity: number | null;
  visualSimilarity: number | null;
  layoutSimilarity: number | null;
  structuralSimilarity: number | null;
  differenceCount: number;
  verdict: string;
  summary: string;
  createdAt: string;
}

export const CompareDocumentsPage: React.FC = () => {
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [previewUrlA, setPreviewUrlA] = useState<string | null>(null);
  const [previewUrlB, setPreviewUrlB] = useState<string | null>(null);

  const [dragActiveA, setDragActiveA] = useState(false);
  const [dragActiveB, setDragActiveB] = useState(false);

  const [isComparing, setIsComparing] = useState(false);
  const [comparisonStep, setComparisonStep] = useState<string>('');
  const [hasCompared, setHasCompared] = useState(false);

  const [comparisonResult, setComparisonResult] = useState<ComparisonData | null>(null);
  const [differences, setDifferences] = useState<ComparisonDiff[]>([]);
  const [selectedDiffId, setSelectedDiffId] = useState<string | null>(null);
  const [activeTabCategory, setActiveTabCategory] = useState<string>('all');

  // Visualizer interactive controls
  const [showRedHighlights, setShowRedHighlights] = useState(true);
  const [viewerLayout, setViewerLayout] = useState<'split' | 'docB' | 'docA'>('split');
  const [viewerZoom, setViewerZoom] = useState(1);
  const [hoveredDiffId, setHoveredDiffId] = useState<string | null>(null);

  const inputRefA = useRef<HTMLInputElement>(null);
  const inputRefB = useRef<HTMLInputElement>(null);

  const { showToast } = useToast();
  const { t } = useTranslation();

  const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (previewUrlA && previewUrlA.startsWith('blob:')) URL.revokeObjectURL(previewUrlA);
      if (previewUrlB && previewUrlB.startsWith('blob:')) URL.revokeObjectURL(previewUrlB);
    };
  }, [previewUrlA, previewUrlB]);

  const validateFile = (file: File): boolean => {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      showToast('File Exceeds Limit', `"${file.name}" exceeds the 25 MB maximum file size limit.`, 'error');
      return false;
    }
    const allowedExtensions = ['pdf', 'png', 'jpg', 'jpeg', 'webp'];
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!allowedExtensions.includes(ext) && !file.type.startsWith('image/') && file.type !== 'application/pdf') {
      showToast('Unsupported Format', `"${file.name}" is not a supported file type (PDF, PNG, JPG, JPEG, WEBP).`, 'error');
      return false;
    }
    return true;
  };

  const handleSelectFileA = (file: File) => {
    if (!file || !validateFile(file)) return;
    if (previewUrlA && previewUrlA.startsWith('blob:')) URL.revokeObjectURL(previewUrlA);

    const url = URL.createObjectURL(file);
    setPreviewUrlA(url);
    setFileA(file);
    imageStore.setImage(file.name, url);
    showToast('Reference Document A Loaded', `${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`, 'success');
  };

  const handleSelectFileB = (file: File) => {
    if (!file || !validateFile(file)) return;
    if (previewUrlB && previewUrlB.startsWith('blob:')) URL.revokeObjectURL(previewUrlB);

    const url = URL.createObjectURL(file);
    setPreviewUrlB(url);
    setFileB(file);
    imageStore.setImage(file.name, url);
    showToast('Comparison Document B Loaded', `${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`, 'success');
  };

  const handleRemoveFileA = () => {
    if (previewUrlA && previewUrlA.startsWith('blob:')) URL.revokeObjectURL(previewUrlA);
    setPreviewUrlA(null);
    setFileA(null);
  };

  const handleRemoveFileB = () => {
    if (previewUrlB && previewUrlB.startsWith('blob:')) URL.revokeObjectURL(previewUrlB);
    setPreviewUrlB(null);
    setFileB(null);
  };

  const handleStartComparison = async () => {
    if (!fileA || !fileB) {
      showToast('Select Documents', 'Please upload both Document A (Reference) and Document B (Comparison).', 'warning');
      return;
    }

    setIsComparing(true);
    setHasCompared(false);
    setComparisonStep('Generating cryptographic SHA-256 digests...');

    try {
      const formData = new FormData();
      formData.append('fileA', fileA);
      formData.append('fileB', fileB);

      setTimeout(() => setComparisonStep('Extracting layout structure & multi-layer OCR text...'), 1000);
      setTimeout(() => setComparisonStep('Running forensic vision engine & discrepancy mapping...'), 2000);

      const response = await apiClient.post('/comparisons', formData);

      if (response.success && response.data) {
        const { comparison, differences: diffList } = response.data;

        // Ensure URLs are linked
        if (previewUrlA && !comparison.docAUrl) comparison.docAUrl = previewUrlA;
        if (previewUrlB && !comparison.docBUrl) comparison.docBUrl = previewUrlB;

        setComparisonResult(comparison);
        setDifferences(diffList || []);
        if (diffList && diffList.length > 0) {
          setSelectedDiffId(diffList[0].id);
        }
        setHasCompared(true);
        showToast('Comparison Completed', `Analysis completed with ${diffList?.length || 0} discrepancy(ies) detected.`, 'info');
      } else {
        const errMsg = response.error?.message || 'Comparison service failed to complete analysis.';
        showToast('Comparison Failed', errMsg, 'error');
        setComparisonResult({
          id: `CMP-${Date.now().toString(36).toUpperCase()}`,
          docAName: fileA.name,
          docBName: fileB.name,
          docAType: 'Unknown Document',
          docBType: 'Unknown Document',
          docASize: `${(fileA.size / (1024 * 1024)).toFixed(2)} MB`,
          docBSize: `${(fileB.size / (1024 * 1024)).toFixed(2)} MB`,
          docAHash: 'SHA256-PENDING',
          docBHash: 'SHA256-PENDING',
          docAUrl: previewUrlA || undefined,
          docBUrl: previewUrlB || undefined,
          comparisonStatus: 'inconclusive',
          similarityScore: null,
          textSimilarity: null,
          visualSimilarity: null,
          layoutSimilarity: null,
          structuralSimilarity: null,
          differenceCount: 0,
          verdict: 'Inconclusive — Unable to process documents.',
          summary: errMsg,
          createdAt: new Date().toISOString(),
        });
        setDifferences([]);
        setHasCompared(true);
      }
    } catch (err: any) {
      showToast('Comparison Error', err.message || 'An unexpected error occurred during document comparison.', 'error');
    } finally {
      setIsComparing(false);
      setComparisonStep('');
    }
  };

  const handleReset = () => {
    handleRemoveFileA();
    handleRemoveFileB();
    setHasCompared(false);
    setComparisonResult(null);
    setDifferences([]);
    setSelectedDiffId(null);
  };

  const filteredDifferences = differences.filter((d) => {
    if (activeTabCategory === 'all') return true;
    return d.category === activeTabCategory;
  });

  const selectedDiff = differences.find((d) => d.id === selectedDiffId);

  const isPdfA = fileA?.type === 'application/pdf' || fileA?.name.toLowerCase().endsWith('.pdf');
  const isPdfB = fileB?.type === 'application/pdf' || fileB?.name.toLowerCase().endsWith('.pdf');

  const finalImgSrcA = (isPdfA && comparisonResult?.docAUrl) ? comparisonResult.docAUrl : (previewUrlA || comparisonResult?.docAUrl || null);
  const finalImgSrcB = (isPdfB && comparisonResult?.docBUrl) ? comparisonResult.docBUrl : (previewUrlB || comparisonResult?.docBUrl || null);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-200 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
              Universal Document Forensic Comparison Engine
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
              Universal Format
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-3xl">
            Upload and visualize reference Document A and comparison Document B to detect alterations, mismatched fields, and suspicious regions with red highlights.
          </p>
        </div>

        {hasCompared && (
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 font-semibold text-xs hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center gap-2 cursor-pointer self-start md:self-auto transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>New Comparison</span>
          </button>
        )}
      </div>

      {/* Info Notice Banner */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed space-y-1">
          <p className="font-bold">Universal Document Comparison Notice</p>
          <p className="text-amber-800 dark:text-amber-300">
            <strong>DOC A</strong> and <strong>DOC B</strong> are descriptive labels. You can upload ANY supported document type (invoices, certificates, contracts, identity cards, receipts, marksheets, or letters) up to 25 MB. The engine visualizes uploaded images at their location and highlights suspicious discrepancies in red.
          </p>
        </div>
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={inputRefA}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.webp"
        onChange={(e) => {
          if (e.target.files?.[0]) handleSelectFileA(e.target.files[0]);
          e.target.value = '';
        }}
        className="hidden"
      />
      <input
        ref={inputRefB}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.webp"
        onChange={(e) => {
          if (e.target.files?.[0]) handleSelectFileB(e.target.files[0]);
          e.target.value = '';
        }}
        className="hidden"
      />

      {/* Upload Dropzones Grid: Visualizes Image Directly at Upload Location */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Document A (Reference) */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#1A1D21] border border-zinc-200/80 dark:border-[#30343B] space-y-4 shadow-sm interactive-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-teal-500"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                Document A (Reference / Original)
              </span>
            </div>
            {fileA && (
              <button
                type="button"
                onClick={handleRemoveFileA}
                className="text-xs text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-1 cursor-pointer font-medium"
              >
                <X className="w-3.5 h-3.5" /> Remove
              </button>
            )}
          </div>

          <div
            onDragOver={(e) => { e.preventDefault(); setDragActiveA(true); }}
            onDragLeave={() => setDragActiveA(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActiveA(false);
              if (e.dataTransfer.files?.[0]) handleSelectFileA(e.dataTransfer.files[0]);
            }}
            className={`p-5 rounded-2xl transition-all flex flex-col items-center justify-center text-center min-h-[260px] ${
              dragActiveA
                ? 'border-2 border-teal-500 bg-teal-500/10 scale-[1.01]'
                : fileA
                ? 'border border-teal-500/30 bg-teal-500/5'
                : 'border-2 border-dashed border-zinc-200 dark:border-zinc-700 hover:border-teal-500 bg-zinc-50/50 dark:bg-zinc-900/40 cursor-pointer'
            }`}
            onClick={() => {
              if (!fileA) inputRefA.current?.click();
            }}
          >
            {fileA ? (
              /* Visualized Document A at this place */
              <div className="w-full flex flex-col items-center space-y-3">
                <div className="relative rounded-xl overflow-hidden bg-zinc-950 p-2 border border-zinc-700 shadow-md max-w-full">
                  {previewUrlA && (fileA.type.startsWith('image/') || fileA.name.match(/\.(jpg|jpeg|png|webp)$/i)) ? (
                    <img
                      src={previewUrlA}
                      alt="Doc A Preview"
                      className="max-h-[220px] w-auto max-w-full object-contain rounded-lg shadow-sm"
                    />
                  ) : (
                    <div className="w-48 h-36 flex flex-col items-center justify-center text-teal-400 p-4">
                      <FileText className="w-12 h-12 mb-2 text-teal-400" />
                      <span className="text-xs font-bold text-white">{fileA.name}</span>
                      <span className="text-[10px] text-zinc-400 mt-1">PDF Optical Document</span>
                    </div>
                  )}
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-teal-600 text-white text-[10px] font-bold uppercase tracking-wider shadow">
                    Reference
                  </span>
                </div>

                <div className="text-center">
                  <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 max-w-[280px] truncate">
                    {fileA.name}
                  </p>
                  <span className="text-[11px] font-mono text-teal-700 dark:text-teal-400 font-semibold block mt-0.5">
                    {(fileA.size / (1024 * 1024)).toFixed(2)} MB • {fileA.type || 'PDF/Image'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    inputRefA.current?.click();
                  }}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold text-teal-700 dark:text-teal-300 bg-teal-500/15 hover:bg-teal-500/25 transition-all cursor-pointer"
                >
                  Change Image A
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-1">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <p className="text-sm font-bold text-zinc-900 dark:text-white">
                  Drop Reference Document A
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Drag and drop or browse image file
                </p>
                <button
                  type="button"
                  onClick={() => inputRefA.current?.click()}
                  className="mt-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Select Document A
                </button>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-2">
                  PDF, PNG, JPG, JPEG, WEBP • Max 25 MB
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Document B (Comparison) */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#1A1D21] border border-zinc-200/80 dark:border-[#30343B] space-y-4 shadow-sm interactive-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                Document B (Comparison / Submitted)
              </span>
            </div>
            {fileB && (
              <button
                type="button"
                onClick={handleRemoveFileB}
                className="text-xs text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-1 cursor-pointer font-medium"
              >
                <X className="w-3.5 h-3.5" /> Remove
              </button>
            )}
          </div>

          <div
            onDragOver={(e) => { e.preventDefault(); setDragActiveB(true); }}
            onDragLeave={() => setDragActiveB(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActiveB(false);
              if (e.dataTransfer.files?.[0]) handleSelectFileB(e.dataTransfer.files[0]);
            }}
            className={`p-5 rounded-2xl transition-all flex flex-col items-center justify-center text-center min-h-[260px] ${
              dragActiveB
                ? 'border-2 border-rose-500 bg-rose-500/10 scale-[1.01]'
                : fileB
                ? 'border border-rose-500/30 bg-rose-500/5'
                : 'border-2 border-dashed border-zinc-200 dark:border-zinc-700 hover:border-rose-500 bg-zinc-50/50 dark:bg-zinc-900/40 cursor-pointer'
            }`}
            onClick={() => {
              if (!fileB) inputRefB.current?.click();
            }}
          >
            {fileB ? (
              /* Visualized Document B at this place */
              <div className="w-full flex flex-col items-center space-y-3">
                <div className="relative rounded-xl overflow-hidden bg-zinc-950 p-2 border border-zinc-700 shadow-md max-w-full">
                  {previewUrlB && (fileB.type.startsWith('image/') || fileB.name.match(/\.(jpg|jpeg|png|webp)$/i)) ? (
                    <img
                      src={previewUrlB}
                      alt="Doc B Preview"
                      className="max-h-[220px] w-auto max-w-full object-contain rounded-lg shadow-sm"
                    />
                  ) : (
                    <div className="w-48 h-36 flex flex-col items-center justify-center text-rose-400 p-4">
                      <FileText className="w-12 h-12 mb-2 text-rose-400" />
                      <span className="text-xs font-bold text-white">{fileB.name}</span>
                      <span className="text-[10px] text-zinc-400 mt-1">PDF Optical Document</span>
                    </div>
                  )}
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-bold uppercase tracking-wider shadow">
                    Comparison
                  </span>
                </div>

                <div className="text-center">
                  <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 max-w-[280px] truncate">
                    {fileB.name}
                  </p>
                  <span className="text-[11px] font-mono text-rose-700 dark:text-rose-400 font-semibold block mt-0.5">
                    {(fileB.size / (1024 * 1024)).toFixed(2)} MB • {fileB.type || 'PDF/Image'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    inputRefB.current?.click();
                  }}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-500/15 hover:bg-rose-500/25 transition-all cursor-pointer"
                >
                  Change Image B
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-1">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <p className="text-sm font-bold text-zinc-900 dark:text-white">
                  Drop Comparison Document B
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Drag and drop or browse image file
                </p>
                <button
                  type="button"
                  onClick={() => inputRefB.current?.click()}
                  className="mt-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Select Document B
                </button>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-2">
                  PDF, PNG, JPG, JPEG, WEBP • Max 25 MB
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Start Comparison Action Button */}
      <div className="text-center pt-2">
        <button
          type="button"
          disabled={!fileA || !fileB || isComparing}
          onClick={handleStartComparison}
          className="px-10 py-4 rounded-2xl bg-[#B02A3A] hover:bg-[#852336] text-white font-extrabold text-sm shadow-xl disabled:opacity-40 transition-all cursor-pointer inline-flex items-center gap-3 hover:scale-[1.02] active:scale-[0.99]"
        >
          <GitCompare className={`w-5 h-5 ${isComparing ? 'animate-spin' : ''}`} />
          <span>{isComparing ? 'Running Forensic Comparison Engine...' : 'Run Forensic Comparison'}</span>
        </button>

        {isComparing && comparisonStep && (
          <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold mt-3 animate-pulse">
            {comparisonStep}
          </p>
        )}
      </div>

      {/* Results Section with Real Images & Red Highlights */}
      {hasCompared && comparisonResult && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1A1D21] border border-zinc-200/80 dark:border-[#30343B] space-y-8 shadow-sm">
          {/* Header Metadata */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 border-b border-zinc-200 dark:border-zinc-800 gap-4">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                  {comparisonResult.id}
                </span>
                <span
                  className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider ${
                    comparisonResult.comparisonStatus === 'completed'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                >
                  Status: {comparisonResult.comparisonStatus}
                </span>
                {differences.length > 0 && (
                  <span className="text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300 border border-red-300 dark:border-red-800 animate-pulse">
                    {differences.length} Suspicious Regions Highlighted in Red
                  </span>
                )}
              </div>

              <div className="mt-3 flex flex-col sm:flex-row gap-4 text-xs font-mono text-zinc-500">
                <span>
                  <strong>Doc A Hash:</strong> {comparisonResult.docAHash?.substring(0, 16)}...
                </span>
                <span>
                  <strong>Doc B Hash:</strong> {comparisonResult.docBHash?.substring(0, 16)}...
                </span>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-bold flex items-center gap-2 cursor-pointer self-start lg:self-auto transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download Audit Report</span>
            </button>
          </div>

          {/* VISUAL FORENSIC COMPARISON STAGE: Highlights Suspicious Regions in RED */}
          <div className="rounded-3xl bg-zinc-950 border-2 border-zinc-800 overflow-hidden shadow-2xl space-y-0">
            {/* Visualizer Toolbar */}
            <div className="p-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                <h3 className="text-sm font-extrabold text-white tracking-wide">
                  Document Image Visualizer & Red Suspicious Region Highlights
                </h3>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Red Highlights Toggle */}
                <button
                  type="button"
                  onClick={() => setShowRedHighlights(!showRedHighlights)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl font-bold transition-all cursor-pointer ${
                    showRedHighlights
                      ? 'bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-950/60'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {showRedHighlights ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{showRedHighlights ? `Red Highlights (${differences.length})` : 'Show Highlights'}</span>
                </button>

                {/* View Layout Selector */}
                <div className="flex items-center bg-zinc-800 rounded-xl p-1 border border-zinc-700">
                  <button
                    type="button"
                    onClick={() => setViewerLayout('split')}
                    className={`px-2.5 py-1 text-xs rounded-lg font-bold transition-colors cursor-pointer ${
                      viewerLayout === 'split' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Side-by-Side
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewerLayout('docB')}
                    className={`px-2.5 py-1 text-xs rounded-lg font-bold transition-colors cursor-pointer ${
                      viewerLayout === 'docB' ? 'bg-rose-700 text-white' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Doc B (Errors)
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewerLayout('docA')}
                    className={`px-2.5 py-1 text-xs rounded-lg font-bold transition-colors cursor-pointer ${
                      viewerLayout === 'docA' ? 'bg-teal-700 text-white' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Doc A (Ref)
                  </button>
                </div>

                {/* Zoom Controls */}
                <div className="flex items-center gap-1 bg-zinc-800 rounded-xl p-1 border border-zinc-700">
                  <button
                    type="button"
                    onClick={() => setViewerZoom(prev => Math.min(prev + 0.2, 2.2))}
                    className="p-1.5 rounded-lg hover:bg-zinc-700 text-zinc-400 hover:text-white cursor-pointer"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewerZoom(prev => Math.max(prev - 0.2, 0.6))}
                    className="p-1.5 rounded-lg hover:bg-zinc-700 text-zinc-400 hover:text-white cursor-pointer"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewerZoom(1)}
                    className="p-1.5 rounded-lg hover:bg-zinc-700 text-zinc-400 hover:text-white cursor-pointer"
                    title="Reset Zoom"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Visual Canvas View */}
            <div className="p-4 sm:p-8 overflow-auto min-h-[440px] flex items-center justify-center bg-zinc-950/80 [background-image:radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px]">
              <div
                className="transition-transform duration-200 ease-out w-full"
                style={{
                  transform: `scale(${viewerZoom})`,
                  transformOrigin: 'top center',
                }}
              >
                <div className={`grid gap-6 ${viewerLayout === 'split' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                  {/* Reference Image Canvas (Doc A) */}
                  {(viewerLayout === 'split' || viewerLayout === 'docA') && (
                    <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4 space-y-3">
                      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                        <span className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-teal-400" />
                          Document A: {comparisonResult.docAName}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-400">Reference Original</span>
                      </div>

                      <div className="relative rounded-xl overflow-hidden bg-black flex items-center justify-center min-h-[300px] border border-zinc-800">
                        {finalImgSrcA && (fileA?.type.startsWith('image/') || fileA?.name.match(/\.(jpg|jpeg|png|webp)$/i) || Boolean(comparisonResult?.docAUrl)) ? (
                          <div className="relative max-w-full">
                            <img
                              src={finalImgSrcA}
                              alt="Document A"
                              className="max-h-[460px] w-auto max-w-full object-contain block"
                            />
                            {/* Visual reference markers on Doc A if selected */}
                            {showRedHighlights && selectedDiff && (
                              <div
                                style={{
                                  left: `${Math.max(2, (selectedDiff.x ?? 30))}%`,
                                  top: `${Math.max(2, (selectedDiff.y ?? 30))}%`,
                                  width: `${Math.max(12, selectedDiff.width ?? 28)}%`,
                                  height: `${Math.max(8, selectedDiff.height ?? 12)}%`,
                                }}
                                className="absolute border-2 border-teal-400 bg-teal-400/20 rounded-lg shadow-[0_0_15px_rgba(45,212,191,0.5)] z-20 pointer-events-none"
                              >
                                <span className="absolute -top-3 left-1 px-1.5 py-0.5 rounded bg-teal-600 text-white text-[9px] font-bold uppercase">
                                  Ref: {selectedDiff.field}
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center p-8 space-y-2 text-zinc-400">
                            <FileText className="w-12 h-12 mx-auto text-teal-400" />
                            <p className="text-xs font-bold text-white">{comparisonResult.docAName}</p>
                            <span className="text-[10px] text-zinc-500">Document A Canvas</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Comparison Image Canvas with RED HIGHLIGHTS (Doc B) */}
                  {(viewerLayout === 'split' || viewerLayout === 'docB') && (
                    <div className="rounded-2xl bg-zinc-900 border-2 border-red-900/60 p-4 space-y-3 shadow-lg">
                      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                        <span className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                          Document B: {comparisonResult.docBName}
                        </span>
                        <span className="text-[10px] font-mono text-red-400 font-bold">
                          {differences.length} Red Error Zones
                        </span>
                      </div>

                      <div className="relative rounded-xl overflow-hidden bg-black flex items-center justify-center min-h-[300px] border border-zinc-800">
                        {finalImgSrcB && (fileB?.type.startsWith('image/') || fileB?.name.match(/\.(jpg|jpeg|png|webp)$/i) || Boolean(comparisonResult?.docBUrl)) ? (
                          <div className="relative max-w-full">
                            <img
                              src={finalImgSrcB}
                              alt="Document B"
                              className="max-h-[460px] w-auto max-w-full object-contain block"
                            />

                            {/* RED HIGHLIGHTS FOR RISKS & SUSPICIOUS REGIONS */}
                            {showRedHighlights &&
                              differences.map((diff, idx) => {
                                const isSelected = selectedDiffId === diff.id;
                                const isHovered = hoveredDiffId === diff.id;

                                const posX = typeof diff.x === 'number' ? Math.max(0, Math.min(92, diff.x)) : 30;
                                const posY = typeof diff.y === 'number' ? Math.max(0, Math.min(92, diff.y)) : 30;
                                const boxW = typeof diff.width === 'number' ? Math.max(12, Math.min(90, diff.width)) : 28;
                                const boxH = typeof diff.height === 'number' ? Math.max(8, Math.min(80, diff.height)) : 12;

                                return (
                                  <div
                                    key={diff.id || idx}
                                    onClick={() => setSelectedDiffId(diff.id)}
                                    onMouseEnter={() => setHoveredDiffId(diff.id)}
                                    onMouseLeave={() => setHoveredDiffId(null)}
                                    style={{
                                      left: `${posX}%`,
                                      top: `${posY}%`,
                                      width: `${boxW}%`,
                                      height: `${boxH}%`,
                                    }}
                                    className={`absolute z-30 cursor-pointer rounded-lg transition-all duration-200 border-2 ${
                                      isSelected
                                        ? 'border-red-500 bg-red-600/40 ring-4 ring-red-400/80 shadow-[0_0_25px_rgba(239,68,68,0.9)] scale-[1.03] z-40'
                                        : isHovered
                                        ? 'border-red-400 bg-red-600/30 ring-2 ring-red-400/50 shadow-[0_0_18px_rgba(239,68,68,0.7)] z-35'
                                        : 'border-red-500/90 bg-red-500/25 hover:bg-red-500/35 shadow-[0_0_12px_rgba(239,68,68,0.6)]'
                                    }`}
                                  >
                                    {/* Red Tag / Pill Label */}
                                    <div className="absolute -top-3.5 -left-1 px-1.5 py-0.5 rounded-md bg-red-600 text-white text-[9px] font-extrabold shadow-md tracking-wider border border-white/20 whitespace-nowrap flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                                      <span>#{idx + 1} {diff.field}</span>
                                    </div>

                                    {/* Interactive Hover Tooltip */}
                                    {(isHovered || isSelected) && (
                                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-zinc-950/95 text-white rounded-xl shadow-2xl border border-red-500/60 z-50 pointer-events-none backdrop-blur-md">
                                        <div className="flex items-center justify-between text-[10px] mb-1">
                                          <span className="font-bold text-red-400 uppercase bg-red-950/80 px-1.5 py-0.5 rounded">
                                            {diff.category} Error
                                          </span>
                                          <span className="font-bold uppercase text-red-400">
                                            {diff.severity} Severity
                                          </span>
                                        </div>
                                        <p className="text-xs font-bold text-white">
                                          {diff.field}
                                        </p>
                                        <div className="text-[11px] mt-1 space-y-0.5">
                                          <p className="text-teal-300">A (Original): {diff.originalValue}</p>
                                          <p className="text-red-300 font-bold">B (Submitted): {diff.submittedValue}</p>
                                        </div>
                                        <p className="text-[10px] text-zinc-400 mt-1 leading-snug">
                                          {diff.description}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                          </div>
                        ) : (
                          <div className="text-center p-8 space-y-2 text-zinc-400">
                            <FileText className="w-12 h-12 mx-auto text-rose-400" />
                            <p className="text-xs font-bold text-white">{comparisonResult.docBName}</p>
                            <span className="text-[10px] text-zinc-500">Document B Canvas</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Status Help Banner */}
            <div className="p-3 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
              <span className="text-red-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                Red highlight boxes identify detected discrepancies, suspicious text edits, or altered regions. Click on any box to view details.
              </span>
              <span className="font-mono text-zinc-500 hidden sm:inline">
                Zoom: {Math.round(viewerZoom * 100)}%
              </span>
            </div>
          </div>

          {/* Forensic Component Similarity Breakdown */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">
              Forensic Component Similarity Breakdown
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center">
                <span className="text-[10px] text-zinc-400 font-bold block uppercase">Overall</span>
                <span className="text-xl font-extrabold text-zinc-900 dark:text-white">
                  {comparisonResult.similarityScore !== null ? `${comparisonResult.similarityScore}%` : 'N/A'}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center">
                <span className="text-[10px] text-zinc-400 font-bold block uppercase">Text Layer</span>
                <span className="text-xl font-extrabold text-teal-600 dark:text-teal-400">
                  {comparisonResult.textSimilarity !== null ? `${comparisonResult.textSimilarity}%` : 'N/A'}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center">
                <span className="text-[10px] text-zinc-400 font-bold block uppercase">Visual Layer</span>
                <span className="text-xl font-extrabold text-purple-600 dark:text-purple-400">
                  {comparisonResult.visualSimilarity !== null ? `${comparisonResult.visualSimilarity}%` : 'N/A'}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center">
                <span className="text-[10px] text-zinc-400 font-bold block uppercase">Layout</span>
                <span className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
                  {comparisonResult.layoutSimilarity !== null ? `${comparisonResult.layoutSimilarity}%` : 'N/A'}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center col-span-2 sm:col-span-1">
                <span className="text-[10px] text-zinc-400 font-bold block uppercase">Structural</span>
                <span className="text-xl font-extrabold text-rose-600 dark:text-rose-400">
                  {comparisonResult.structuralSimilarity !== null ? `${comparisonResult.structuralSimilarity}%` : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Verdict & Summary Box */}
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-extrabold text-zinc-900 dark:text-white">
                Verdict: {comparisonResult.verdict}
              </h4>
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/60 px-3 py-1 rounded-full">
                {comparisonResult.differenceCount} Discrepancy(ies) Flagged
              </span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {comparisonResult.summary}
            </p>
          </div>

          {/* Category Tabs & Differences List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">
                Detailed Forensic Discrepancies ({filteredDifferences.length})
              </h3>

              <div className="flex items-center gap-1 overflow-x-auto">
                {['all', 'text', 'visual', 'layout', 'added', 'removed', 'modified'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveTabCategory(cat)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                      activeTabCategory === cat
                        ? 'bg-[#B02A3A] text-white shadow-2xs'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {filteredDifferences.length === 0 ? (
              <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                  No Discrepancies Found in Selected Category
                </h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-400">
                  Document A and Document B match across the requested layers.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredDifferences.map((diff, idx) => (
                  <div
                    key={diff.id}
                    onClick={() => setSelectedDiffId(diff.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                      selectedDiffId === diff.id
                        ? 'border-red-500 bg-red-500/10 ring-2 ring-red-400/50'
                        : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-red-600 text-white font-bold text-[10px] flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-zinc-900 dark:text-white truncate max-w-[180px]">
                          {diff.field}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                          {diff.category}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            diff.severity === 'high'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {diff.severity}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20">
                        <span className="text-[10px] text-teal-700 dark:text-teal-400 font-bold block uppercase">
                          Doc A (Original)
                        </span>
                        <span className="font-mono font-bold text-teal-800 dark:text-teal-300 break-words">
                          {diff.originalValue}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                        <span className="text-[10px] text-rose-700 dark:text-rose-400 font-bold block uppercase">
                          Doc B (Submitted)
                        </span>
                        <span className="font-mono font-bold text-rose-800 dark:text-rose-300 break-words">
                          {diff.submittedValue}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-normal">
                      {diff.description}
                    </p>

                    <div className="text-[10px] font-mono text-zinc-400 flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-800">
                      <span>Page: #{diff.pageNumber || 1}</span>
                      <span className="text-red-400 font-bold">Region X:{diff.x ?? 30}% Y:{diff.y ?? 30}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
