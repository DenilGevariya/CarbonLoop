// Centralized API Client with JWT Bearer Auth & Automatic 401 Refresh Interceptor

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

let accessTokenMemory: string | null = null;
let activeOrganizationId: string | null = null;
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

export function getMemoryToken(): string | null {
  return accessTokenMemory;
}

export function setMemoryToken(token: string | null) {
  accessTokenMemory = token;
}

export function setActiveOrganizationId(organizationId: string | null) {
  activeOrganizationId = organizationId;
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {},
  isRetry = false
): Promise<{ success: boolean; status?: number; data?: T; error?: { code: string; message: string } }> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (accessTokenMemory) {
    headers['Authorization'] = `Bearer ${accessTokenMemory}`;
  }

  if (activeOrganizationId) {
    headers['x-organization-id'] = activeOrganizationId;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Ensure HttpOnly cookies sent
    });

    // 401 Unauthorized handling for token expiration
    if (response.status === 401 && !isRetry && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh')) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshRes = await apiRequest('/auth/refresh', { method: 'POST' }, true);
          if (refreshRes.success && refreshRes.data?.accessToken) {
            const newToken = refreshRes.data.accessToken;
            setMemoryToken(newToken);
            isRefreshing = false;
            onRefreshed(newToken);
            return apiRequest<T>(endpoint, options, true);
          } else {
            setMemoryToken(null);
            isRefreshing = false;
          }
        } catch {
          setMemoryToken(null);
          isRefreshing = false;
        }
      } else {
        // Queue request while refresh is in flight
        return new Promise((resolve) => {
          addRefreshSubscriber((newToken) => {
            headers['Authorization'] = `Bearer ${newToken}`;
            resolve(apiRequest<T>(endpoint, { ...options, headers }, true));
          });
        });
      }
    }

    const data = await response.json();
    return {
      ...data,
      status: response.status,
      error: typeof data.error === 'string'
        ? { code: 'API_ERROR', message: data.error }
        : data.error,
    };
  } catch (err: any) {
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: err?.message || 'Failed to communicate with CarbonLoop server.',
      },
    };
  }
}
