import { z } from 'zod';
import { ScanResult, ExtractedField, CheckItem, DocumentIssue, QRBarcodeResult } from '../types';

export function normalizeScanResult(raw: any): ScanResult {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Scan result data payload is missing or invalid.');
  }

  const id = String(raw.id || raw.scan_id || raw.scanId || `SCN-${Date.now()}`);
  const timestamp = String(raw.timestamp || raw.created_at || raw.createdAt || new Date().toISOString());
  const fileName = String(raw.fileName || raw.file_name || raw.originalFileName || raw.original_file_name || 'document_scan.pdf');

  let fileSize: string | number = raw.fileSize || raw.file_size || '1.0 MB';
  if (typeof fileSize === 'number') {
    fileSize = fileSize > 1024 * 1024 ? `${(fileSize / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(fileSize / 1024)} KB`;
  }

  const fileType = String(raw.fileType || raw.file_type || raw.mimeType || raw.mime_type || 'application/pdf');
  const fileUrl = raw.fileUrl || raw.file_url || raw.storageKey || '';
  const documentType = String(raw.documentType || raw.document_type || 'Document');
  const documentCategory = (raw.documentCategory || raw.document_category || 'identity') as any;

  let identificationConfidence = raw.identificationConfidence || raw.identification_confidence || 'High confidence';
  if (typeof identificationConfidence === 'number') {
    identificationConfidence =
      identificationConfidence > 0.8
        ? 'High confidence'
        : identificationConfidence > 0.5
        ? 'Medium confidence'
        : 'Low confidence';
  }

  const maskedIdentifier = String(raw.maskedIdentifier || raw.masked_identifier || 'XXXX-****');

  let riskScore: number | null = null;
  if (raw.riskScore !== undefined && raw.riskScore !== null) {
    riskScore = Number(raw.riskScore);
  } else if (raw.risk_score !== undefined && raw.risk_score !== null) {
    riskScore = Number(raw.risk_score);
  }

  let riskLevel = (raw.riskLevel || raw.risk_level) as any;
  if (!riskLevel || riskLevel === 'unknown') {
    if (riskScore === null) riskLevel = 'uncertain';
    else if (riskScore > 60) riskLevel = 'high';
    else if (riskScore > 30) riskLevel = 'medium';
    else riskLevel = 'low';
  }

  const verdict = String(
    raw.verdict ||
      (riskLevel === 'high'
        ? 'High risk of alteration'
        : riskLevel === 'uncertain'
        ? 'Unable to determine authenticity'
        : 'No significant issues detected.')
  );

  const summary = String(raw.summary || 'Document analysis completed.');

  const rawFields = Array.isArray(raw.extractedFields || raw.extracted_fields)
    ? raw.extractedFields || raw.extracted_fields
    : [];

  const extractedFields: ExtractedField[] = rawFields.map((f: any, idx: number) => ({
    id: f.id || `ef_${idx}`,
    fieldName: f.fieldName || f.field_name || f.label || `field_${idx}`,
    label: f.label || f.fieldName || f.field_name || `Field ${idx + 1}`,
    value: String(f.value || f.maskedValue || f.masked_value || ''),
    maskedValue: String(f.maskedValue || f.masked_value || f.value || ''),
    confidence: typeof f.confidence === 'number' ? (f.confidence > 0.8 ? 'High' : 'Medium') : f.confidence || 'High',
    suspicious: !!f.suspicious,
    source: f.source || 'ocr',
    pageNumber: f.pageNumber || f.page_number || 1,
    boundingBox: f.boundingBox || f.bounding_box || { x: 0, y: 0, width: 0, height: 0 },
  }));

  const rawChecks = Array.isArray(raw.checks) ? raw.checks : [];
  const checks: CheckItem[] = rawChecks.map((c: any, idx: number) => ({
    id: c.id || `chk_${idx}`,
    name: c.name || c.check_name || `Check ${idx + 1}`,
    status: c.status === 'unavailable' ? 'info' : c.status || 'passed',
    confidence: c.confidence || 'High',
    summary: c.message || c.summary || c.details || 'Verification check executed.',
    details: c.details || c.message || 'Check completed.',
  }));

  const rawFindings = Array.isArray(raw.findings) ? raw.findings : [];
  const findings: DocumentIssue[] = rawFindings.map((f: any, idx: number) => ({
    id: f.id || `f_${idx}`,
    category: f.category || 'text',
    title: f.title || 'Anomaly Detected',
    location: f.location || 'Document Surface',
    description: f.description || 'Variance detected during forensic scan.',
    whyItMatters: f.whyItMatters || f.why_it_matters || 'Authentic credentials maintain strict typographic kerning.',
    confidence: typeof f.confidence === 'number' ? (f.confidence > 0.8 ? 'High' : 'Medium') : f.confidence || 'High',
    recommendedAction: f.recommendedAction || f.recommended_action || 'Inspect physical document.',
    severity: f.severity || 'medium',
    x: typeof f.x === 'number' ? f.x : 50,
    y: typeof f.y === 'number' ? f.y : 50,
    width: typeof f.width === 'number' ? f.width : 22,
    height: typeof f.height === 'number' ? f.height : 12,
  }));

  const rawQr = raw.qrResult || raw.qr_result;
  let qrResult: QRBarcodeResult | null = null;
  if (rawQr && typeof rawQr === 'object' && (rawQr.detected || rawQr.type !== 'NONE')) {
    qrResult = {
      detected: true,
      type: rawQr.type || 'QR_CODE',
      status: rawQr.status === 'decoded' ? 'passed' : rawQr.status || 'passed',
      statusLabel:
        rawQr.statusLabel ||
        rawQr.status_label ||
        (rawQr.status === 'failed' ? 'Payload Invalid' : 'Verified QR Signature'),
      matchesVisibleData: rawQr.matchesVisibleData ?? rawQr.matches_visible_data ?? true,
      details: rawQr.details || '2D Barcode decoded.',
      extractedText: rawQr.extractedText || rawQr.extracted_text || rawQr.rawPayload || '',
    };
  }

  const reviewStatus = raw.reviewStatus || raw.review_status || 'pending';
  const adminNotes = Array.isArray(raw.adminNotes || raw.admin_notes) ? raw.adminNotes || raw.admin_notes : [];
  const reviewDate = raw.reviewDate || raw.review_date || null;
  const reviewedBy = raw.reviewedBy || raw.reviewed_by || null;

  return {
    id,
    timestamp,
    fileName,
    fileSize,
    fileType,
    fileUrl,
    documentType,
    documentCategory,
    identificationConfidence,
    maskedIdentifier,
    riskScore,
    riskLevel,
    verdict,
    summary,
    extractedFields: extractedFields || [],
    checks: checks || [],
    findings: findings || [],
    qrResult,
    reviewStatus,
    adminNotes,
    reviewDate,
    reviewedBy,
  };
}

