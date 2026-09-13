export type CarbonRole =
  | 'platform_admin'
  | 'regulator'
  | 'logistics_provider'
  | 'utilizer'
  | 'emitter';

export function normalizeRole(value: string | null | undefined): string {
  return (value || '').trim().toLowerCase().replace(/[\s-]+/g, '_');
}

export function resolveCarbonRole(
  roles: string[] | null | undefined,
  organizationType?: string | null
): CarbonRole {
  const normalizedRoles = (roles || []).map(normalizeRole);
  const normalizedOrganizationType = normalizeRole(organizationType);

  if (normalizedRoles.some((role) => ['platform_admin', 'admin', 'platform_administrator'].includes(role))) {
    return 'platform_admin';
  }
  if (
    normalizedRoles.some((role) => ['regulator', 'policy_regulator', 'gpcb'].includes(role)) ||
    ['regulator', 'policy_regulator'].includes(normalizedOrganizationType)
  ) {
    return 'regulator';
  }
  if (
    normalizedRoles.some((role) => ['logistics_provider', 'logistics', 'transporter'].includes(role)) ||
    ['logistics_provider', 'logistics'].includes(normalizedOrganizationType)
  ) {
    return 'logistics_provider';
  }
  if (
    normalizedRoles.some((role) => ['utilizer', 'buyer', 'carbon_utilizer'].includes(role)) ||
    ['buyer', 'utilizer'].includes(normalizedOrganizationType)
  ) {
    return 'utilizer';
  }
  return 'emitter';
}

export function hasCarbonRole(
  allowedRoles: string[],
  roles: string[] | null | undefined,
  organizationType?: string | null
): boolean {
  const resolvedRole = resolveCarbonRole(roles, organizationType);
  const normalizedAllowedRoles = allowedRoles.map(normalizeRole);

  if (normalizedAllowedRoles.includes(resolvedRole)) return true;
  if (resolvedRole === 'platform_admin' && normalizedAllowedRoles.includes('admin')) return true;
  if (resolvedRole === 'emitter' && normalizedAllowedRoles.includes('seller')) return true;
  if (resolvedRole === 'utilizer' && normalizedAllowedRoles.includes('buyer')) return true;
  if (resolvedRole === 'logistics_provider' && normalizedAllowedRoles.includes('logistics')) return true;
  if (resolvedRole === 'regulator' && normalizedAllowedRoles.includes('policy_regulator')) return true;
  return false;
}

export function getRoleHomePath(role: CarbonRole): string {
  if (role === 'platform_admin') return '/admin';
  if (role === 'logistics_provider') return '/logistics';
  return '/dashboard';
}
