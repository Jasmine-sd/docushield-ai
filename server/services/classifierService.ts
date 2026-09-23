export interface ClassificationResult {
  documentType: string;
  documentCategory: 'identity' | 'education' | 'employment' | 'financial' | 'government' | 'other';
  confidence: 'High confidence' | 'Medium confidence' | 'Low confidence' | 'Manual selection';
  reason: string;
}

export const classifierService = {
  classify: (
    fileName: string,
    fullText: string,
    extractedFields?: Record<string, string>,
    userOverrideType?: string
  ): ClassificationResult => {
    if (userOverrideType && userOverrideType.trim()) {
      return {
        documentType: userOverrideType,
        documentCategory: classifierService.getCategoryForType(userOverrideType),
        confidence: 'Manual selection',
        reason: 'User explicitly selected document type.',
      };
    }

    const text = (fullText + ' ' + fileName).toLowerCase();

    if (text.includes('aadhaar') || text.includes('aadhar') || text.includes('uidai') || text.includes('government of india')) {
      return {
        documentType: 'Aadhaar Card',
        documentCategory: 'identity',
        confidence: 'High confidence',
        reason: 'UIDAI government header and Aadhaar number pattern detected.',
      };
    }

    if (text.includes('pan') || text.includes('permanent account number') || text.includes('income tax department')) {
      return {
        documentType: 'PAN Card',
        documentCategory: 'identity',
        confidence: 'High confidence',
        reason: 'Income Tax Department headers and 10-character PAN syntax detected.',
      };
    }

    if (text.includes('passport') || text.includes('mrz') || text.includes('p<ind')) {
      return {
        documentType: 'Passport',
        documentCategory: 'identity',
        confidence: 'High confidence',
        reason: 'International passport standard MRZ lines and Republic of India header detected.',
      };
    }

    if (text.includes('driving') || text.includes('licence') || text.includes('license') || text.includes('dl no')) {
      return {
        documentType: 'Driving Licence',
        documentCategory: 'identity',
        confidence: 'High confidence',
        reason: 'Transport department header and Driving Licence serial syntax detected.',
      };
    }

    if (text.includes('degree') || text.includes('bachelor') || text.includes('convocation') || text.includes('university')) {
      return {
        documentType: 'Degree Certificate',
        documentCategory: 'education',
        confidence: 'High confidence',
        reason: 'Institutional seal, university title, and degree award statement detected.',
      };
    }

    if (text.includes('mark') || text.includes('grade') || text.includes('transcript') || text.includes('cgpa')) {
      return {
        documentType: 'Marksheet',
        documentCategory: 'education',
        confidence: 'High confidence',
        reason: 'Academic mark schedule, semester codes, and CGPA metrics detected.',
      };
    }

    if (text.includes('experience') || text.includes('relieving') || text.includes('employment')) {
      return {
        documentType: 'Experience Certificate',
        documentCategory: 'employment',
        confidence: 'High confidence',
        reason: 'Corporate HR letterhead and service tenure statement detected.',
      };
    }

    if (text.includes('invoice') || text.includes('tax invoice') || text.includes('bill to')) {
      return {
        documentType: 'Invoice',
        documentCategory: 'financial',
        confidence: 'High confidence',
        reason: 'Financial invoice table, GSTIN/VAT fields, and line items detected.',
      };
    }

    return {
      documentType: 'Government ID',
      documentCategory: 'identity',
      confidence: 'Medium confidence',
      reason: 'General identity layout detected.',
    };
  },

  getCategoryForType: (
    type: string
  ): 'identity' | 'education' | 'employment' | 'financial' | 'government' | 'other' => {
    const t = type.toLowerCase();
    if (['aadhaar card', 'pan card', 'passport', 'driving licence', 'voter id', 'government id'].includes(t)) {
      return 'identity';
    }
    if (['degree certificate', 'marksheet', 'bonafide certificate'].includes(t)) {
      return 'education';
    }
    if (['experience certificate', 'employment document', 'offer letter'].includes(t)) {
      return 'employment';
    }
    if (['invoice', 'tax document', 'bank statement'].includes(t)) {
      return 'financial';
    }
    if (['birth certificate', 'income certificate'].includes(t)) {
      return 'government';
    }
    return 'other';
  },
};
