import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export interface StoredFile {
  storageKey: string;
  filePath: string;
  originalFileName: string;
  mimeType: string;
  fileSize: number;
  checksum: string;
}

export const storageService = {
  /**
   * Validates file size, extension, and magic bytes for security.
   */
  validateFile: (buffer: Buffer, fileName: string): { valid: boolean; mimeType: string; error?: string } => {
    const maxSizeBytes = 25 * 1024 * 1024; // 25MB
    if (!buffer || buffer.length === 0) {
      return { valid: false, mimeType: '', error: 'Uploaded file is empty.' };
    }

    if (buffer.length > maxSizeBytes) {
      return { valid: false, mimeType: '', error: 'File exceeds 25 MB size limit.' };
    }

    // Check Magic Bytes
    let detectedMime = '';
    const hex = buffer.toString('hex', 0, 4).toUpperCase();

    if (hex.startsWith('25504446')) {
      detectedMime = 'application/pdf';
    } else if (hex.startsWith('89504E47')) {
      detectedMime = 'image/png';
    } else if (hex.startsWith('FFD8FF')) {
      detectedMime = 'image/jpeg';
    } else if (buffer.toString('utf8', 8, 12) === 'WEBP') {
      detectedMime = 'image/webp';
    } else {
      // Fallback check extension if signature is ambiguous
      const ext = path.extname(fileName).toLowerCase();
      if (['.jpg', '.jpeg'].includes(ext)) detectedMime = 'image/jpeg';
      else if (ext === '.png') detectedMime = 'image/png';
      else if (ext === '.pdf') detectedMime = 'application/pdf';
      else if (ext === '.webp') detectedMime = 'image/webp';
    }

    if (!detectedMime) {
      return {
        valid: false,
        mimeType: '',
        error: 'Invalid or unsupported file format. Please upload PDF, JPG, JPEG, PNG, or WEBP.',
      };
    }

    return { valid: true, mimeType: detectedMime };
  },

  /**
   * Saves file buffer to object storage / uploads directory and computes SHA-256 checksum.
   */
  saveFile: (buffer: Buffer, originalFileName: string, mimeType: string): StoredFile => {
    const checksum = crypto.createHash('sha256').update(buffer).digest('hex');
    const ext = path.extname(originalFileName) || '.bin';
    const storageKey = `${Date.now()}_${crypto.randomBytes(8).toString('hex')}${ext}`;
    const filePath = path.join(UPLOAD_DIR, storageKey);

    fs.writeFileSync(filePath, buffer);

    return {
      storageKey,
      filePath,
      originalFileName,
      mimeType,
      fileSize: buffer.length,
      checksum,
    };
  },

  getFileBuffer: (storageKey: string): Buffer | null => {
    try {
      const filePath = path.join(UPLOAD_DIR, storageKey);
      if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath);
      }
    } catch (e) {
      console.error('Error reading file from storage:', e);
    }
    return null;
  },
};
