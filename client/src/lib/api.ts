import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

/**
 * Axios instance with JWT access/refresh handling:
 *  - access token attached to every request
 *  - on 401, one refresh attempt (single-flight), then the request is retried
 *  - refresh failure clears the session and sends the user to /login
 */
export const api = axios.create({ baseURL: '/api/v1' });

const store = {
  get access() {
    return localStorage.getItem('accessToken');
  },
  get refresh() {
    return localStorage.getItem('refreshToken');
  },
  set(tokens: { accessToken: string; refreshToken: string }) {
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
  },
  clear() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('authUser');
    localStorage.removeItem('authGym');
  },
};

export const tokenStore = store;

api.interceptors.request.use((config) => {
  const token = store.access;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshing: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refreshToken = store.refresh;
  if (!refreshToken) throw new Error('no refresh token');
  const { data } = await axios.post('/api/v1/auth/refresh', { refreshToken });
  store.set(data);
  return data.accessToken as string;
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;
    if (error.response?.status === 401 && original && !original._retried && store.refresh) {
      original._retried = true;
      try {
        refreshing ??= refreshAccessToken().finally(() => {
          refreshing = null;
        });
        const token = await refreshing;
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      } catch {
        store.clear();
        window.location.href = '/login';
      }
    }
    throw error;
  },
);

export function apiErrorMessage(err: unknown): string {
  if (err instanceof AxiosError) {
    return (err.response?.data as { error?: string } | undefined)?.error ?? err.message;
  }
  return err instanceof Error ? err.message : 'Unknown error';
}
