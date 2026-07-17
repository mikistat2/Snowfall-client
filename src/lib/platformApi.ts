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
  clear: (): void => localStorage.removeItem('platformToken'),
};

platformApi.interceptors.request.use((config) => {
  const token = platformToken.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
