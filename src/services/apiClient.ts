export interface ApiResponse<T = any> {
  success: boolean;
  status?: number;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

const getAuthToken = (): string | null => {
  return localStorage.getItem('docusentry_token');
};

const parseJsonResponse = async (res: Response) => {
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await res.text();
    return {
      success: false,
      status: res.status,
      error: {
        code: 'INVALID_RESPONSE',
        message: `Server returned non-JSON response (${res.status}): ${text.substring(0, 100)}...`,
      },
    };
  }
  const data = await res.json();
  return { status: res.status, ...data };
};

export const apiClient = {
  get: async <T = any>(endpoint: string): Promise<ApiResponse<T>> => {
    try {
      const token = getAuthToken();
      const res = await fetch(`/api/v1${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      return await parseJsonResponse(res);
    } catch (err: any) {
      console.warn(`API GET ${endpoint} failed, error:`, err);
      return { success: false, status: 500, error: { code: 'NETWORK_ERROR', message: err.message } };
    }
  },

  post: async <T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> => {
    try {
      const token = getAuthToken();
      const isFormData = body instanceof FormData;
      const headers: Record<string, string> = {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };
      if (!isFormData) {
        headers['Content-Type'] = 'application/json';
      }

      const res = await fetch(`/api/v1${endpoint}`, {
        method: 'POST',
        headers,
        body: isFormData ? body : JSON.stringify(body || {}),
      });
      return await parseJsonResponse(res);
    } catch (err: any) {
      console.warn(`API POST ${endpoint} failed, error:`, err);
      return { success: false, status: 500, error: { code: 'NETWORK_ERROR', message: err.message } };
    }
  },

  patch: async <T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> => {
    try {
      const token = getAuthToken();
      const res = await fetch(`/api/v1${endpoint}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body || {}),
      });
      return await parseJsonResponse(res);
    } catch (err: any) {
      return { success: false, error: { code: 'NETWORK_ERROR', message: err.message } };
    }
  },

  delete: async <T = any>(endpoint: string): Promise<ApiResponse<T>> => {
    try {
      const token = getAuthToken();
      const res = await fetch(`/api/v1${endpoint}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      return await parseJsonResponse(res);
    } catch (err: any) {
      return { success: false, error: { code: 'NETWORK_ERROR', message: err.message } };
    }
  },
};
