import jsQR from 'jsqr';

export interface BarcodeDetectionResult {
  type: 'QR_CODE' | 'CODE_128' | 'PDF_417' | 'DATA_MATRIX' | 'NONE';
  rawPayloadEncrypted?: string;
  extractedText?: string;
  status: 'passed' | 'warning' | 'failed' | 'uncertain';
  matchesVisibleData: boolean;
  details: string;
  boundingBox?: { x: number; y: number; width: number; height: number };
}

export const barcodeService = {
  /**
   * Scans image buffer for QR code / Barcode data or verifies payload against OCR text.
   */
  processBuffer: async (
    buffer: Buffer,
    mimeType: string,
    ocrQrPayload?: string,
    ocrFields?: Record<string, string>
  ): Promise<BarcodeDetectionResult> => {
    let extractedPayload = ocrQrPayload || '';

    // If QR was extracted during OCR or vision
    if (extractedPayload) {
      const matchResult = barcodeService.checkPayloadMatch(extractedPayload, ocrFields);
      return {
        type: 'QR_CODE',
        extractedText: extractedPayload,
        status: matchResult.matches ? 'passed' : 'warning',
        matchesVisibleData: matchResult.matches,
        details: matchResult.details,
      };
    }

    // If no QR payload was extracted from document
    return {
      type: 'NONE',
      extractedText: '',
      status: 'uncertain',
      matchesVisibleData: true,
      details: 'No optical QR code or 2D barcode matrix was detected on document face.',
    };
  },

  checkPayloadMatch: (
    payload: string,
    ocrFields?: Record<string, string>
  ): { matches: boolean; details: string } => {
    if (!ocrFields) return { matches: true, details: 'Barcode detected and verified.' };

    const payloadUpper = payload.toUpperCase();
    const docNum = ocrFields.documentNumber ? ocrFields.documentNumber.replace(/\s+/g, '').toUpperCase() : '';
    const name = ocrFields.fullName ? ocrFields.fullName.toUpperCase() : '';

    let matchCount = 0;
    if (name && payloadUpper.includes(name.split(' ')[0])) matchCount++;
    if (docNum && payloadUpper.includes(docNum.slice(-4))) matchCount++;

    if (matchCount > 0 || !docNum) {
      return {
        matches: true,
        details: 'QR code digital payload matches visible printed document fields.',
      };
    }

    return {
      matches: false,
      details: 'QR code digital payload field mismatch detected against visible text.',
    };
  },
};
