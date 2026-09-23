import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { DbComparison, DbComparisonDifference, db } from '../db';
import { ocrService } from './ocrService';
import { storageService } from './storage';
import { visionForensics } from './visionForensics';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

export const comparisonService = {
  compareDocuments: async (
    userId: string,
    fileABuffer: Buffer,
    fileAName: string,
    fileAMime: string,
    fileBBuffer: Buffer,
    fileBName: string,
    fileBMime: string
  ): Promise<{ comparison: DbComparison; differences: DbComparisonDifference[] }> => {
    // 1. Calculate SHA-256 hashes
    const docAHash = crypto.createHash('sha256').update(fileABuffer).digest('hex');
    const docBHash = crypto.createHash('sha256').update(fileBBuffer).digest('hex');

    // 2. Save raw uploaded files
    const storedA = storageService.saveFile(fileABuffer, fileAName, fileAMime);
    const storedB = storageService.saveFile(fileBBuffer, fileBName, fileBMime);

    let docAUrl = `/uploads/${storedA.storageKey}`;
    let docBUrl = `/uploads/${storedB.storageKey}`;

    const formatSize = (bytes: number) => {
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    const docASize = formatSize(fileABuffer.length);
    const docBSize = formatSize(fileBBuffer.length);
    const comparisonId = `CMP-2026-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    // 3. Rasterize both documents to high-resolution PNG for rendering & computer vision
    const rasterA = await visionForensics.rasterizeDocument(fileABuffer, fileAMime, fileAName);
    const rasterB = await visionForensics.rasterizeDocument(fileBBuffer, fileBMime, fileBName);

    // If PDF or image needs a preview image served, save preview PNG
    if (rasterA.isPdf || !fileAMime.startsWith('image/')) {
      const prevKeyA = `prev_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.png`;
      fs.writeFileSync(path.join(UPLOAD_DIR, prevKeyA), rasterA.pngBuffer);
      docAUrl = `/uploads/${prevKeyA}`;
    }
    if (rasterB.isPdf || !fileBMime.startsWith('image/')) {
      const prevKeyB = `prev_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.png`;
      fs.writeFileSync(path.join(UPLOAD_DIR, prevKeyB), rasterB.pngBuffer);
      docBUrl = `/uploads/${prevKeyB}`;
    }

    // 4. Check for byte-for-byte identical files
    if (docAHash === docBHash) {
      const comp: DbComparison = {
        id: comparisonId,
        userId,
        docAId: `doc_a_${Date.now()}`,
        docBId: `doc_b_${Date.now()}`,
        docAName: fileAName,
        docBName: fileBName,
        docAType: 'Reference Document',
        docBType: 'Comparison Document',
        docASize,
        docBSize,
        docAMime: fileAMime,
        docBMime: fileBMime,
        docAHash,
        docBHash,
        docAUrl,
        docBUrl,
        comparisonStatus: 'completed',
        similarityScore: 100,
        textSimilarity: 100,
        visualSimilarity: 100,
        layoutSimilarity: 100,
        structuralSimilarity: 100,
        differenceCount: 0,
        verdict: 'Identical Files — Document A and Document B are completely identical.',
        summary: 'No textual, visual, or layout changes were detected between the two uploaded files.',
        createdAt: new Date().toISOString(),
      };

      db.createComparison(comp, []);
      return { comparison: comp, differences: [] };
    }

    // 5. OCR Text Extraction for semantic cross-referencing
    let ocrA = { fullText: '' };
    let ocrB = { fullText: '' };
    try {
      [ocrA, ocrB] = await Promise.all([
        ocrService.processDocument(fileABuffer, fileAMime, fileAName),
        ocrService.processDocument(fileBBuffer, fileBMime, fileBName),
      ]);
    } catch (e) {
      console.warn('OCR processing error during comparison:', e);
    }

    // 6. Universal Computer Vision Document Comparison
    // Aligns, normalizes brightness, suppresses anti-aliasing noise, isolates real modified regions
    const visionComp = await visionForensics.compareDocumentsPrecise(
      rasterA,
      rasterB,
      comparisonId,
      fileAName,
      fileBName,
      ocrA.fullText,
      ocrB.fullText
    );

    const differences: DbComparisonDifference[] = visionComp.differences.map(d => ({
      id: d.id,
      comparisonId,
      field: d.field,
      originalValue: d.originalValue,
      submittedValue: d.submittedValue,
      category: d.category,
      severity: d.severity,
      description: d.description,
      x: d.x,
      y: d.y,
      width: d.width,
      height: d.height,
      pageNumber: d.pageNumber,
    }));

    const comp: DbComparison = {
      id: comparisonId,
      userId,
      docAId: `doc_a_${Date.now()}`,
      docBId: `doc_b_${Date.now()}`,
      docAName: fileAName,
      docBName: fileBName,
      docAType: 'Reference Document',
      docBType: 'Comparison Document',
      docASize,
      docBSize,
      docAMime: fileAMime,
      docBMime: fileBMime,
      docAHash,
      docBHash,
      docAUrl,
      docBUrl,
      comparisonStatus: 'completed',
      similarityScore: visionComp.overallSimilarity,
      textSimilarity: visionComp.textSimilarity,
      visualSimilarity: visionComp.visualSimilarity,
      layoutSimilarity: visionComp.layoutSimilarity,
      structuralSimilarity: visionComp.structuralSimilarity,
      differenceCount: differences.length,
      verdict: visionComp.verdict,
      summary: visionComp.summary,
      createdAt: new Date().toISOString(),
    };

    db.createComparison(comp, differences);
    return { comparison: comp, differences };
  },
};
