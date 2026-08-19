import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api, tokenStore, SESSION_EXPIRED_EVENT } from '../lib/api';
import * as storage from '../lib/storage';
import * as settingsApi from '../api/settings';
import { qk } from './queries/keys';
import type { AuthUser } from '../lib/types';

interface AuthState {
  user: AuthUser | null;
  gym: { id: number; name: string } | null;
  login: (email: string, password: string) => Promise<void>;
  /** Resolves { pending: true } when the registration awaits platform-admin approval (no session started). */
  registerGym: (payload: unknown) => Promise<{ pending: boolean }>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

type SessionGym = { id: number; name: string };

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  // storage.hydrate() has already run in main.tsx, so these reads are warm
  // even on Android where the backing store is async.
  const [user, setUser] = useState<AuthUser | null>(() => storage.getJson<AuthUser>('authUser'));
  const [storedGym, setStoredGym] = useState<SessionGym | null>(() =>
    storage.getJson<SessionGym>('authGym'),
  );

  /**
   * The gym in the session is only a login-time snapshot, and an owner can
   * rename their gym from Settings mid-session. Every screen that shows the
   * name — the sidebar, the dashboard heading, the phone's hero, the members
   * PDF — reads it from here, so the rename has to land here or it lands
   * nowhere until the next login.
   *
   * The settings query is therefore the source of truth as soon as it
   * resolves, and the stored snapshot is only the seed for a cold start.
   * Saving in Settings already invalidates this key, so the new name
   * propagates everywhere on the next render with nothing to wire per screen.
   */
  const gymQuery = useQuery({
    queryKey: qk.settings,
    queryFn: settingsApi.getGym,
    enabled: Boolean(user),
    staleTime: 60_000,
  });

  // Memoised so the storage-sync effect below is not re-run by identity alone.
  const fresh = gymQuery.data;
  const gym: SessionGym | null = useMemo(
    () => (fresh ? { id: fresh.id, name: fresh.name } : storedGym),
    [fresh, storedGym],
  );

  // Keep the snapshot current so the next cold start opens on the right name
  // rather than flashing the old one until the query resolves.
  useEffect(() => {
    if (!gym) return;
    if (storedGym?.id === gym.id && storedGym.name === gym.name) return;
    storage.setJson('authGym', gym);
    setStoredGym(gym);
  }, [gym, storedGym]);

  function apply(data: {
    accessToken: string;
    refreshToken: string;
    user: AuthUser;
    gym: { id: number; name: string };
  }) {
    tokenStore.set(data);
    storage.setJson('authUser', data.user);
    storage.setJson('authGym', data.gym);
    setUser(data.user);
    setStoredGym(data.gym);
    // Whatever the previous session cached belongs to a different gym.
    queryClient.clear();
  }

  function clearSession() {
    tokenStore.clear();
    setUser(null);
    setStoredGym(null);
    // Without this the next account on this device — a shared phone or the
    // kiosk — would render the previous gym's members and figures from cache
    // until every query refetched.
    queryClient.clear();
  }

  // A failed token refresh clears state here rather than in the axios
  // interceptor, so the app re-renders into the login route instead of
  // reloading the bundle.
  useEffect(() => {
    const onExpired = () => clearSession();
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, []);

  const value: AuthState = {
    user,
    gym,
    async login(email, password) {
      const { data } = await api.post('/auth/login', { email, password });
      apply(data);
    },
    async registerGym(payload) {
      const { data } = await api.post('/auth/register-gym', payload);
      if (data.pending) return { pending: true }; // awaiting admin approval — no tokens yet
      apply(data);
      return { pending: false };
    },
    logout() {
      const refreshToken = tokenStore.refresh;
      if (refreshToken) void api.post('/auth/logout', { refreshToken }).catch(() => undefined);
      clearSession();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
