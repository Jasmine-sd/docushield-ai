import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { DbScanResult, DbDocumentFinding, DbExtractedField, DbBarcodeResult } from '../db';

export const pdfReportService = {
  generatePdfReport: async (
    scan: DbScanResult,
    fields: DbExtractedField[],
    findings: DbDocumentFinding[],
    barcodes: DbBarcodeResult[]
  ): Promise<Uint8Array> => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
    const { width, height } = page.getSize();

    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Header Band
    page.drawRectangle({
      x: 0,
      y: height - 80,
      width,
      height: 80,
      color: rgb(0.705, 0.137, 0.235), // DOCUSENTRY Burgundy #B4233C
    });

    page.drawText('DOCUSENTRY', {
      x: 40,
      y: height - 45,
      size: 22,
      font: fontBold,
      color: rgb(1, 1, 1),
    });

    page.drawText('FORENSIC VERIFICATION REPORT', {
      x: 40,
      y: height - 65,
      size: 10,
      font: fontRegular,
      color: rgb(0.95, 0.95, 0.95),
    });

    let y = height - 110;

    // Report Summary Box
    page.drawRectangle({
      x: 40,
      y: y - 80,
      width: width - 80,
      height: 85,
      color: rgb(0.97, 0.95, 0.94),
      borderColor: rgb(0.84, 0.72, 0.68),
      borderWidth: 1,
    });

    page.drawText(`Scan ID: ${scan.id}`, { x: 55, y: y - 20, size: 12, font: fontBold, color: rgb(0.09, 0.12, 0.2) });
    page.drawText(`Document Type: ${scan.documentType}`, { x: 55, y: y - 40, size: 10, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
    page.drawText(`Scan Timestamp: ${new Date(scan.createdAt).toLocaleString()}`, { x: 55, y: y - 58, size: 10, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });

    // Risk Score Pill
    const isHigh = scan.riskLevel === 'high';
    const isMed = scan.riskLevel === 'medium';
    const isUncertain = scan.riskLevel === 'uncertain' || scan.riskScore === null || scan.riskScore === undefined;

    page.drawRectangle({
      x: width - 210,
      y: y - 65,
      width: 155,
      height: 50,
      color: isHigh ? rgb(0.98, 0.85, 0.88) : isMed ? rgb(0.99, 0.94, 0.85) : isUncertain ? rgb(0.95, 0.95, 0.97) : rgb(0.85, 0.95, 0.9),
      borderColor: isHigh ? rgb(0.74, 0.07, 0.23) : isMed ? rgb(0.85, 0.46, 0.02) : isUncertain ? rgb(0.4, 0.4, 0.45) : rgb(0.05, 0.46, 0.43),
      borderWidth: 1.5,
    });

    const scoreDisplay = scan.riskScore !== null && scan.riskScore !== undefined ? `${scan.riskScore}/100` : 'Not available';
    page.drawText(`RISK SCORE: ${scoreDisplay}`, {
      x: width - 195,
      y: y - 35,
      size: 11,
      font: fontBold,
      color: isHigh ? rgb(0.74, 0.07, 0.23) : isMed ? rgb(0.85, 0.46, 0.02) : isUncertain ? rgb(0.3, 0.3, 0.35) : rgb(0.05, 0.46, 0.43),
    });

    page.drawText(`LEVEL: ${(scan.riskLevel || 'UNCERTAIN').toUpperCase()}`, {
      x: width - 195,
      y: y - 52,
      size: 10,
      font: fontBold,
      color: isHigh ? rgb(0.74, 0.07, 0.23) : isMed ? rgb(0.85, 0.46, 0.02) : isUncertain ? rgb(0.3, 0.3, 0.35) : rgb(0.05, 0.46, 0.43),
    });

    y -= 115;

    // Verdict Section
    page.drawText('VERDICT & SUMMARY', { x: 40, y, size: 12, font: fontBold, color: rgb(0.09, 0.12, 0.2) });
    y -= 18;
    page.drawText(scan.verdict || 'Unable to determine document authenticity.', { x: 40, y, size: 11, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
    y -= 16;
    page.drawText(scan.summary || 'Document analysis completed.', { x: 40, y, size: 9.5, font: fontRegular, color: rgb(0.3, 0.3, 0.3) });

    y -= 35;

    // QR Verification Section
    const qrBarcode = barcodes.find(b => b.type === 'QR_CODE');
    page.drawText('QR CODE / DIGITAL SIGNATURE VERIFICATION', { x: 40, y, size: 12, font: fontBold, color: rgb(0.09, 0.12, 0.2) });
    y -= 18;
    if (!qrBarcode || qrBarcode.type === 'NONE' || qrBarcode.status === 'uncertain') {
      page.drawText('QR Verification: Not performed / unavailable (No optical QR payload detected on document)', {
        x: 50,
        y,
        size: 9.5,
        font: fontRegular,
        color: rgb(0.4, 0.4, 0.45),
      });
    } else {
      page.drawText(`QR Verification Status: ${qrBarcode.status.toUpperCase()} | ${qrBarcode.details}`, {
        x: 50,
        y,
        size: 9.5,
        font: fontRegular,
        color: qrBarcode.status === 'passed' ? rgb(0.05, 0.46, 0.43) : rgb(0.74, 0.07, 0.23),
      });
    }

    y -= 30;

    // Extracted Identity Fields
    page.drawText('EXTRACTED DOCUMENT FIELDS', { x: 40, y, size: 12, font: fontBold, color: rgb(0.09, 0.12, 0.2) });
    y -= 20;

    fields.forEach(field => {
      page.drawText(`• ${field.label}: `, { x: 50, y, size: 10, font: fontBold, color: rgb(0.2, 0.2, 0.2) });
      page.drawText(`${field.maskedValue}`, { x: 200, y, size: 10, font: fontRegular, color: rgb(0.1, 0.1, 0.1) });
      y -= 16;
    });

    y -= 25;

    // Findings Section
    page.drawText(`FORENSIC ANOMALY FINDINGS (${findings.length})`, { x: 40, y, size: 12, font: fontBold, color: rgb(0.09, 0.12, 0.2) });
    y -= 20;

    if (findings.length === 0) {
      page.drawText('No anomaly indicators detected. Document structure conforms to standard issuer templates.', {
        x: 50,
        y,
        size: 10,
        font: fontRegular,
        color: rgb(0.05, 0.46, 0.43),
      });
      y -= 20;
    } else {
      findings.forEach(finding => {
        page.drawText(`[${finding.severity.toUpperCase()}] ${finding.title}`, {
          x: 50,
          y,
          size: 10,
          font: fontBold,
          color: finding.severity === 'high' ? rgb(0.74, 0.07, 0.23) : rgb(0.85, 0.46, 0.02),
        });
        y -= 14;
        page.drawText(`Location: ${finding.location} | Description: ${finding.description}`, {
          x: 60,
          y,
          size: 9,
          font: fontRegular,
          color: rgb(0.3, 0.3, 0.3),
        });
        y -= 18;
      });
    }

    // Footer Audit Sign-off
    page.drawLine({
      start: { x: 40, y: 50 },
      end: { x: width - 40, y: 50 },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    });

    page.drawText('DOCUSENTRY Real-Time Forensic Verification System • Official Audit Certificate', {
      x: 40,
      y: 35,
      size: 8,
      font: fontRegular,
      color: rgb(0.5, 0.5, 0.5),
    });

    return await pdfDoc.save();
  },
};
