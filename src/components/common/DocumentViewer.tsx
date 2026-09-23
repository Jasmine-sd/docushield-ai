import React, { useState, useRef, useEffect } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  AlertTriangle,
  Eye,
  EyeOff,
  Layers,
  Sparkles,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { DocumentIssue } from '../../types';

interface DocumentViewerProps {
  documentType: string;
  findings: DocumentIssue[];
  fileName?: string;
  imageUrl?: string | null;
  onSelectIssue?: (issue: DocumentIssue) => void;
  selectedIssueId?: string | null;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  documentType,
  findings = [],
  fileName = 'document_scan.jpg',
  imageUrl,
  onSelectIssue,
  selectedIssueId,
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [showHighlights, setShowHighlights] = useState(true);
  const [hoveredIssueId, setHoveredIssueId] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 2.5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
  };
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  // If imageUrl changes, reset states
  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [imageUrl]);

  const hasImage = Boolean(imageUrl && !imageError);

  return (
    <div className="flex flex-col h-full bg-zinc-900 rounded-3xl border border-zinc-800 overflow-hidden shadow-lg select-none">
      {/* Viewer Header Toolbar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-zinc-950 border-b border-zinc-800 gap-2 flex-wrap">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shrink-0" />
          <span className="text-xs font-semibold text-zinc-200 truncate max-w-[180px] sm:max-w-[240px]">
            {fileName}
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 font-medium">
            {documentType}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Toggle Red Highlights Button */}
          <button
            type="button"
            onClick={() => setShowHighlights(!showHighlights)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl font-bold transition-all cursor-pointer shadow-xs ${
              showHighlights
                ? 'bg-red-600 text-white hover:bg-red-700 shadow-red-950/50'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
            title="Toggle Red Highlight Overlays"
          >
            {showHighlights ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>
              {showHighlights
                ? `Red Highlights (${findings.length})`
                : 'Show Highlights'}
            </span>
          </button>

          <div className="h-4 w-px bg-zinc-800 mx-1 hidden sm:block" />

          {/* Zoom & Rotate Controls */}
          <div className="flex items-center gap-1 bg-zinc-900 rounded-xl p-1 border border-zinc-800">
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleRotate}
              className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Rotate 90°"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Reset View"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Red Highlight Status Banner */}
      <div className="px-4 py-2 bg-red-950/40 border-b border-red-900/30 flex items-center justify-between text-xs text-red-200">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>
            {findings.length > 0 ? (
              <>
                <strong className="text-white font-bold">{findings.length} Suspicious Regions / Risks</strong>{' '}
                highlighted in red below. Click on any red box to inspect findings.
              </>
            ) : (
              <span className="text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> No suspicious regions detected. Clean document surface.
              </span>
            )}
          </span>
        </div>
        <span className="text-[11px] text-zinc-400 font-mono hidden sm:inline">
          Zoom: {Math.round(zoom * 100)}%
        </span>
      </div>

      {/* Main Canvas Area */}
      <div
        ref={containerRef}
        className="relative flex-1 min-h-[440px] md:min-h-[520px] flex items-center justify-center p-4 sm:p-8 overflow-auto select-none bg-zinc-950/90 [background-image:radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px]"
      >
        <div
          className="relative transition-transform duration-200 ease-out flex items-center justify-center"
          style={{
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
            transformOrigin: 'center center',
          }}
        >
          {/* Document Container */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-zinc-700 bg-zinc-900 max-w-full">
            {hasImage ? (
              <div className="relative inline-block max-w-[680px]">
                {/* Real Uploaded Document Image */}
                <img
                  src={imageUrl!}
                  alt={fileName}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                  className="max-h-[600px] w-auto max-w-full block object-contain select-none pointer-events-none rounded-xl"
                />

                {/* Overlaid Red Highlights */}
                {showHighlights &&
                  findings.map((issue, idx) => {
                    const isSelected = selectedIssueId === issue.id;
                    const isHovered = hoveredIssueId === issue.id;

                    const posX = typeof issue.x === 'number' ? Math.max(0, Math.min(95, issue.x)) : 25;
                    const posY = typeof issue.y === 'number' ? Math.max(0, Math.min(95, issue.y)) : 25;
                    const boxW = typeof issue.width === 'number' ? Math.max(10, Math.min(90, issue.width)) : 30;
                    const boxH = typeof issue.height === 'number' ? Math.max(8, Math.min(80, issue.height)) : 14;

                    return (
                      <div
                        key={issue.id || idx}
                        onClick={() => onSelectIssue?.(issue)}
                        onMouseEnter={() => setHoveredIssueId(issue.id)}
                        onMouseLeave={() => setHoveredIssueId(null)}
                        style={{
                          left: `${posX}%`,
                          top: `${posY}%`,
                          width: `${boxW}%`,
                          height: `${boxH}%`,
                        }}
                        className={`absolute z-30 cursor-pointer rounded-lg transition-all duration-200 group border-2 ${
                          isSelected
                            ? 'border-red-500 bg-red-600/35 ring-4 ring-red-500/70 shadow-[0_0_25px_rgba(239,68,68,0.9)] scale-[1.02] z-40'
                            : isHovered
                            ? 'border-red-400 bg-red-600/25 ring-2 ring-red-400/50 shadow-[0_0_20px_rgba(239,68,68,0.7)] z-35'
                            : 'border-red-500/90 bg-red-500/20 hover:bg-red-500/30 shadow-[0_0_12px_rgba(239,68,68,0.5)]'
                        }`}
                        title={issue.title}
                      >
                        {/* Red Corner Badge */}
                        <div className="absolute -top-3.5 -left-1 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-red-600 text-white text-[10px] font-extrabold shadow-md tracking-wider border border-white/20 uppercase whitespace-nowrap">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                          <span>Risk #{idx + 1}</span>
                        </div>

                        {/* Animated Scanning Outline on Selected */}
                        {isSelected && (
                          <div className="absolute inset-0 border border-white/40 rounded-lg animate-pulse pointer-events-none" />
                        )}

                        {/* Interactive Floating Tooltip on Hover */}
                        {(isHovered || isSelected) && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-zinc-950/95 text-white rounded-xl shadow-2xl border border-red-500/50 z-50 pointer-events-none backdrop-blur-md">
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 bg-red-950/80 px-1.5 py-0.5 rounded">
                                {issue.category || 'Forensic Issue'}
                              </span>
                              <span className="text-[10px] font-semibold text-zinc-400">
                                {issue.confidence || 'High'} Conf.
                              </span>
                            </div>
                            <p className="text-xs font-bold text-white leading-tight">
                              {issue.title}
                            </p>
                            <p className="text-[11px] text-zinc-300 mt-1 line-clamp-2 leading-snug">
                              {issue.description}
                            </p>
                            <div className="mt-1.5 pt-1.5 border-t border-zinc-800 flex items-center justify-between text-[10px] text-red-300">
                              <span>Location: {issue.location || 'Document Surface'}</span>
                              <span className="font-semibold underline">Click to inspect</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            ) : (
              /* Fallback Styled Document Layout when no image is available */
              <div className="relative w-[340px] sm:w-[440px] md:w-[500px] aspect-[1.414/1] bg-white dark:bg-zinc-950 rounded-xl shadow-xl p-6 flex flex-col justify-between overflow-hidden">
                <div className="absolute inset-2 border-2 border-dashed border-zinc-300 dark:border-zinc-800 rounded-lg pointer-events-none opacity-60" />

                <div className="relative z-10 flex items-start justify-between border-b pb-3 border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#B02A3A]/10 text-[#B02A3A] flex items-center justify-center font-bold text-xs">
                      DS
                    </div>
                    <div>
                      <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                        {documentType}
                      </h3>
                      <p className="text-[9px] text-zinc-400 dark:text-zinc-500">
                        OFFICIAL VERIFIED IDENTIFICATION RECORD
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                    PDF Document
                  </span>
                </div>

                <div className="relative z-10 py-4 grid grid-cols-3 gap-4 my-auto">
                  <div className="col-span-1">
                    <div className="w-24 h-28 bg-zinc-200 dark:bg-zinc-800 rounded-lg border border-zinc-300 dark:border-zinc-700 flex flex-col items-center justify-center p-2">
                      <div className="w-10 h-10 rounded-full bg-zinc-300 dark:bg-zinc-700 mb-1" />
                      <div className="w-14 h-6 bg-zinc-300 dark:bg-zinc-700 rounded-t-lg" />
                    </div>
                  </div>

                  <div className="col-span-2 space-y-2">
                    <div className="h-3 w-40 bg-zinc-200 dark:bg-zinc-800 rounded" />
                    <div className="h-3.5 w-32 bg-red-100 dark:bg-red-950/40 rounded border border-red-300" />
                    <div className="h-3 w-48 bg-zinc-200 dark:bg-zinc-800 rounded" />
                    <div className="h-3 w-36 bg-zinc-200 dark:bg-zinc-800 rounded" />
                  </div>
                </div>

                <div className="relative z-10 pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[8px] text-zinc-400">
                  <span className="font-mono">SECURE FORENSIC AUDIT CANVAS</span>
                  <span className="text-zinc-400">Page 1 of 1</span>
                </div>

                {/* Overlaid Red Highlights for Fallback */}
                {showHighlights &&
                  findings.map((issue, idx) => {
                    const isSelected = selectedIssueId === issue.id;
                    const posX = typeof issue.x === 'number' ? issue.x : 30;
                    const posY = typeof issue.y === 'number' ? issue.y : 30;
                    const boxW = typeof issue.width === 'number' ? issue.width : 35;
                    const boxH = typeof issue.height === 'number' ? issue.height : 15;

                    return (
                      <div
                        key={issue.id || idx}
                        onClick={() => onSelectIssue?.(issue)}
                        style={{
                          left: `${posX}%`,
                          top: `${posY}%`,
                          width: `${boxW}%`,
                          height: `${boxH}%`,
                        }}
                        className={`absolute z-30 cursor-pointer rounded-lg border-2 border-red-500 bg-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-all ${
                          isSelected ? 'ring-4 ring-red-400 bg-red-500/35 scale-105 z-40' : 'hover:bg-red-500/30'
                        }`}
                      >
                        <div className="absolute -top-3 -left-1 px-1.5 py-0.5 rounded bg-red-600 text-white text-[9px] font-bold">
                          #{idx + 1}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
