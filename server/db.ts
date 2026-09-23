import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'docusentry_db.json');

// Interface Definitions matching Database Entities
export interface DbUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'user' | 'admin';
  organization?: string;
  avatarUrl?: string;
  avatar?: string;
  preferredLanguage: string;
  theme: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface DbRefreshToken {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: string;
  revokedAt?: string;
  createdAt: string;
  deviceInfo?: string;
  ipAddress?: string;
}

export interface DbDocument {
  id: string;
  publicId: string;
  ownerId: string;
  originalFileName: string;
  storageKey: string;
  mimeType: string;
  fileSize: number;
  checksum: string;
  pageCount: number;
  documentType: string;
  documentCategory: 'identity' | 'education' | 'employment' | 'financial' | 'government' | 'other';
  uploadSource: 'file' | 'camera' | 'sample';
  processingStatus: 'uploaded' | 'queued' | 'processing' | 'completed' | 'failed' | 'requires_review';
  createdAt: string;
  updatedAt: string;
}

export interface DbExtractedField {
  id: string;
  scanId: string;
  fieldName: string;
  label: string;
  valueEncrypted: string;
  maskedValue: string;
  confidence: 'High' | 'Medium' | 'Low';
  suspicious: boolean;
  source: string;
  pageNumber?: number;
  boundingBox?: { x: number; y: number; width: number; height: number };
  createdAt: string;
}

export interface DbBarcodeResult {
  id: string;
  scanId: string;
  type: 'QR_CODE' | 'CODE_128' | 'PDF_417' | 'DATA_MATRIX' | 'NONE';
  rawPayloadEncrypted?: string;
  extractedText?: string;
  status: 'passed' | 'warning' | 'failed' | 'uncertain';
  matchesVisibleData: boolean;
  details: string;
  boundingBox?: { x: number; y: number; width: number; height: number };
  createdAt: string;
}

export interface DbDocumentFinding {
  id: string;
  scanId: string;
  category: 'text' | 'layout' | 'photo' | 'signature' | 'seal' | 'qr' | 'date' | 'file';
  title: string;
  location: string;
  description: string;
  whyItMatters: string;
  confidence: 'High' | 'Medium' | 'Low';
  recommendedAction: string;
  severity: 'low' | 'medium' | 'high';
  x: number;
  y: number;
  width?: number;
  height?: number;
  pageNumber?: number;
  evidenceUrl?: string;
  createdAt: string;
}

export interface DbRiskFactor {
  id: string;
  scanId: string;
  factor: string;
  weight: number;
  contribution: number;
  explanation: string;
}

