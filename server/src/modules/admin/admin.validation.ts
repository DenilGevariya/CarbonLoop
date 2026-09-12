export function validateOrganizationStatusChange(body: any): { valid: boolean; error?: string; status?: string; reason?: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body must be an object.' };
  }

  const { status, reason } = body;
  const validStatuses = ['ACTIVE', 'SUSPENDED', 'ARCHIVED'];

  if (!status || !validStatuses.includes(status.toUpperCase())) {
    return { valid: false, error: `Status must be one of: ${validStatuses.join(', ')}` };
  }

  if (status.toUpperCase() === 'SUSPENDED' && (!reason || typeof reason !== 'string' || reason.trim().length === 0)) {
    return { valid: false, error: 'A non-empty suspension reason is required.' };
  }

  return {
    valid: true,
    status: status.toUpperCase(),
    reason: reason ? reason.trim() : undefined,
  };
}

export function validateAlertResolution(body: any): { valid: boolean; error?: string; notes?: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body must be an object.' };
  }

  return {
    valid: true,
    notes: body.notes ? String(body.notes).trim() : 'Alert resolved by platform admin.',
  };
}
