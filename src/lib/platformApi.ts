import axios from 'axios';
import { API_ORIGIN } from './api';

/**
 * Dedicated axios instance for the /platform super-admin panel. Uses its own
 * token (localStorage 'platformToken') so it never collides with a gym staff
 * session in the same browser.
 */
export const platformApi = axios.create({ baseURL: `${API_ORIGIN}/api/v1/admin` });

export const platformToken = {
  get: (): string | null => localStorage.getItem('platformToken'),
  set: (token: string): void => localStorage.setItem('platformToken', token),
  clear: (): void => {
    localStorage.removeItem('platformToken');
    localStorage.removeItem('platformProfile');
  },
};

/** What the signed-in platform account is allowed to do (owner = everything). */
export interface PlatformPerms {
  approve: boolean;
  freeze: boolean;
  renew: boolean;
  export: boolean;
}

export interface PlatformProfile {
  role: 'owner' | 'admin';
  name: string;
  permissions: PlatformPerms;
}

export const platformProfile = {
  get: (): PlatformProfile | null => {
    try {
      const raw = localStorage.getItem('platformProfile');
      return raw ? (JSON.parse(raw) as PlatformProfile) : null;
    } catch {
      return null;
    }
  },
  set: (profile: PlatformProfile): void => localStorage.setItem('platformProfile', JSON.stringify(profile)),
};

platformApi.interceptors.request.use((config) => {
  const token = platformToken.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