export interface DbScanResult {
  id: string;
  documentId: string;
  userId: string;
  timestamp: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  fileUrl?: string;
  documentType: string;
  documentCategory: 'identity' | 'education' | 'employment' | 'financial' | 'government' | 'other';
  identificationConfidence: 'High confidence' | 'Medium confidence' | 'Low confidence' | 'Manual selection';
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'uncertain';
  verdict: string;
  summary: string;
  processingTimeMs: number;
  modelVersion: string;
  reviewStatus: 'pending' | 'in_review' | 'reviewed' | 'dismissed';
  reviewedBy?: string;
  reviewDate?: string;
  adminNotes?: string[];
  maskedIdentifier: string;
  identifiedByUser?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DbAuditLog {
  id: string;
  timestamp: string;
  actor: string;
  actorId?: string;
  role: 'user' | 'admin';
  action: string;
  referenceId: string;
  resultSummary: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface DbComparison {
  id: string;
  userId: string;
  docAId: string;
  docBId: string;
  docAName: string;
  docBName: string;
  docAType?: string;
  docBType?: string;
  docASize?: string;
  docBSize?: string;
  docAMime?: string;
  docBMime?: string;
  docAHash?: string;
  docBHash?: string;
  docAUrl?: string;
  docBUrl?: string;
  comparisonStatus?: 'completed' | 'inconclusive';
  similarityScore: number | null;
  textSimilarity?: number | null;
  visualSimilarity?: number | null;
  layoutSimilarity?: number | null;
  structuralSimilarity?: number | null;
  differenceCount: number;
  verdict: string;
  summary?: string;
  createdAt: string;
}

export interface DbComparisonDifference {
  id: string;
  comparisonId: string;
  field: string;
  originalValue: string;
  submittedValue: string;
  category?: 'text' | 'visual' | 'layout' | 'added' | 'removed' | 'modified';
  severity: 'low' | 'medium' | 'high';
  description: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  pageNumber?: number;
}

export interface DbSchema {
  users: DbUser[];
  refreshTokens: DbRefreshToken[];
  documents: DbDocument[];
  scans: DbScanResult[];
  extractedFields: DbExtractedField[];
  barcodeResults: DbBarcodeResult[];
  findings: DbDocumentFinding[];
  riskFactors: DbRiskFactor[];
  auditLogs: DbAuditLog[];
  comparisons: DbComparison[];
  comparisonDifferences: DbComparisonDifference[];
}

// Initial Database Data
const DEFAULT_INITIAL_DB: DbSchema = {
  users: [
    {
      id: 'usr_demo_01',
      name: 'Ananya Sharma',
      email: 'ananya@example.com',
      // Default bcrypt password for 'password123'
      passwordHash: '$2a$10$wK1y30A.u6/uWb9p3i92l.D1Y6eJ8lGqP5Bv4R0Z9s5pQ2Y7n6C.y',
      role: 'user',
      preferredLanguage: 'en',
      theme: 'light',
      isActive: true,
      emailVerified: true,
      avatar: 'AS',
      createdAt: '2026-03-12T10:00:00.000Z',
      updatedAt: '2026-03-12T10:00:00.000Z',
    },
    {
      id: 'adm_demo_01',
      name: 'System Admin',
      email: 'admin@docusentry.io',
      // Default bcrypt password for 'admin123'
      passwordHash: '$2a$10$wK1y30A.u6/uWb9p3i92l.D1Y6eJ8lGqP5Bv4R0Z9s5pQ2Y7n6C.y',
      role: 'admin',
      preferredLanguage: 'en',
      theme: 'dark',
      isActive: true,
      emailVerified: true,
      avatar: 'SA',
      createdAt: '2026-01-01T08:00:00.000Z',
      updatedAt: '2026-01-01T08:00:00.000Z',
    },
  ],
  refreshTokens: [],
  documents: [],
  scans: [
    {
      id: 'SCN-2026-08912',
      documentId: 'doc_01',
      userId: 'usr_demo_01',
      timestamp: '2026-03-21T18:30:00.000Z',
      fileName: 'Aadhaar_Card_Verified.pdf',
      fileSize: '1.4 MB',
      fileType: 'application/pdf',
      documentType: 'Aadhaar Card',
      documentCategory: 'identity',
      identificationConfidence: 'High confidence',
      riskScore: 12,
      riskLevel: 'low',
      verdict: 'No significant issues detected.',
      summary: 'All structural, text alignment, and secure QR signature verification checks passed without anomalies.',
      processingTimeMs: 1240,
      modelVersion: 'v2.4-forensic-vision',
      reviewStatus: 'reviewed',
      reviewedBy: 'System Admin',
      reviewDate: '2026-03-21',
      adminNotes: ['Verified against national identity schema rules.'],
      maskedIdentifier: 'XXXX XXXX 8921',
      createdAt: '2026-03-21T18:30:00.000Z',
      updatedAt: '2026-03-21T18:30:00.000Z',
    },
    {
      id: 'SCN-2026-08913',
      documentId: 'doc_02',
      userId: 'usr_demo_01',
      timestamp: '2026-03-20T14:15:00.000Z',
      fileName: 'PAN_Card_Suspect.jpg',
      fileSize: '2.1 MB',
      fileType: 'image/jpeg',
      documentType: 'PAN Card',
      documentCategory: 'identity',
      identificationConfidence: 'High confidence',
      riskScore: 78,
      riskLevel: 'high',
      verdict: 'Several suspicious indicators were detected. Manual verification is recommended.',
      summary: 'Font kerning mismatch detected on PAN serial number. Microtext border artifacts suggest image editing software manipulation.',
      processingTimeMs: 1890,
      modelVersion: 'v2.4-forensic-vision',
      reviewStatus: 'pending',
      maskedIdentifier: 'ABCDE****F',
      createdAt: '2026-03-20T14:15:00.000Z',
      updatedAt: '2026-03-20T14:15:00.000Z',
    },
    {
      id: 'SCN-2026-08914',
      documentId: 'doc_03',
      userId: 'usr_demo_01',
      timestamp: '2026-03-19T09:45:00.000Z',
      fileName: 'Degree_Certificate_IITB.pdf',
      fileSize: '3.8 MB',
      fileType: 'application/pdf',
      documentType: 'Degree Certificate',
      documentCategory: 'education',
      identificationConfidence: 'High confidence',
      riskScore: 42,
      riskLevel: 'medium',
      verdict: 'Some information needs review.',
      summary: 'Embossed university seal contrast variance detected. Official QR code payload matches student name but issue year alignment requires review.',
      processingTimeMs: 1620,
      modelVersion: 'v2.4-forensic-vision',
      reviewStatus: 'in_review',
      reviewedBy: 'System Admin',
      reviewDate: '2026-03-19',
      adminNotes: ['Awaiting registrar verification reply.'],
      maskedIdentifier: 'IITB/2022/94821',
      createdAt: '2026-03-19T09:45:00.000Z',
      updatedAt: '2026-03-19T09:45:00.000Z',
    },
  ],
  extractedFields: [
    {
      id: 'ef_1',
      scanId: 'SCN-2026-08912',
      fieldName: 'fullName',
      label: 'Full Name',
      valueEncrypted: 'Ananya Sharma',
      maskedValue: 'Ananya Sharma',
      confidence: 'High',
      suspicious: false,
      source: 'OCR',
      createdAt: '2026-03-21T18:30:00.000Z',
    },
    {
      id: 'ef_2',
      scanId: 'SCN-2026-08912',
      fieldName: 'aadhaarNumber',
      label: 'Aadhaar Number',
      valueEncrypted: '9842 1049 8921',
      maskedValue: 'XXXX XXXX 8921',
      confidence: 'High',
      suspicious: false,
      source: 'QR Code',
      createdAt: '2026-03-21T18:30:00.000Z',
    },
    {
      id: 'ef_3',
      scanId: 'SCN-2026-08913',
      fieldName: 'panNumber',
      label: 'PAN Number',
      valueEncrypted: 'ABCDE1234F',
      maskedValue: 'ABCDE****F',
      confidence: 'Medium',
      suspicious: true,
      source: 'OCR',
      createdAt: '2026-03-20T14:15:00.000Z',
    },
  ],
  barcodeResults: [
    {
      id: 'bc_1',
      scanId: 'SCN-2026-08912',
      type: 'QR_CODE',
      extractedText: 'UIDAI:Ananya Sharma:DOB-14/08/1992:XXXX8921',
      status: 'passed',
      matchesVisibleData: true,
      details: 'Secure UIDAI digital signature payload verified successfully.',
      createdAt: '2026-03-21T18:30:00.000Z',
    },
    {
      id: 'bc_2',
      scanId: 'SCN-2026-08913',
      type: 'QR_CODE',
      extractedText: 'INCOMETAX:ABCDE1234F:ANANYA SHARMA',
      status: 'warning',
      matchesVisibleData: false,
      details: 'QR code date of birth payload differs from visible text printed date.',
      createdAt: '2026-03-20T14:15:00.000Z',
    },
  ],
  findings: [
    {
      id: 'f_1',
      scanId: 'SCN-2026-08913',
      category: 'text',
      title: 'Font Typography Variance',
      location: 'PAN Serial Number Box',
      description: 'The font kerning and stroke thickness in the serial number field deviate from standard Income Tax Department typography specifications.',
      whyItMatters: 'Altered typography is a strong indicator of digital text insertion or image manipulation.',
      confidence: 'High',
      recommendedAction: 'Request physical document verification or official NSDL API lookup.',
      severity: 'high',
      x: 48,
      y: 52,
      createdAt: '2026-03-20T14:15:00.000Z',
    },
    {
      id: 'f_2',
      scanId: 'SCN-2026-08914',
      category: 'seal',
      title: 'Embossed Seal Contrast Variance',
      location: 'Bottom Left Seal Stamp',
      description: 'Pixel gradient histogram shows unusual compression artifacts around the institutional watermark.',
      whyItMatters: 'Unusual compression boundary artifacts can occur when a seal is copied from another document.',
      confidence: 'Medium',
      recommendedAction: 'Verify directly with university records division.',
      severity: 'medium',
      x: 25,
      y: 78,
      createdAt: '2026-03-19T09:45:00.000Z',
    },
  ],
  riskFactors: [
    { id: 'rf_1', scanId: 'SCN-2026-08913', factor: 'Font Kerning Anomaly', weight: 40, contribution: 40, explanation: 'Inconsistent character spacing in serial field.' },
    { id: 'rf_2', scanId: 'SCN-2026-08913', factor: 'QR Payload Mismatch', weight: 38, contribution: 38, explanation: 'Visible birth date does not match decoded QR payload.' },
  ],
  auditLogs: [
    {
      id: 'aud_1',
      timestamp: new Date().toISOString(),
      actor: 'Ananya Sharma',
      actorId: 'usr_demo_01',
      role: 'user',
      action: 'Document Scan Completed',
      referenceId: 'SCN-2026-08912',
      resultSummary: 'Aadhaar Card verified with Risk Score 12/100.',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'aud_2',
      timestamp: new Date().toISOString(),
      actor: 'System Admin',
      actorId: 'adm_demo_01',
      role: 'admin',
      action: 'Review Queue Item Reviewed',
      referenceId: 'SCN-2026-08912',
      resultSummary: 'Marked scan as reviewed with confirmation note.',
      createdAt: new Date().toISOString(),
    },
  ],
  comparisons: [],
  comparisonDifferences: [],
};

class DatabaseRepository {
  private data: DbSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DbSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Failed to read database file, initializing defaults:', e);
    }
    this.saveData(DEFAULT_INITIAL_DB);
    return DEFAULT_INITIAL_DB;
  }

