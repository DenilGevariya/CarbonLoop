import { SubmitVerificationDTO, ProcessReviewDTO } from './verification.types';

export function validateSubmitVerification(body: any): { valid: boolean; error?: string; data?: SubmitVerificationDTO } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body must be an object.' };
  }

  const { organizationId, facilityId, listingId, documentId, verificationType, notes } = body;

  if (!organizationId || typeof organizationId !== 'string') {
    return { valid: false, error: 'organizationId is required.' };
  }

  if (!verificationType || typeof verificationType !== 'string') {
    return { valid: false, error: 'verificationType is required.' };
  }

  const validTypes = ['ORGANIZATION', 'FACILITY', 'CO2_PURITY', 'TECHNICAL_SPECIFICATION'];
  if (!validTypes.includes(verificationType.toUpperCase())) {
    return { valid: false, error: `Invalid verificationType. Must be one of: ${validTypes.join(', ')}` };
  }

  return {
    valid: true,
    data: {
      organizationId,
      facilityId: facilityId || undefined,
      listingId: listingId || undefined,
      documentId: documentId || undefined,
      verificationType: verificationType.toUpperCase() as any,
      notes: notes || undefined,
    },
  };
}

export function validateProcessReview(body: any): { valid: boolean; error?: string; data?: ProcessReviewDTO } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body must be an object.' };
  }

  const { action, notes, reason, expiryMonths, latestVerifiedPurity } = body;

  const validActions = ['START', 'APPROVE', 'REJECT', 'REQUEST_CHANGES'];
  if (!action || typeof action !== 'string' || !validActions.includes(action.toUpperCase())) {
    return { valid: false, error: `action must be one of: ${validActions.join(', ')}` };
  }

  if ((action === 'REJECT' || action === 'REQUEST_CHANGES') && (!notes && !reason)) {
    return { valid: false, error: 'Notes or reason is required when rejecting or requesting changes.' };
  }

  return {
    valid: true,
    data: {
      action: action.toUpperCase() as any,
      notes: notes || undefined,
      reason: reason || undefined,
      expiryMonths: typeof expiryMonths === 'number' ? expiryMonths : undefined,
      latestVerifiedPurity: typeof latestVerifiedPurity === 'number' ? latestVerifiedPurity : undefined,
    },
  };
}
