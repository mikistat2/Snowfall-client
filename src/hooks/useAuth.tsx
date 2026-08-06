import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, tokenStore, SESSION_EXPIRED_EVENT } from '../lib/api';
import * as storage from '../lib/storage';
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

export function AuthProvider({ children }: { children: ReactNode }) {
  // storage.hydrate() has already run in main.tsx, so these reads are warm
  // even on Android where the backing store is async.
  const [user, setUser] = useState<AuthUser | null>(() => storage.getJson<AuthUser>('authUser'));
  const [gym, setGym] = useState<{ id: number; name: string } | null>(() =>
    storage.getJson<{ id: number; name: string }>('authGym'),
  );

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
    setGym(data.gym);
  }

  function clearSession() {
    tokenStore.clear();
    setUser(null);
    setGym(null);
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
