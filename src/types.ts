export type Theme = 'light' | 'dark' | 'system';

export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organization?: string;
  createdAt: string;
  avatar?: string;
}

export type RiskLevel = 'low' | 'medium' | 'high' | 'uncertain';

export type CheckStatus = 'passed' | 'warning' | 'failed' | 'uncertain' | 'info';

export type ReviewStatus = 'pending' | 'in_review' | 'reviewed' | 'dismissed';

export interface DocumentIssue {
  id: string;
  title: string;
  category: 'text' | 'layout' | 'photo' | 'signature' | 'seal' | 'qr' | 'date' | 'file';
  location: string;
  description: string;
  whyItMatters: string;
  confidence: 'High' | 'Medium' | 'Low';
  recommendedAction: string;
  x: number; // percentage on document 0-100
  y: number; // percentage on document 0-100
  width?: number; // percentage on document width 0-100
  height?: number; // percentage on document height 0-100
  severity: 'low' | 'medium' | 'high';
}

export interface CheckItem {
  id: string;
  name: string;
  status: CheckStatus;
  confidence: 'High' | 'Medium' | 'Low';
  summary: string;
  details?: string;
  iconName?: string;
}

export interface QRBarcodeResult {
  detected: boolean;
  type?: 'QR_CODE' | 'CODE_128' | 'PDF_417' | 'DATA_MATRIX' | 'NONE';
  status: 'passed' | 'warning' | 'failed' | 'uncertain';
  statusLabel: string;
  extractedText?: string;
  matchesVisibleData: boolean;
  details: string;
}

export interface ExtractedField {
  id?: string;
  fieldName?: string;
  label: string;
  value: string;
  maskedValue?: string;
  isMasked?: boolean;
  confidence?: 'High' | 'Medium' | 'Low' | number;
  suspicious?: boolean;
  source?: string;
  pageNumber?: number;
  boundingBox?: { x: number; y: number; width: number; height: number };
}

export interface ScanResult {
  id: string; // DOC-2026-XXXXXX
  timestamp: string;
  fileName: string;
  fileSize: string | number;
  fileType: string;
  fileUrl?: string;
  documentType: string; // "PAN Card", "Aadhaar Card", etc.
  documentCategory: 'identity' | 'education' | 'certificate' | 'employment' | 'government' | 'financial' | 'other' | 'unknown';
  identificationConfidence: 'High confidence' | 'Medium confidence' | 'Low confidence' | 'Uncertain' | string | number;
  identifiedByUser?: boolean;
  originalIdentifiedType?: string;
  maskedIdentifier: string; // e.g. "XXXX XXXX 8921" or "ABCDE****F"
  riskScore: number | null; // 0-100 or null if processing/uncertain
  riskLevel: RiskLevel;
  verdict: string; // "No significant issues detected.", "Some information needs review", etc.
  summary: string;
  extractedFields: ExtractedField[];
  checks: CheckItem[];
  findings: DocumentIssue[];
  qrResult: QRBarcodeResult | null;
  reviewStatus?: ReviewStatus;
  adminNotes?: string[];
  reviewDate?: string | null;
  reviewedBy?: string | null;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string; // Name or email
  role: UserRole;
  action: string;
  referenceId?: string;
  resultSummary: string;
}

export interface ComparisonResult {
  id: string;
  timestamp: string;
  originalFileName: string;
  submittedFileName: string;
  differencesCount: number;
  differences: {
    id: string;
    field: string;
    originalValue: string;
    submittedValue: string;
    severity: 'high' | 'medium' | 'low';
    description: string;
    x: number;
    y: number;
  }[];
  verdict: string;
}
