import { DbDocumentFinding, DbRiskFactor } from '../db';

export interface RiskEngineOutput {
  riskScore: number; // 0 to 100
  riskLevel: 'low' | 'medium' | 'high' | 'uncertain';
  verdict: string;
  summary: string;
  riskFactors: DbRiskFactor[];
}

export const riskEngine = {
  calculate: (
    scanId: string,
    findings: DbDocumentFinding[],
    ocrConfidence: number,
    qrMatches: boolean,
    classificationConfidence: string
  ): RiskEngineOutput => {
    let score = 0;
    const riskFactors: DbRiskFactor[] = [];

    // Factor 1: High severity findings (inpainting, erasure, tampering)
    const highSeverityCount = findings.filter(f => f.severity === 'high').length;
    if (highSeverityCount > 0) {
      const contribution = Math.min(95, Math.max(75, highSeverityCount * 40));
      score += contribution;
      riskFactors.push({
        id: `rf_${Date.now()}_1`,
        scanId,
        factor: 'High Severity Forensic Anomalies',
        weight: 60,
        contribution,
        explanation: `${highSeverityCount} high-severity digital inpainting / erasure / tampering anomaly indicator(s) detected.`,
      });
    }

    // Factor 2: Medium severity findings
    const mediumSeverityCount = findings.filter(f => f.severity === 'medium').length;
    if (mediumSeverityCount > 0) {
      const contribution = Math.min(40, mediumSeverityCount * 20);
      score += contribution;
      riskFactors.push({
        id: `rf_${Date.now()}_2`,
        scanId,
        factor: 'Medium Severity Variances',
        weight: 25,
        contribution,
        explanation: `${mediumSeverityCount} medium-severity typography or boundary irregularity indicator(s).`,
      });
    }

    // Factor 3: QR Code payload mismatch
    if (!qrMatches) {
      const contribution = 40;
      score += contribution;
      riskFactors.push({
        id: `rf_${Date.now()}_3`,
        scanId,
        factor: 'Barcode / QR Signature Mismatch',
        weight: 40,
        contribution,
        explanation: 'Printed text field values do not match embedded QR digital signature payload.',
      });
    }

    // Factor 4: Low OCR confidence
    if (ocrConfidence < 60) {
      const contribution = 20;
      score += contribution;
      riskFactors.push({
        id: `rf_${Date.now()}_4`,
        scanId,
        factor: 'Low Text Extraction Confidence',
        weight: 20,
        contribution,
        explanation: `OCR text readability confidence was low (${ocrConfidence}%).`,
      });
    }

    // Clamp score 0 to 100
    const finalScore = Math.min(100, Math.max(0, score));

    // Determine Risk Level & Human-Readable Verdict
    let riskLevel: 'low' | 'medium' | 'high' | 'uncertain' = 'low';
    let verdict = 'No suspicious regions detected.';
    let summary = 'Document exhibits consistent paper substrate texture and no visual inpainting or alterations.';

    if (finalScore >= 70 || highSeverityCount > 0) {
      riskLevel = 'high';
      verdict = 'Suspicious forensic anomalies detected. Manual review required.';
      const findingTitles = findings.map(f => f.title).join('; ');
      summary = `Forensic inspection flagged high-severity issue(s): ${findingTitles || 'Suspicious inpainting, erasure, or text alteration detected.'}`;
    } else if (finalScore >= 30 || mediumSeverityCount > 0) {
      riskLevel = 'medium';
      verdict = 'Some document regions require secondary review.';
      summary = 'Document passed basic formatting checks but contains layout or texture contrast variances.';
    } else {
      riskLevel = 'low';
      verdict = 'Document passed forensic inspection.';
      summary = 'Document surface exhibits unbroken paper substrate texture, consistent kerning, and no digital inpainting.';
    }

    return {
      riskScore: finalScore,
      riskLevel,
      verdict,
      summary,
      riskFactors,
    };
  },
};
