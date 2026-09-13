import { apiRequest } from '@/lib/api';

export class ApiError extends Error {
  public code: string;
  public status: number;

  constructor(message: string, status: number, code: string = 'API_ERROR') {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export type CollectionResponse<T> = {
  data?: T[];
  items?: T[];
  pagination?: { page: number; limit: number; total: number; totalPages: number };
  total?: number;
};

export function extractCollection<T>(response: T[] | CollectionResponse<T> | null | undefined): T[] {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.items)) return response.items;
  return [];
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await apiRequest<any>(endpoint, options);

  if (!res.success) {
    const error = res.error;
    throw new ApiError(
      error?.message || 'An error occurred during API request',
      res.status || 500,
      error?.code || 'UNKNOWN_ERROR'
    );
  }

  // Strip only the envelope fields (success, error) and return everything else.
  // This preserves top-level pagination, items, stats, data, etc.
  const { success: _s, error: _e, status: _status, ...rest } = res;

  // If there are no extra keys beyond data, return data directly (simple objects/arrays)
  const restKeys = Object.keys(rest);
  if (restKeys.length === 1 && 'data' in rest) {
    return rest.data as T;
  }

  // Otherwise return the full payload (e.g. { data, pagination } or { items, pagination } or { kpis, health })
  return rest as unknown as T;
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { method: 'GET', ...options }),

  post: <T>(endpoint: string, body?: any, options?: RequestInit) =>
    request<T>(endpoint, { method: 'POST', body: JSON.stringify(body), ...options }),

  put: <T>(endpoint: string, body?: any, options?: RequestInit) =>
    request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body), ...options }),

  patch: <T>(endpoint: string, body?: any, options?: RequestInit) =>
    request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body), ...options }),

  delete: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { method: 'DELETE', ...options }),
};
