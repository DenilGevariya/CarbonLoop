export type VerificationType = 'ORGANIZATION' | 'FACILITY' | 'CO2_PURITY' | 'TECHNICAL_SPECIFICATION';

export interface VerificationRule {
  type: VerificationType;
  label: string;
  description: string;
  requiredDocumentTypes: string[];
  recommendedDocumentTypes: string[];
  defaultExpiryMonths: number;
}

export const VERIFICATION_RULES: Record<VerificationType, VerificationRule> = {
  ORGANIZATION: {
    type: 'ORGANIZATION',
    label: 'Organization Commercial & Environmental Identity',
    description: 'Verifies entity legal registration, environmental operating license, and corporate integrity.',
    requiredDocumentTypes: ['COMPANY_REGISTRATION', 'ENVIRONMENTAL_CERTIFICATE'],
    recommendedDocumentTypes: ['FACILITY_LICENSE', 'SAFETY_CERTIFICATE'],
    defaultExpiryMonths: 12,
  },
  FACILITY: {
    type: 'FACILITY',
    label: 'Industrial Facility & Capture Site Verification',
    description: 'Verifies plant location, operational license, emission monitoring infrastructure, and safety standards.',
    requiredDocumentTypes: ['FACILITY_LICENSE'],
    recommendedDocumentTypes: ['CAPTURE_PROCESS_DOCUMENT', 'SAFETY_CERTIFICATE', 'ENVIRONMENTAL_CERTIFICATE'],
    defaultExpiryMonths: 12,
  },
  CO2_PURITY: {
    type: 'CO2_PURITY',
    label: 'CO₂ Chemical Stream & Laboratory Purity Verification',
    description: 'Validates certified laboratory analysis report and gas purity assay documentation.',
    requiredDocumentTypes: ['CO2_PURITY_CERTIFICATE', 'LAB_REPORT'],
    recommendedDocumentTypes: ['TECHNICAL_SPECIFICATION'],
    defaultExpiryMonths: 6,
  },
  TECHNICAL_SPECIFICATION: {
    type: 'TECHNICAL_SPECIFICATION',
    label: 'CO₂ Technical Specification & Stream Composition',
    description: 'Validates stream temperature, pressure, physical state, and impurity breakdown.',
    requiredDocumentTypes: ['TECHNICAL_SPECIFICATION'],
    recommendedDocumentTypes: ['CO2_PURITY_CERTIFICATE', 'LAB_REPORT'],
    defaultExpiryMonths: 6,
  },
};

export function getVerificationRule(type: string): VerificationRule | null {
  const normalized = type.toUpperCase().replace(/\s+/g, '_') as VerificationType;
  return VERIFICATION_RULES[normalized] || null;
}

export function validateRequiredDocuments(
  type: string,
  attachedDocTypes: string[]
): { valid: boolean; missingDocumentTypes: string[] } {
  const rule = getVerificationRule(type);
  if (!rule) return { valid: true, missingDocumentTypes: [] };

  const attachedSet = new Set(attachedDocTypes.map((d) => d.toUpperCase()));
  const missing = rule.requiredDocumentTypes.filter((req) => !attachedSet.has(req.toUpperCase()));

  return {
    valid: missing.length === 0,
    missingDocumentTypes: missing,
  };
}
