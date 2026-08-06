import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { NATIVE } from './platform';
import * as storage from './storage';

/**
 * Axios instance with JWT access/refresh handling:
 *  - access token attached to every request
 *  - on 401, one refresh attempt (single-flight), then the request is retried
 *  - refresh failure clears the session and sends the user to /login
 *
 * VITE_API_URL points at the API origin when client and server are deployed
 * separately (e.g. Vercel + Render). Unset in dev → relative URLs through the
 * Vite proxy.
 *
 * In the Android app there is no proxy and no same-origin server: the WebView
 * is served from https://localhost, so a relative URL would resolve to the
 * bundle itself. VITE_API_URL is therefore **required** for native builds and
 * its absence is reported loudly rather than failing as a wall of 404s.
 */
export const API_ORIGIN: string = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, '') ?? '';

/** Non-null when the build is unusable as configured — rendered as a boot error. */
export const API_CONFIG_ERROR: string | null =
  NATIVE && !API_ORIGIN
    ? 'VITE_API_URL is not set. The Android build needs an absolute API URL — see MOBILE.md.'
    : null;

if (API_CONFIG_ERROR) console.error(`[api] ${API_CONFIG_ERROR}`);

const API_BASE = `${API_ORIGIN}/api/v1`;

export const api = axios.create({ baseURL: API_BASE });

const store = {
  get access() {
    return storage.get('accessToken');
  },
  get refresh() {
    return storage.get('refreshToken');
  },
  set(tokens: { accessToken: string; refreshToken: string }) {
    storage.set('accessToken', tokens.accessToken);
    storage.set('refreshToken', tokens.refreshToken);
  },
  clear() {
    storage.remove('accessToken');
    storage.remove('refreshToken');
    storage.remove('authUser');
    storage.remove('authGym');
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
  const { data } = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken });
  store.set(data);
  return data.accessToken as string;
}

/** Fired when the platform admin has frozen this gym (any request → 403 GYM_FROZEN). */
export const GYM_FROZEN_EVENT = 'gym-frozen';

/**
 * Fired when the refresh token is gone or rejected. The auth context listens
 * and clears the session, which routes back to login through React Router —
 * a hard `window.location` assignment would reload the whole bundle and, in
 * the Android WebView, navigate away from the app shell entirely.
 */
export const SESSION_EXPIRED_EVENT = 'session-expired';

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const data = error.response?.data as { error?: string; code?: string } | undefined;
    if (error.response?.status === 403 && data?.code === 'GYM_FROZEN') {
      window.dispatchEvent(new CustomEvent(GYM_FROZEN_EVENT, { detail: data.error }));
      throw error;
    }
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
        window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
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