  private saveData(data: DbSchema): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {
      console.error('Failed to write database file:', e);
    }
  }

  // Helper for thread-safe memory/disk sync
  private persist() {
    this.saveData(this.data);
  }

  // --- USER OPERATIONS ---
  public getUsers(): DbUser[] {
    return this.data.users;
  }

  public getUserById(id: string): DbUser | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public getUserByEmail(email: string): DbUser | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public createUser(user: Omit<DbUser, 'id' | 'createdAt' | 'updatedAt'>): DbUser {
    const newUser: DbUser = {
      ...user,
      id: `${user.role === 'admin' ? 'adm' : 'usr'}_${crypto.randomBytes(4).toString('hex')}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.users.push(newUser);
    this.persist();
    return newUser;
  }

  public updateUser(id: string, updates: Partial<DbUser>): DbUser | undefined {
    const index = this.data.users.findIndex(u => u.id === id);
    if (index === -1) return undefined;
    this.data.users[index] = {
      ...this.data.users[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.persist();
    return this.data.users[index];
  }

  // --- REFRESH TOKEN OPERATIONS ---
  public createRefreshToken(token: Omit<DbRefreshToken, 'id' | 'createdAt'>): DbRefreshToken {
    const newToken: DbRefreshToken = {
      ...token,
      id: `rt_${crypto.randomBytes(8).toString('hex')}`,
      createdAt: new Date().toISOString(),
    };
    this.data.refreshTokens.push(newToken);
    this.persist();
    return newToken;
  }

  public getRefreshTokenByHash(tokenHash: string): DbRefreshToken | undefined {
    return this.data.refreshTokens.find(r => r.tokenHash === tokenHash && !r.revokedAt);
  }

  public revokeRefreshToken(id: string): void {
    const token = this.data.refreshTokens.find(r => r.id === id);
    if (token) {
      token.revokedAt = new Date().toISOString();
      this.persist();
    }
  }

  // --- DOCUMENT OPERATIONS ---
  public createDocument(doc: Omit<DbDocument, 'id' | 'createdAt' | 'updatedAt'>): DbDocument {
    const newDoc: DbDocument = {
      ...doc,
      id: `doc_${crypto.randomBytes(6).toString('hex')}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.documents.push(newDoc);
    this.persist();
    return newDoc;
  }

  public getDocumentById(id: string): DbDocument | undefined {
    return this.data.documents.find(d => d.id === id);
  }

  // --- SCAN OPERATIONS ---
  public getScans(): DbScanResult[] {
    return this.data.scans;
  }

  public getScanById(id: string): DbScanResult | undefined {
    return this.data.scans.find(s => s.id.toLowerCase() === id.toLowerCase());
  }

  public saveScan(scan: DbScanResult): DbScanResult {
    const index = this.data.scans.findIndex(s => s.id === scan.id);
    if (index >= 0) {
      this.data.scans[index] = { ...scan, updatedAt: new Date().toISOString() };
    } else {
      this.data.scans.unshift(scan);
    }
    this.persist();
    return scan;
  }

  public deleteScan(id: string): boolean {
    const initial = this.data.scans.length;
    this.data.scans = this.data.scans.filter(s => s.id !== id);
    this.data.findings = this.data.findings.filter(f => f.scanId !== id);
    this.data.extractedFields = this.data.extractedFields.filter(ef => ef.scanId !== id);
    this.data.barcodeResults = this.data.barcodeResults.filter(b => b.scanId !== id);
    this.persist();
    return this.data.scans.length < initial;
  }

  // --- EXTRACTED FIELDS & FINDINGS ---
  public getExtractedFieldsByScanId(scanId: string): DbExtractedField[] {
    return this.data.extractedFields.filter(f => f.scanId === scanId);
  }

  public saveExtractedFields(fields: DbExtractedField[]): void {
    this.data.extractedFields.push(...fields);
    this.persist();
  }

  public getFindingsByScanId(scanId: string): DbDocumentFinding[] {
    return this.data.findings.filter(f => f.scanId === scanId);
  }

  public saveFindings(findings: DbDocumentFinding[]): void {
    this.data.findings.push(...findings);
    this.persist();
  }

  public getBarcodeResultsByScanId(scanId: string): DbBarcodeResult[] {
    return this.data.barcodeResults.filter(b => b.scanId === scanId);
  }

  public saveBarcodeResults(barcodes: DbBarcodeResult[]): void {
    this.data.barcodeResults.push(...barcodes);
    this.persist();
  }

  public getRiskFactorsByScanId(scanId: string): DbRiskFactor[] {
    return this.data.riskFactors.filter(rf => rf.scanId === scanId);
  }

  public saveRiskFactors(factors: DbRiskFactor[]): void {
    this.data.riskFactors.push(...factors);
    this.persist();
  }

  // --- AUDIT LOGS ---
  public getAuditLogs(): DbAuditLog[] {
    return this.data.auditLogs;
  }

  public createAuditLog(log: Omit<DbAuditLog, 'id' | 'createdAt'>): DbAuditLog {
    const newLog: DbAuditLog = {
      ...log,
      id: `aud_${crypto.randomBytes(6).toString('hex')}`,
      createdAt: new Date().toISOString(),
    };
    this.data.auditLogs.unshift(newLog);
    this.persist();
    return newLog;
  }

  // --- COMPARISON OPERATIONS ---
  public createComparison(comp: DbComparison, diffs: DbComparisonDifference[]): DbComparison {
    this.data.comparisons.unshift(comp);
    this.data.comparisonDifferences.push(...diffs);
    this.persist();
    return comp;
  }

  public getComparisonById(id: string): { comparison?: DbComparison; differences: DbComparisonDifference[] } {
    const comparison = this.data.comparisons.find(c => c.id === id);
    const differences = this.data.comparisonDifferences.filter(d => d.comparisonId === id);
    return { comparison, differences };
  }
}

export const db = new DatabaseRepository();
