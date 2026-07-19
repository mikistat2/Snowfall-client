import { createContext, useContext, useState, type ReactNode } from 'react';
import { api, tokenStore } from '../lib/api';
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

function readJson<T>(key: string): T | null {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readJson<AuthUser>('authUser'));
  const [gym, setGym] = useState<{ id: number; name: string } | null>(() => readJson('authGym'));

  function apply(data: {
    accessToken: string;
    refreshToken: string;
    user: AuthUser;
    gym: { id: number; name: string };
  }) {
    tokenStore.set(data);
    localStorage.setItem('authUser', JSON.stringify(data.user));
    localStorage.setItem('authGym', JSON.stringify(data.gym));
    setUser(data.user);
    setGym(data.gym);
  }

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
      tokenStore.clear();
      setUser(null);
      setGym(null);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
