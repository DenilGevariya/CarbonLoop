const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export class ApiError extends Error {
  public code: string;
  public status: number;

  constructor(message: string, status: number, code: string = 'API_ERROR') {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('carbonloop_token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new ApiError(
      data.error?.message || 'An error occurred during API request',
      response.status,
      data.error?.code || 'UNKNOWN_ERROR'
    );
  }

  return data.data !== undefined ? data.data : data;
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { method: 'GET', ...options }),

  post: <T>(endpoint: string, body?: any, options?: RequestInit) =>
    request<T>(endpoint, { method: 'POST', body: JSON.stringify(body), ...options }),

  put: <T>(endpoint: string, body?: any, options?: RequestInit) =>
    request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body), ...options }),

  delete: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { method: 'DELETE', ...options }),
};
