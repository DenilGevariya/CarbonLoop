import { RequirementStatus } from './requirements.types';

export const VALID_STATUS_TRANSITIONS: Record<RequirementStatus, RequirementStatus[]> = {
  DRAFT: ['PUBLISHED', 'ARCHIVED'],
  PUBLISHED: ['PAUSED', 'FULFILLED', 'EXPIRED', 'ARCHIVED'],
  ACTIVE: ['PAUSED', 'FULFILLED', 'EXPIRED', 'ARCHIVED'],
  PAUSED: ['PUBLISHED', 'ARCHIVED'],
  FULFILLED: ['ARCHIVED'],
  EXPIRED: ['ARCHIVED'],
  ARCHIVED: [],
};

export const ALLOWED_SORT_FIELDS: Record<string, string> = {
  newest: 'br.created_at DESC',
  oldest: 'br.created_at ASC',
  quantity_high: 'br.required_quantity DESC',
  quantity_low: 'br.required_quantity ASC',
  purity_high: 'br.minimum_purity DESC',
  price_low: 'br.maximum_price_per_unit ASC NULLS LAST',
  price_high: 'br.maximum_price_per_unit DESC NULLS LAST',
  priority: "CASE br.priority WHEN 'urgent' THEN 1 WHEN 'high' THEN 2 WHEN 'normal' THEN 3 ELSE 4 END ASC",
  timeline: 'br.required_from ASC NULLS LAST',
};

export const PHYSICAL_FORMS = [
  'liquid',
  'gaseous',
  'supercritical',
  'solid_dry_ice',
] as const;

export const PRIORITIES = ['normal', 'high', 'urgent'] as const;