export function normalizeScanHistory(rawPayload: unknown): {
  scans: ScanResult[];
  pagination?: { page: number; pageSize: number; total: number; totalPages: number };
} {
  if (!rawPayload) return { scans: [] };

  let rawList: any[] = [];
  let pagination: any = undefined;

  if (Array.isArray(rawPayload)) {
    rawList = rawPayload;
  } else if (typeof rawPayload === 'object' && rawPayload !== null) {
    const dataObj = (rawPayload as any).data ?? rawPayload;
    if (Array.isArray(dataObj)) {
      rawList = dataObj;
    } else if (dataObj && typeof dataObj === 'object') {
      if (Array.isArray(dataObj.items)) {
        rawList = dataObj.items;
      } else if (Array.isArray(dataObj.scans)) {
        rawList = dataObj.scans;
      }
      if (dataObj.pagination) {
        pagination = dataObj.pagination;
      }
    }
  }

  const scans: ScanResult[] = [];
  for (const item of rawList) {
    try {
      if (item && typeof item === 'object') {
        const normalized = normalizeScanResult(item);
        scans.push(normalized);
      }
    } catch (e) {
      console.warn('Skipping unparseable history item:', item, e);
    }
  }

  return { scans, pagination };
}

// Zod Schemas for runtime contract validation
export const ProcessingScanSchema = z.object({
  status: z.literal('processing'),
  stage: z.string().optional(),
  progress: z.number().optional(),
});

export const FailedScanSchema = z.object({
  status: z.literal('failed'),
  error: z.object({
    code: z.string().optional(),
    message: z.string().optional(),
  }).optional(),
});

export const CompletedScanSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  fileName: z.string(),
  fileSize: z.union([z.string(), z.number()]),
  fileType: z.string(),
  documentType: z.string(),
  documentCategory: z.string(),
  identificationConfidence: z.union([z.string(), z.number()]),
  riskScore: z.number().nullable(),
  riskLevel: z.enum(['low', 'medium', 'high', 'uncertain']),
  verdict: z.string(),
  summary: z.string(),
  extractedFields: z.array(z.any()),
  checks: z.array(z.any()),
  findings: z.array(z.any()),
  qrResult: z.any().nullable().optional(),
});

export const ReviewRequiredScanSchema = z.object({
  status: z.literal('requires_review'),
  riskScore: z.number().nullable().optional(),
  riskLevel: z.string().optional(),
  verdict: z.string().optional(),
  summary: z.string().optional(),
  extractedFields: z.array(z.any()).default([]),
  checks: z.array(z.any()).default([]),
  findings: z.array(z.any()).default([]),
  qrResult: z.any().nullable().optional(),
});

export function validateAndNormalizeScanResponse(rawPayload: unknown): {
  status: 'processing' | 'failed' | 'requires_review' | 'completed' | 'invalid';
  scan?: ScanResult;
  processingInfo?: { stage?: string; progress?: number };
  error?: string;
} {
  if (!rawPayload || typeof rawPayload !== 'object') {
    return { status: 'invalid', error: 'Response payload is empty or invalid.' };
  }

  const rawData = (rawPayload as any).data ?? rawPayload;

  // 1. Check if scan is processing
  if (rawData.status === 'processing') {
    return {
      status: 'processing',
      processingInfo: { stage: rawData.stage || 'OCR Processing...', progress: rawData.progress || 50 },
    };
  }

  // 2. Check if processing failed
  if (rawData.status === 'failed' || rawData.processingStatus === 'failed') {
    return {
      status: 'failed',
      error: rawData.error?.message || rawData.summary || 'Document analysis could not be completed.',
    };
  }

  // 3. Normalize scan result
  try {
    const scan = normalizeScanResult(rawData);

    if (rawData.status === 'requires_review' || scan.riskLevel === 'uncertain' || scan.riskScore === null) {
      return { status: 'requires_review', scan };
    }

    return { status: 'completed', scan };
  } catch (err: any) {
    console.error('Scan normalization error:', err);
    return { status: 'invalid', error: err.message || 'Verification result data format is incomplete.' };
  }
}
