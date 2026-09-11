import { ListingStatus } from './listing.types';

// Valid listing status transitions map
export const VALID_STATUS_TRANSITIONS: Record<string, ListingStatus[]> = {
  DRAFT: ['PUBLISHED', 'ARCHIVED'],
  PUBLISHED: ['PAUSED', 'EXHAUSTED', 'EXPIRED', 'ARCHIVED'],
  PAUSED: ['PUBLISHED', 'ARCHIVED'],
  EXHAUSTED: ['ARCHIVED'],
  EXPIRED: ['ARCHIVED'],
  ARCHIVED: [],
  // Legacy aliases
  ACTIVE: ['PAUSED', 'EXHAUSTED', 'EXPIRED', 'ARCHIVED'],
  reserved: ['PUBLISHED', 'ARCHIVED'],
  cancelled: ['ARCHIVED'],
};

// Safe Whitelist for SQL ORDER BY column mapping
export const SORT_FIELDS_WHITELIST: Record<string, string> = {
  price_asc: 'l.price_per_unit ASC',
  price_desc: 'l.price_per_unit DESC',
  purity_asc: 'l.purity_percentage ASC',
  purity_desc: 'l.purity_percentage DESC',
  quantity_asc: 'l.available_quantity ASC',
  quantity_desc: 'l.available_quantity DESC',
  newest: 'l.created_at DESC',
  oldest: 'l.created_at ASC',
};

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 12;
export const MAX_LIMIT = 100;
