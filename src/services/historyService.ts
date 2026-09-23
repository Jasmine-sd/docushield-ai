import { ScanResult, AuditLog } from '../types';
import { INITIAL_DEMO_SCANS, INITIAL_AUDIT_LOGS } from '../data/mockData';
import { apiClient } from './apiClient';

const SCANS_STORAGE_KEY = 'docusentry_scans';
const AUDIT_STORAGE_KEY = 'docusentry_audit_logs';

export const historyService = {
  getScans: (): ScanResult[] => {
    // Try localStorage cache immediately for fast render, sync with API in background
    const raw = localStorage.getItem(SCANS_STORAGE_KEY);
    let cached: ScanResult[] = [];
    if (raw) {
      try { cached = JSON.parse(raw); } catch { cached = INITIAL_DEMO_SCANS; }
    } else {
      cached = INITIAL_DEMO_SCANS;
    }

    // Async sync with real backend DB
    apiClient.get<ScanResult[]>('/scans').then(res => {
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        localStorage.setItem(SCANS_STORAGE_KEY, JSON.stringify(res.data));
      }
    });

    return cached;
  },

  getScanById: (id: string): ScanResult | undefined => {
    const scans = historyService.getScans();
    return scans.find(s => s.id.toLowerCase() === id.toLowerCase());
  },

  saveScan: (scan: ScanResult): void => {
    const scans = historyService.getScans();
    const existingIndex = scans.findIndex(s => s.id === scan.id);
    let updated: ScanResult[];
    if (existingIndex >= 0) {
      updated = [...scans];
      updated[existingIndex] = scan;
    } else {
      updated = [scan, ...scans];
    }
    localStorage.setItem(SCANS_STORAGE_KEY, JSON.stringify(updated));
  },

  updateReviewStatus: (
    id: string,
    status: 'pending' | 'in_review' | 'reviewed' | 'dismissed',
    adminName: string,
    note?: string
  ): ScanResult | null => {
    // Update real backend DB
    apiClient.patch(`/admin/reviews/${id}`, { status, note });

    const scans = historyService.getScans();
    const index = scans.findIndex(s => s.id === id);
    if (index === -1) return null;

    const target = { ...scans[index] };
    target.reviewStatus = status;
    target.reviewedBy = adminName;
    target.reviewDate = new Date().toISOString().split('T')[0];
    if (note && note.trim()) {
      target.adminNotes = [...(target.adminNotes || []), note.trim()];
    }

    scans[index] = target;
    localStorage.setItem(SCANS_STORAGE_KEY, JSON.stringify(scans));

    // Audit trail log
    auditService.logAction({
      actor: adminName,
      role: 'admin',
      action: `Review Status: ${status}`,
      referenceId: id,
      resultSummary: `Document marked as ${status}${note ? ` with note: "${note.substring(0, 35)}..."` : ''}`,
    });

    return target;
  },

  deleteScan: (id: string): boolean => {
    apiClient.delete(`/scans/${id}`);
    const scans = historyService.getScans();
    const filtered = scans.filter(s => s.id !== id);
    localStorage.setItem(SCANS_STORAGE_KEY, JSON.stringify(filtered));
    return true;
  },

  clearHistory: (): void => {
    localStorage.setItem(SCANS_STORAGE_KEY, JSON.stringify([]));
  },

  resetDemoData: (): void => {
    localStorage.setItem(SCANS_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_SCANS));
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(INITIAL_AUDIT_LOGS));
  },
};

export const auditService = {
  getLogs: (): AuditLog[] => {
    const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
    let cached: AuditLog[] = [];
    if (raw) {
      try { cached = JSON.parse(raw); } catch { cached = INITIAL_AUDIT_LOGS; }
    } else {
      cached = INITIAL_AUDIT_LOGS;
    }

    apiClient.get<AuditLog[]>('/admin/audit-logs').then(res => {
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(res.data));
      }
    });

    return cached;
  },

  logAction: (log: Omit<AuditLog, 'id' | 'timestamp'>): void => {
    const logs = auditService.getLogs();
    const newLog: AuditLog = {
      ...log,
      id: `aud_${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify([newLog, ...logs]));
  },
};
